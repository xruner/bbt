import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getUserAppointments } from '@/lib/api';

// 状态颜色映射
const statusColors = {
  pending: 'bg-[#f39c12]',
  confirmed: 'bg-[#2ecc71]',
  rejected: 'bg-[#e74c3c]'
};

// mock数据
const mockAppointments = [
  {
    id: '1',
    date: '2025-05-20',
    type: '婚纱摄影',
    status: 'confirmed',
    time: '10:00-12:00',
    photographer: '张摄影师'
  },
  {
    id: '2',
    date: '2025-05-18',
    type: '个人写真',
    status: 'pending',
    time: '14:00-16:00',
    photographer: '李摄影师'
  }
];

export default function MyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState(mockAppointments);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await getUserAppointments();
        setAppointments(data.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      } catch (error) {
        toast.error('获取预约记录失败');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const handleCancel = (id: string) => {
    toast('确定要取消该预约吗?', {
      action: {
        label: '确定',
        onClick: () => {
          setAppointments(appointments.filter(app => app.id !== id));
          toast.success('预约已取消');
        }
      },
      cancel: {
        label: '取消'
      }
    });
  };

  const handleRefresh = () => {
    toast('数据已刷新');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 顶部导航 */}
      <nav className="bg-[#3498db] text-white p-4 flex justify-between items-center">
        <button onClick={() => navigate('/booking')}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="text-xl font-bold">我的预约</h1>
        <button onClick={handleRefresh}>
          <i className="fa-solid fa-rotate"></i>
        </button>
      </nav>

      {/* 预约列表 */}
      <div className="container mx-auto p-4">
        <AnimatePresence>
          {appointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-4 mb-4"
              onClick={() => setSelectedAppointment(appointment)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{appointment.type}</h3>
                  <p className="text-gray-500 text-sm">{appointment.date} {appointment.time}</p>
                </div>
                <span className={`${statusColors[appointment.status as keyof typeof statusColors]} text-white text-xs px-2 py-1 rounded-full`}>
                  {appointment.status === 'pending' && '待处理'}
                  {appointment.status === 'confirmed' && '已确认'}
                  {appointment.status === 'rejected' && '已拒绝'}
                </span>
              </div>
              <div className="mt-2 flex justify-end">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel(appointment.id);
                  }}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  <i className="fa-solid fa-trash-can mr-1"></i>取消
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-around">
        <button 
          onClick={() => navigate('/')}
          className="flex flex-col items-center text-[#3498db]"
        >
          <i className="fa-solid fa-house"></i>
          <span className="text-xs mt-1">首页</span>
        </button>
        <button 
          onClick={() => navigate('/booking')}
          className="flex flex-col items-center text-[#3498db]"
        >
          <i className="fa-solid fa-calendar-plus"></i>
          <span className="text-xs mt-1">预约</span>
        </button>
        <button 
          className="flex flex-col items-center text-[#3498db] font-bold"
        >
          <i className="fa-solid fa-list-check"></i>
          <span className="text-xs mt-1">我的预约</span>
        </button>
      </div>

      {/* 详情模态框 */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedAppointment.type}</h2>
              <button onClick={() => setSelectedAppointment(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="space-y-3">
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
                <span>{selectedAppointment.photographer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">状态:</span>
                <span className={`${statusColors[selectedAppointment.status as keyof typeof statusColors]} text-white text-xs px-2 py-1 rounded-full`}>
                  {selectedAppointment.status === 'pending' && '待处理'}
                  {selectedAppointment.status === 'confirmed' && '已确认'}
                  {selectedAppointment.status === 'rejected' && '已拒绝'}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                关闭
              </button>
              {selectedAppointment.status === 'pending' && (
                <button 
                  onClick={() => {
                    handleCancel(selectedAppointment.id);
                    setSelectedAppointment(null);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  取消预约
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
