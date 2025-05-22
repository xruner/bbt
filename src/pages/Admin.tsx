import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// 统计数据mock
const statsData = {
  today: 15,
  pending: 3,
  confirmed: 12
};

// 功能入口数据
const quickActions = [
  { title: "预约管理", icon: "calendar", path: "/admin/appointments" },
  { title: "时段管理", icon: "clock", path: "/admin/timeslots" },
  { title: "通知系统", icon: "bell", path: "/admin/notifications" },
  { title: "系统设置", icon: "gear", path: "/admin/settings" }
];

export default function Admin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部状态栏 */}
      <header className="bg-[#1a365d] text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">影楼管理后台</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-[#2c5282]">
            <i className="fa-solid fa-bell"></i>
          </button>
          <button className="p-2 rounded-full hover:bg-[#2c5282]">
            <i className="fa-solid fa-user"></i>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-[#1a365d] text-white min-h-screen p-4">
          <nav className="space-y-2">
            <button 
              onClick={() => navigate('/admin')}
              className="w-full flex items-center space-x-2 p-3 rounded-lg bg-[#2c5282]"
            >
              <i className="fa-solid fa-gauge"></i>
              <span>控制面板</span>
            </button>
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center space-x-2 p-3 rounded-lg hover:bg-[#2c5282]"
              >
                <i className={`fa-solid fa-${action.icon}`}></i>
                <span>{action.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 p-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">今日预约</p>
                  <h3 className="text-2xl font-bold">{statsData.today}</h3>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <i className="fa-solid fa-calendar-day"></i>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">待处理</p>
                  <h3 className="text-2xl font-bold">{statsData.pending}</h3>
                </div>
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <i className="fa-solid fa-hourglass-half"></i>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">已确认</p>
                  <h3 className="text-2xl font-bold">{statsData.confirmed}</h3>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <i className="fa-solid fa-check-circle"></i>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 快捷入口 */}
          <h2 className="text-xl font-semibold mb-4">快捷操作</h2>
          <div className="grid grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="p-4 rounded-full bg-blue-100 text-blue-600 text-xl">
                  <i className={`fa-solid fa-${action.icon}`}></i>
                </div>
                <span className="font-medium">{action.title}</span>
              </motion.button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
