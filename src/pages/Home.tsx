import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleLogin = () => {
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      setIsAuthenticated(true);
      setShowLogin(false);
      toast.success('登录成功');
      navigate('/admin');
    } else {
      toast.error('用户名或密码错误');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <main className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          影楼预约管理系统
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          专业摄影服务预约平台，轻松管理您的拍摄计划
        </p>
        
        <div className="space-y-4">
          <motion.a
            href="/booking"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition duration-200"
            whileHover={{ scale: 1.02 }}
          >
            <i className="fa-solid fa-calendar-plus mr-2"></i>
            立即预约
          </motion.a>
          
          <motion.a
            href="/my-appointments"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg text-center transition duration-200"
            whileHover={{ scale: 1.02 }}
          >
            <i className="fa-solid fa-list-check mr-2"></i>
            我的预约
          </motion.a>

          {!isAuthenticated && (
            <motion.button
              onClick={() => setShowLogin(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg text-center transition duration-200"
              whileHover={{ scale: 1.02 }}
            >
              <i className="fa-solid fa-lock mr-2"></i>
              管理员登录
            </motion.button>
          )}
        </div>
      </main>

      {/* 登录模态框 */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-sm"
          >
            <h2 className="text-xl font-bold mb-4">管理员登录</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="admin123"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowLogin(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  取消
                </button>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  登录
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}