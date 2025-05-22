import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { z } from 'zod';

// 通知规则类型
type NotificationRule = {
  id: string;
  type: 'reminder' | 'confirmation' | 'rejection';
  method: 'sms' | 'email' | 'both';
  timeBefore: number;
  enabled: boolean;
};

// 历史记录类型
type NotificationHistory = {
  id: string;
  sentAt: string;
  recipient: string;
  type: string;
  method: string;
  status: 'success' | 'failed';
  error?: string;
};

// 表单验证schema
const ruleSchema = z.object({
  type: z.string().min(1, '请选择通知类型'),
  method: z.string().min(1, '请选择通知方式'),
  timeBefore: z.number().min(1, '提前时间至少1小时'),
});

// mock数据
const mockRules: NotificationRule[] = [
  { id: '1', type: 'reminder', method: 'sms', timeBefore: 24, enabled: true },
  { id: '2', type: 'confirmation', method: 'email', timeBefore: 2, enabled: true },
  { id: '3', type: 'rejection', method: 'both', timeBefore: 1, enabled: false },
];

const mockHistory: NotificationHistory[] = [
  { id: '1', sentAt: '2025-05-20 09:00', recipient: '138****1234', type: 'reminder', method: 'sms', status: 'success' },
  { id: '2', sentAt: '2025-05-19 14:30', recipient: 'user@test.com', type: 'confirmation', method: 'email', status: 'success' },
  { id: '3', sentAt: '2025-05-18 10:15', recipient: '138****5678', type: 'reminder', method: 'sms', status: 'failed', error: '短信发送失败' },
];

