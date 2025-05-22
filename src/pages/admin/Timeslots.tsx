import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { z } from 'zod';
import { toast } from 'sonner';

// 时段类型
type TimeSlot = {
  id: string;
  start: string;
  end: string;
  enabled: boolean;
};

// 特殊时段类型
type SpecialSlot = {
  id: string;
  date: string;
  slots: TimeSlot[];
};

// 表单验证schema
const timeSlotSchema = z.object({
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '无效的开始时间'),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '无效的结束时间')
}).refine(data => {
  const start = parseInt(data.start.replace(':', ''));
  const end = parseInt(data.end.replace(':', ''));
  return end > start;
}, '结束时间必须晚于开始时间');

// mock数据
const mockRegularSlots: TimeSlot[] = [
  { id: '1', start: '09:00', end: '12:00', enabled: true },
  { id: '2', start: '14:00', end: '18:00', enabled: true }
];

const mockSpecialSlots: SpecialSlot[] = [
  { 
    id: '1', 
    date: '2025-05-01', 
    slots: [
      { id: '1-1', start: '10:00', end: '15:00', enabled: true }
    ] 
  }
];

export default function Timeslots() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'regular' | 'special'>('regular');
  const [regularSlots, setRegularSlots] = useState<TimeSlot[]>(mockRegularSlots);
  const [specialSlots, setSpecialSlots] = useState<SpecialSlot[]>(mockSpecialSlots);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Omit<TimeSlot, 'id'>>({ 
    start: '', 
    end: '', 
    enabled: true 
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 处理拖拽结束
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    if (activeTab === 'regular') {
      const items = [...regularSlots];
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setRegularSlots(items);
    } else {
      const items = [...specialSlots];
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setSpecialSlots(items);
    }
  };

  // 验证表单
  const validateForm = () => {
    try {
      timeSlotSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = err.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {} as Record<string, string>);
        setErrors(newErrors);
      }
      return false;
    }
  };

  // 保存时段
  const handleSave = () => {
    if (!validateForm()) return;

    if (isEditing && selectedSlot) {
      // 更新现有时段
      if (activeTab === 'regular') {
        setRegularSlots(regularSlots.map(slot => 
          slot.id === selectedSlot.id ? { ...slot, ...formData } : slot
        ));
      } else {
        setSpecialSlots(specialSlots.map(special => ({
          ...special,
          slots: special.slots.map(slot => 
            slot.id === selectedSlot.id ? { ...slot, ...formData } : slot
          )
        })));
      }
    } else {
      // 添加新时段
      const newSlot = { ...formData, id: Date.now().toString() };
      if (activeTab === 'regular') {
        setRegularSlots([...regularSlots, newSlot]);
      } else {
        // 添加到第一个特殊时段或创建新的特殊时段
        if (specialSlots.length > 0) {
          setSpecialSlots(specialSlots.map((special, index) => 
            index === 0 ? { ...special, slots: [...special.slots, newSlot] } : special
          ));
        } else {
          setSpecialSlots([{ 
            id: Date.now().toString(), 
            date: new Date().toISOString().split('T')[0],
            slots: [newSlot] 
          }]);
        }
      }
    }

    toast.success('时段已保存');
    setSelectedSlot(null);
    setIsEditing(false);
    setFormData({ start: '', end: '', enabled: true });
  };

  // 删除时段
  const handleDelete = (id: string) => {
    toast('确定要删除此时段吗?', {
      action: {
        label: '删除',
        onClick: () => {
          if (activeTab === 'regular') {
            setRegularSlots(regularSlots.filter(slot => slot.id !== id));
          } else {
            setSpecialSlots(specialSlots.map(special => ({
              ...special,
              slots: special.slots.filter(slot => slot.id !== id)
            })).filter(special => special.slots.length > 0));
          }
          toast.success('时段已删除');
        }
      },
      cancel: {
        label: '取消'
      }
    });
  };

  // 检查时段冲突
  const checkConflicts = (newSlot: TimeSlot) => {
    const slotsToCheck = activeTab === 'regular' ? regularSlots : 
      specialSlots.flatMap(special => special.slots);

    return slotsToCheck.some(slot => {
      if (slot.id === newSlot.id) return false;
      
      const newStart = parseInt(newSlot.start.replace(':', ''));
      const newEnd = parseInt(newSlot.end.replace(':', ''));
      const slotStart = parseInt(slot.start.replace(':', ''));
      const slotEnd = parseInt(slot.end.replace(':', ''));
      
      return (newStart >= slotStart && newStart < slotEnd) || 
             (newEnd > slotStart && newEnd <= slotEnd) ||
             (newStart <= slotStart && newEnd >= slotEnd);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-[#1a365d] text-white p-4 flex justify-between items-center">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center space-x-2"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>返回</span>
        </button>
        <h1 className="text-xl font-bold">时段管理</h1>
        <div className="w-8"></div>
      </header>
      
      <div className="flex">
        {/* 侧边栏 - 复用Admin组件中的样式 */}
        <aside className="w-64 bg-[#1a365d] text-white min-h-screen p-4 hidden md:block">
          <nav className="space-y-2">
            <button 
              onClick={() => navigate('/admin')}
              className="w-full flex items-center space-x-2 p-3 rounded-lg hover:bg-[#2c5282]"
            >
              <i className="fa-solid fa-gauge"></i>
              <span>控制面板</span>
            </button>
            <button
              onClick={() => navigate('/admin/appointments')}
              className="w-full flex items-center space-x-2 p-3 rounded-lg hover:bg-[#2c5282]"
            >
              <i className="fa-solid fa-calendar"></i>
              <span>预约管理</span>
            </button>
            <button className="w-full flex items-center space-x-2 p-3 rounded-lg bg-[#2c5282]">
              <i className="fa-solid fa-clock"></i>
              <span>时段管理</span>
            </button>
            <button
              onClick={() => navigate('/admin/notifications')}
              className="w-full flex items-center space-x-2 p-3 rounded-lg hover:bg-[#2c5282]"
            >
              <i className="fa-solid fa-bell"></i>
              <span>通知系统</span>
            </button>
          </nav>
        </aside>
        
        {/* 主内容区 */}
        <main className="flex-1 p-4 md:p-6">
          {/* 时段类型切换 */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab('regular')}
              className={`px-4 py-2 font-medium ${activeTab === 'regular' ? 'text-[#3498db] border-b-2 border-[#3498db]' : 'text-gray-500'}`}
            >
              常规时段
            </button>
            <button
              onClick={() => setActiveTab('special')}
              className={`px-4 py-2 font-medium ${activeTab === 'special' ? 'text-[#3498db] border-b-2 border-[#3498db]' : 'text-gray-500'}`}
            >
              特殊时段
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 时段列表 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {activeTab === 'regular' ? '常规时段列表' : '特殊时段列表'}
                </h2>
                <button
                  onClick={() => {
                    setSelectedSlot(null);
                    setIsEditing(false);
                    setFormData({ start: '', end: '', enabled: true });
                  }}
                  className="bg-[#3498db] text-white px-3 py-1 rounded-md text-sm"
                >
                  <i className="fa-solid fa-plus mr-1"></i>添加
                </button>
              </div>
              
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="timeslots">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {activeTab === 'regular' ? (
                        regularSlots.length > 0 ? (
                          regularSlots.map((slot, index) => (
                            <Draggable key={slot.id} draggableId={slot.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => {
                                    setSelectedSlot(slot);
                                    setFormData({
                                      start: slot.start,
                                      end: slot.end,
                                      enabled: slot.enabled
                                    });
                                    setIsEditing(true);
                                  }}
                                  className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${
                                    slot.enabled ? 'bg-[#2ecc71]/20' : 'bg-gray-200 opacity-50'
                                  }`}
                                >
                                  <div>
                                    <span className="font-medium">{slot.start} - {slot.end}</span>
                                    <span className="ml-2 text-xs px-2 py-1 rounded-full bg-[#2ecc71] text-white">
                                      常规
                                    </span>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(slot.id);
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <i className="fa-solid fa-trash"></i>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-4">
                            暂无常规时段配置
                          </div>
                        )
                      ) : (
                        specialSlots.length > 0 ? (
                          specialSlots.flatMap((special, sIndex) => 
                            special.slots.map((slot, index) => (
                              <Draggable key={slot.id} draggableId={slot.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => {
                                      setSelectedSlot(slot);
                                      setFormData({
                                        start: slot.start,
                                        end: slot.end,
                                        enabled: slot.enabled
                                      });
                                      setIsEditing(true);
                                    }}
                                    className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${
                                      slot.enabled ? 'bg-[#f39c12]/20' : 'bg-gray-200 opacity-50'
                                    }`}
                                  >
                                    <div>
                                      <span className="font-medium">{slot.start} - {slot.end}</span>
                                      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-[#f39c12] text-white">
                                        特殊 ({special.date})
                                      </span>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(slot.id);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <i className="fa-solid fa-trash"></i>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          )
                        ) : (
                          <div className="text-center text-gray-500 py-4">
                            暂无特殊时段配置
                          </div>
                        )
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
            
            {/* 编辑面板 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">
                {isEditing ? '编辑时段' : '添加新时段'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                  <input
                    type="time"
                    value={formData.start}
                    onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                    className={`w-full p-2 border rounded-md ${errors.start ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.start && (
                    <p className="text-sm text-red-500 mt-1">{errors.start}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                  <input
                    type="time"
                    value={formData.end}
                    onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                    className={`w-full p-2 border rounded-md ${errors.end ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.end && (
                    <p className="text-sm text-red-500 mt-1">{errors.end}</p>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="h-4 w-4 text-[#3498db] focus:ring-[#3498db] border-gray-300 rounded"
                  />
                  <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
                    启用此时段
                  </label>
                </div>
                
                {checkConflicts({ ...formData, id: selectedSlot?.id || '' }) && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <i className="fa-solid fa-exclamation-triangle text-yellow-400"></i>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          注意：此时段与现有时段有重叠，可能会导致预约冲突。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setSelectedSlot(null);
                      setIsEditing(false);
                      setFormData({ start: '', end: '', enabled: true });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#3498db] text-white rounded-md hover:bg-[#2980b9]"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}