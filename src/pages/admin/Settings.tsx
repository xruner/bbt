import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { toast } from 'sonner';

// 密码强度类型
type PasswordStrength = 'weak' | 'medium' | 'strong';

// 系统配置类型
type SystemConfig = {
  businessHours: string;
  appointmentInterval: number;
  maxAppointmentsPerDay: number;
  cancellationPolicy: string;
};

// 密码表单验证schema
const passwordSchema = z.object({
  oldPassword: z.string().min(1, '请输入当前密码'),
  newPassword: z.string().min(8, '密码至少8个字符'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword']
});

// mock系统配置
const mockSystemConfig: SystemConfig = {
  businessHours: '09:00 - 18:00',
  appointmentInterval: 30,
  maxAppointmentsPerDay: 20,
  cancellationPolicy: '需提前24小时取消'
};

// 密码强度计算函数
const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) return 'weak';
  
  let score = 0;
  // 长度评分
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // 复杂度评分
  if (/[A-Z]/.test(password)) score += 1; // 有大写字母
  if (/[a-z]/.test(password)) score += 1; // 有小写字母
  if (/[0-9]/.test(password)) score += 1; // 有数字
  if (/[^A-Za-z0-9]/.test(password)) score += 1; // 有特殊字符
  
  if (score >= 5) return 'strong';
  if (score >= 3) return 'medium';
  return 'weak';
};

// 密码强度指示器组件
function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = calculatePasswordStrength(password);
  
  return (
    <div className="mt-2">
      <div className="flex h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${
            strength === 'weak' ? 'bg-red-500 w-1/3' :
            strength === 'medium' ? 'bg-yellow-500 w-2/3' :
            'bg-green-500 w-full'
          }`}
        />
      </div>
      <p className="text-xs mt-1 text-gray-500">
        密码强度: 
        <span className={`ml-1 ${
          strength === 'weak' ? 'text-red-500' :
          strength === 'medium' ? 'text-yellow-500' :
          'text-green-500'
        }`}>
          {strength === 'weak' ? '弱' : strength === 'medium' ? '中' : '强'}
        </span>
      </p>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'password' | 'system'>('password');
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = () => {
    try {
      passwordSchema.parse(formData);
      setErrors({});
      
      // 模拟API调用
      toast.success('密码修改成功，请重新登录');
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = err.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {} as Record<string, string>);
        setErrors(newErrors);
      }
    }
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
        <h1 className="text-xl font-bold">系统设置</h1>
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
            <button className="w-full flex items-center space-x-2 p-3 rounded-lg bg-[#2c5282]">
              <i className="fa-solid fa-gear"></i>
              <span>系统设置</span>
            </button>
          </nav>
        </aside>
        
        {/* 主内容区 */}
        <main className="flex-1 p-4 md:p-6">
          {/* 标签页切换 */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab('password')}
              className={`px-4 py-2 font-medium ${activeTab === 'password' ? 'text-[#3498db] border-b-2 border-[#3498db]' : 'text-gray-500'}`}
            >
              修改密码
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-4 py-2 font-medium ${activeTab === 'system' ? 'text-[#3498db] border-b-2 border-[#3498db]' : 'text-gray-500'}`}
            >
              系统参数
            </button>
          </div>
          
          {/* 密码修改表单 */}
          {activeTab === 'password' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 max-w-md"
            >
              <h2 className="text-lg font-semibold mb-4">修改密码</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${errors.oldPassword ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.oldPassword && (
                    <p className="text-sm text-red-500 mt-1">{errors.oldPassword}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <PasswordStrengthMeter password={formData.newPassword} />
                  {errors.newPassword && (
                    <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-[#3498db] text-white py-2 px-4 rounded-md hover:bg-[#2980b9]"
                  >
                    确认修改
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* 系统参数展示 */}
          {activeTab === 'system' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-lg font-semibold mb-4">系统参数配置</h2>
              <p className="text-gray-500 mb-6">以下为系统预设参数，如需修改请联系管理员</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">营业时间</h3>
                  <p className="text-gray-900">{mockSystemConfig.businessHours}</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">预约间隔</h3>
                  <p className="text-gray-900">{mockSystemConfig.appointmentInterval}分钟</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">每日最大预约量</h3>
                  <p className="text-gray-900">{mockSystemConfig.maxAppointmentsPerDay}次</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">取消政策</h3>
                  <p className="text-gray-900">{mockSystemConfig.cancellationPolicy}</p>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}