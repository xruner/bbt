import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { toast } from 'sonner';
import { getAvailableTimeslots } from '@/lib/api';

// 表单验证schema
const formSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  type: z.string().min(1, '请选择拍摄类型')
});

export default function Booking() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  // 获取可预约时段数据
  const [availableSlots, setAvailableSlots] = useState<Array<{
    date: string;
    slots: Array<{
      start: string;
      end: string;
      available: boolean;
    }>;
  }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
  const fetchSlots = async () => {
    try {
      setLoadingSlots(true);
      console.log('开始获取可预约时段数据');
      const data = await getAvailableTimeslots();
      console.log('成功获取时段数据:', data);
      setAvailableSlots(data);
    } catch (error) {
      console.error('获取可预约时段失败:', error);
      toast.error('获取可预约时段失败');
      // 设置默认数据防止白屏
      setAvailableSlots([{
        date: new Date().toISOString().split('T')[0],
        slots: [
          { start: '09:00', end: '12:00', available: true },
          { start: '14:00', end: '18:00', available: true }
        ]
      }]);
    } finally {
      setLoadingSlots(false);
    }
  };

    fetchSlots();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    try {
      formSchema.parse(formData);
      if (!selectedDate || !selectedSlot) {
        toast.error('请选择预约时间');
        return false;
      }
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

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // 模拟API调用
    const mockResponse = {
      id: "ABC" + Math.floor(Math.random() * 1000),
      confirmCode: "XYZ" + Math.floor(Math.random() * 1000)
    };
    
    toast.success('预约成功!');
    setTimeout(() => {
      navigate('/my-appointments');
    }, 1500);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-[#3498db] text-white p-4 flex items-center">
        <button 
          onClick={() => navigate('/')}
          className="mr-4"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="text-xl font-bold">影楼预约</h1>
      </nav>

      <div className="container mx-auto p-4 pb-20">
        {/* 表单部分 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-lg font-semibold mb-4 text-[#3498db]">预约信息</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${errors.name ? 'border-[#e74c3c]' : 'border-gray-300'}`}
              />
              {errors.name && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-[#e74c3c] mt-1"
                >
                  {errors.name}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${errors.email ? 'border-[#e74c3c]' : 'border-gray-300'}`}
              />
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-[#e74c3c] mt-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${errors.phone ? 'border-[#e74c3c]' : 'border-gray-300'}`}
              />
              {errors.phone && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-[#e74c3c] mt-1"
                >
                  {errors.phone}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">拍摄类型</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${errors.type ? 'border-[#e74c3c]' : 'border-gray-300'}`}
              >
                <option value="">请选择</option>
                <option value="个人写真">个人写真</option>
                <option value="婚纱摄影">婚纱摄影</option>
                <option value="亲子照">亲子照</option>
                <option value="证件照">证件照</option>
              </select>
              {errors.type && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-[#e74c3c] mt-1"
                >
                  {errors.type}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>

        {/* 日历部分 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-lg font-semibold mb-4 text-[#3498db]">选择时间</h2>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="text-center font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {availableSlots.map((daySlot) => {
              const date = new Date(daySlot.date);
              const day = date.getDate();
              const hasAvailable = daySlot.slots.some(s => s.available);
              
              return (
                <motion.button
                  key={daySlot.date}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDateSelect(daySlot.date)}
                  className={`p-2 rounded-md text-center 
                    ${selectedDate === daySlot.date ? 'bg-[#3498db] text-white' : 
                      hasAvailable ? 'bg-[#2ecc71] text-white' : 'bg-gray-200 text-gray-700'}
                    ${!hasAvailable && 'opacity-50 cursor-not-allowed'}
                  `}
                  disabled={!hasAvailable}
                >
                  {day}
                </motion.button>
              );
            })}
          </div>

          {selectedDate && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 space-y-2"
            >
              <h3 className="font-medium">{selectedDate}</h3>
              <div className="space-y-2">
                {availableSlots
                  .find(d => d.date === selectedDate)?.slots
                  .map((slot, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleSlotSelect(`${slot.start}-${slot.end}`)}
                      className={`w-full p-2 rounded-md text-center 
                        ${selectedSlot === `${slot.start}-${slot.end}` ? 'bg-[#3498db] text-white' : 
                          slot.available ? 'bg-[#2ecc71] text-white' : 'bg-gray-200 text-gray-700'}
                        ${!slot.available && 'opacity-50 cursor-not-allowed'}
                      `}
                      disabled={!slot.available}
                    >
                      {slot.start} - {slot.end}
                    </motion.button>
                  ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* 底部提交按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
        <button
          onClick={handleSubmit}
          className="w-full bg-[#3498db] text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          提交预约
        </button>
      </div>
    </div>
  );
}