export default function Notifications() {
  const navigate = useNavigate();
  const [rules, setRules] = useState<NotificationRule[]>(mockRules);
  const [history, setHistory] = useState<NotificationHistory[]>(mockHistory);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [formData, setFormData] = useState<Omit<NotificationRule, 'id'>>({
    type: 'reminder',
    method: 'sms',
    timeBefore: 24,
    enabled: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'rules' | 'history'>('rules');

  // 验证表单
  const validateForm = () => {
    try {
      ruleSchema.parse({
        type: formData.type,
        method: formData.method,
        timeBefore: formData.timeBefore
      });
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

  // 保存规则
  const handleSaveRule = () => {
    if (!validateForm()) return;

    if (editingRule) {
      // 更新现有规则
      setRules(rules.map(rule => 
        rule.id === editingRule.id ? { ...formData, id: editingRule.id } : rule
      ));
      toast.success('规则已更新');
    } else {
      // 添加新规则
      const newRule = { ...formData, id: Date.now().toString() };
      setRules([...rules, newRule]);
      toast.success('规则已添加');
    }

    setEditingRule(null);
    setFormData({
      type: 'reminder',
      method: 'sms',
      timeBefore: 24,
      enabled: true
    });
  };

  // 删除规则
  const handleDeleteRule = (id: string) => {
    toast('确定要删除此规则吗?', {
      action: {
        label: '删除',
        onClick: () => {
          setRules(rules.filter(rule => rule.id !== id));
          toast.success('规则已删除');
        }
      },
      cancel: {
        label: '取消'
      }
    });
  };

  // 切换规则状态
  const toggleRuleStatus = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
    toast.success('规则状态已更新');
  };

  // 测试发送通知
  const handleTestSend = (rule: NotificationRule) => {
    // 模拟发送
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3;
      if (isSuccess) {
        toast.success('测试通知发送成功');
      } else {
        toast.error('测试通知发送失败');
      }
      
      // 添加到历史记录
      const newHistory: NotificationHistory = {
        id: Date.now().toString(),
        sentAt: new Date().toISOString(),
        recipient: rule.method === 'sms' ? '138****0000' : 'test@example.com',
        type: rule.type,
        method: rule.method,
        status: isSuccess ? 'success' : 'failed',
        error: isSuccess ? undefined : '模拟发送失败'
      };
      setHistory([newHistory, ...history]);
    }, 1000);
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
        <h1 className="text-xl font-bold">通知系统</h1>
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
            <button className="w-full flex items-center space-x-2 p-3 rounded-lg bg-[#2c5282]">
              <i className="fa-solid fa-bell"></i>
              <span>通知系统</span>
            </button>
          </nav>
        </aside>
        
        {/* 主内容区 */}
        <main className="flex-1 p-4 md:p-6">
          {/* 标签页切换 */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2 font-medium ${activeTab === 'rules' ? 'text-[#3498db] border-b-2 border-[#3498db]' : 'text-gray-500'}`}
            >
              通知规则
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'text-[#3498db] border-b-2 border-[#3498db]' : 'text-gray-500'}`}
            >
              历史记录
            </button>
          </div>
          
          {/* 规则配置区 */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">通知规则配置</h2>
                
                <div className="space-y-4">
                  {rules.map((rule) => (
                    <motion.div
                      key={rule.id}
                      whileHover={{ scale: 1.01 }}
                      className={`p-4 border rounded-lg flex justify-between items-center ${rule.enabled ? 'border-[#2ecc71] bg-[#2ecc71]/10' : 'border-gray-300 bg-gray-50'}`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {rule.type === 'reminder' && '预约提醒'}
                            {rule.type === 'confirmation' && '预约确认'}
                            {rule.type === 'rejection' && '预约拒绝'}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-200">
                            {rule.method === 'sms' && '短信'}
                            {rule.method === 'email' && '邮件'}
                            {rule.method === 'both' && '短信+邮件'}
                          </span>
                          <span className="text-xs text-gray-500">
                            提前{rule.timeBefore}小时发送
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTestSend(rule)}
                          className="text-[#3498db] hover:text-[#2980b9]"
                        >
                          <i className="fa-solid fa-paper-plane"></i>
                        </button>
                        <button
                          onClick={() => {
                            setEditingRule(rule);
                            setFormData({
                              type: rule.type,
                              method: rule.method,
                              timeBefore: rule.timeBefore,
                              enabled: rule.enabled
                            });
                          }}
                          className="text-[#3498db] hover:text-[#2980b9]"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => toggleRuleStatus(rule.id)}
                          className={rule.enabled ? "text-yellow-500 hover:text-yellow-600" : "text-green-500 hover:text-green-600"}
                        >
                          <i className={`fa-solid fa-toggle-${rule.enabled ? 'on' : 'off'}`}></i>
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* 添加/编辑规则表单 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">
                  {editingRule ? '编辑通知规则' : '添加新规则'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">通知类型</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className={`w-full p-2 border rounded-md ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="reminder">预约提醒</option>
                      <option value="confirmation">预约确认</option>
                      <option value="rejection">预约拒绝</option>
                    </select>
                    {errors.type && (
                      <p className="text-sm text-red-500 mt-1">{errors.type}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">通知方式</label>
                    <select
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                      className={`w-full p-2 border rounded-md ${errors.method ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="sms">短信</option>
                      <option value="email">邮件</option>
                      <option value="both">短信+邮件</option>
                    </select>
                    {errors.method && (
                      <p className="text-sm text-red-500 mt-1">{errors.method}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">提前时间(小时)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.timeBefore}
                      onChange={(e) => setFormData({ ...formData, timeBefore: parseInt(e.target.value) || 0 })}
                      className={`w-full p-2 border rounded-md ${errors.timeBefore ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.timeBefore && (
                      <p className="text-sm text-red-500 mt-1">{errors.timeBefore}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="h-4 w-4 text-[#3498db] focus:ring-[#3498db] border-gray-300 rounded"
                  />
                  <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
                    启用此规则
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  {editingRule && (
                    <button
                      onClick={() => {
                        setEditingRule(null);
                        setFormData({
                          type: 'reminder',
                          method: 'sms',
                          timeBefore: 24,
                          enabled: true
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md"
                    >
                      取消
                    </button>
                  )}
                  <button
                    onClick={handleSaveRule}
                    className="px-4 py-2 bg-[#3498db] text-white rounded-md hover:bg-[#2980b9]"
                  >
                    {editingRule ? '更新规则' : '添加规则'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* 历史记录区 */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">通知历史记录</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          发送时间
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          接收方
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          类型
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          方式
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {history.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.sentAt}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.recipient}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.type === 'reminder' && '提醒'}
                            {record.type === 'confirmation' && '确认'}
                            {record.type === 'rejection' && '拒绝'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.method === 'sms' && '短信'}
                            {record.method === 'email' && '邮件'}
                            {record.method === 'both' && '短信+邮件'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {record.status === 'success' ? '成功' : '失败'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}