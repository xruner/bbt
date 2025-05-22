import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// 预约状态类型
type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

// 预约数据类型
interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  photographer?: string;
  notes?: string;
}

// 状态颜色映射
const statusColors: Record<AppointmentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

// 状态文本映射
const statusTexts: Record<AppointmentStatus, string> = {
  pending: '待处理',
  confirmed: '已确认',
  rejected: '已拒绝',
  cancelled: '已取消'
};

// mock数据生成函数
const generateMockAppointments = (count: number): Appointment[] => {
  const types = ['婚纱摄影', '个人写真', '亲子照', '证件照', '商业摄影'];
  const photographers = ['张摄影师', '李摄影师', '王摄影师', '赵摄影师', '刘摄影师'];
  const statuses: AppointmentStatus[] = ['pending', 'confirmed', 'rejected', 'cancelled'];
  
  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 30));
    
    return {
      id: `APP${1000 + i}`,
      name: `客户${i + 1}`,
      phone: `138${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `client${i + 1}@example.com`,
      type: types[Math.floor(Math.random() * types.length)],
      date: date.toISOString().split('T')[0],
      time: `${Math.floor(9 + Math.random() * 4)}:00-${Math.floor(13 + Math.random() * 5)}:00`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      photographer: photographers[Math.floor(Math.random() * photographers.length)],
      notes: i % 3 === 0 ? '有特殊要求' : undefined
    };
  });
};

// 分页大小
const PAGE_SIZE = 10;

export default function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // 初始化mock数据
  useEffect(() => {
    const mockData = generateMockAppointments(50);
    setAppointments(mockData);
    setFilteredAppointments(mockData);
  }, []);
  
  // 处理搜索和筛选
  useEffect(() => {
    let result = [...appointments];
    
    // 应用搜索条件
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(app => 
        app.name.toLowerCase().includes(term) || 
        app.phone.includes(term) ||
        app.email.toLowerCase().includes(term) ||
        app.type.toLowerCase().includes(term)
      );
    }
    
    // 应用状态筛选
    if (statusFilter !== 'all') {
      result = result.filter(app => app.status === statusFilter);
    }
    
    setFilteredAppointments(result);
    setCurrentPage(1); // 重置到第一页
  }, [searchTerm, statusFilter, appointments]);
  
  // 获取当前页数据
  const paginatedData = filteredAppointments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  
  // 总页数
  const totalPages = Math.ceil(filteredAppointments.length / PAGE_SIZE);
  
  // 处理选择预约
  const handleSelectAppointment = (id: string) => {
    setSelectedAppointments(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };
  
  // 处理全选/取消全选
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedAppointments(paginatedData.map(item => item.id));
    } else {
      setSelectedAppointments([]);
    }
  };
  
  // 批量确认预约
  const handleBatchConfirm = () => {
    if (selectedAppointments.length === 0) {
      toast.warning('请先选择预约');
      return;
    }
    
    toast('确定要确认这些预约吗?', {
      action: {
        label: '确认',
        onClick: () => {
          setAppointments(prev => 
            prev.map(app => 
              selectedAppointments.includes(app.id) 
                ? { ...app, status: 'confirmed' } 
                : app
            )
          );
          setSelectedAppointments([]);
          toast.success('预约已确认');
        }
      },
      cancel: {
        label: '取消'
      }
    });
  };
  
  // 批量删除预约
  const handleBatchDelete = () => {
    if (selectedAppointments.length === 0) {
      toast.warning('请先选择预约');
      return;
    }
    
    toast('确定要删除这些预约吗?', {
      action: {
        label: '删除',
        onClick: () => {
          setAppointments(prev => 
            prev.filter(app => !selectedAppointments.includes(app.id))
          );
          setSelectedAppointments([]);
          toast.success('预约已删除');
        }
      },
      cancel: {
        label: '取消'
      }
    });
  };
  
  // 查看详情
  const handleViewDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
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
        <h1 className="text-xl font-bold">预约管理</h1>
        <div className="w-8"></div> {/* 占位保持对称 */}
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
            <button className="w-full flex items-center space-x-2 p-3 rounded-lg bg-[#2c5282]">
              <i className="fa-solid fa-calendar"></i>
              <span>预约管理</span>
            </button>
            <button
              onClick={() => navigate('/admin/timeslots')}
              className="w-full flex items-center space-x-2 p-3 rounded-lg hover:bg-[#2c5282]"
            >
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
          {/* 搜索和筛选区域 */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索姓名/电话/类型..."
                  className="w-full p-2 pl-8 border rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fa-solid fa-search absolute left-2 top-3 text-gray-400"></i>
              </div>
              
              <select
                className="p-2 border rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
              >
                <option value="all">所有状态</option>
                <option value="pending">待处理</option>
                <option value="confirmed">已确认</option>
                <option value="rejected">已拒绝</option>
                <option value="cancelled">已取消</option>
              </select>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleBatchConfirm}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                >
                  <i className="fa-solid fa-check mr-1"></i>批量确认
                </button>
                <button
                  onClick={handleBatchDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
                >
                  <i className="fa-solid fa-trash mr-1"></i>批量删除
                </button>
              </div>
            </div>
          </div>
          
          {/* 表格区域 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* 桌面表格 */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4" 
                          checked={selectedAppointments.length > 0 && selectedAppointments.length === paginatedData.length}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        客户姓名
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        联系方式
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        拍摄类型
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        预约时间
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((appointment) => (
                      <tr 
                        key={appointment.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewDetail(appointment)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={selectedAppointments.includes(appointment.id)}
                            onChange={() => handleSelectAppointment(appointment.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{appointment.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{appointment.phone}</div>
                          <div className="text-sm text-gray-500">{appointment.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.date}</div>
                          <div className="text-sm text-gray-500">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[appointment.status]}`}>
                            {statusTexts[appointment.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(appointment);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            详情
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toast('确定要删除该预约吗?', {
                                action: {
                                  label: '删除',
                                  onClick: () => {
                                    setAppointments(prev => 
                                      prev.filter(app => app.id !== appointment.id)
                                    );
                                    toast.success('预约已删除');
                                  }
                                },
                                cancel: {
                                  label: '取消'
                                }
                              });
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* 移动端卡片列表 */}
            <div className="md:hidden">
              <AnimatePresence>
                {paginatedData.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 border-b"
                    onClick={() => handleViewDetail(appointment)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{appointment.name}</h3>
                        <p className="text-gray-500 text-sm">{appointment.type}</p>
                        <p className="text-gray-500 text-sm">{appointment.date} {appointment.time}</p>
                      </div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[appointment.status]}`}>
                        {statusTexts[appointment.status]}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* 分页器 */}
            {filteredAppointments.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    下一页
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      显示 <span className="font-medium">{(currentPage - 1) * PAGE_SIZE + 1}</span> 到{' '}
                      <span className="font-medium">{Math.min(currentPage * PAGE_SIZE, filteredAppointments.length)}</span> 条，共{' '}
                      <span className="font-medium">{filteredAppointments.length}</span> 条
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">上一页</span>
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">下一页</span>
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* 详情面板 */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="w-full max-w-md bg-white h-full overflow-y-auto"
            >
              <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                <h2 className="text-xl font-bold">预约详情</h2>
                <button onClick={() => setSelectedAppointment(null)}>
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">预约ID:</span>
                  <span>{selectedAppointment.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">客户姓名:</span>
                  <span>{selectedAppointment.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">联系电话:</span>
                  <span>{selectedAppointment.phone}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">电子邮箱:</span>
                  <span>{selectedAppointment.email}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">拍摄类型:</span>
                  <span>{selectedAppointment.type}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">预约日期:</span>
                  <span>{selectedAppointment.date}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">预约时间:</span>
                  <span>{selectedAppointment.time}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">摄影师:</span>
                  <span>{selectedAppointment.photographer || '未分配'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">当前状态:</span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[selectedAppointment.status]}`}>
                    {statusTexts[selectedAppointment.status]}
                  </span>
                </div>
                
                {selectedAppointment.notes && (
                  <div>
                    <p className="text-gray-500 mb-1">备注:</p>
                    <p className="text-gray-800">{selectedAppointment.notes}</p>
                  </div>
                )}
                
                <div className="pt-4 flex space-x-3">
                  <button
                    onClick={() => {
                      setAppointments(prev => 
                        prev.map(app => 
                          app.id === selectedAppointment.id 
                            ? { ...app, status: 'confirmed' } 
                            : app
                        )
                      );
                      setSelectedAppointment(null);
                      toast.success('预约已确认');
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                    disabled={selectedAppointment.status === 'confirmed'}
                  >
                    <i className="fa-solid fa-check mr-1"></i>确认预约
                  </button>
                  <button
                    onClick={() => {
                      toast('确定要拒绝该预约吗?', {
                        action: {
                          label: '拒绝',
                          onClick: () => {
                            setAppointments(prev => 
                              prev.map(app => 
                                app.id === selectedAppointment.id 
                                  ? { ...app, status: 'rejected' } 
                                  : app
                              )
                            );
                            setSelectedAppointment(null);
                            toast.success('预约已拒绝');
                          }
                        },
                        cancel: {
                          label: '取消'
                        }
                      });
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
                    disabled={selectedAppointment.status === 'rejected'}
                  >
                    <i className="fa-solid fa-xmark mr-1"></i>拒绝预约
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}