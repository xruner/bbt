import { toast } from 'sonner';

type RequestInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

// API基础路径配置，可根据需要修改
const API_BASE_URL = '/api';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  try {
    console.log(`发起API请求: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include', // 确保发送cookies
      // 添加超时控制
      signal: AbortSignal.timeout(8000)
    });

    // 检查响应内容类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      if (text.startsWith('<!DOCTYPE html>')) {
        throw new Error('服务器返回了HTML页面而不是JSON数据');
      }
      throw new Error(`无效的响应类型: ${contentType}`);
    }

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.message || '请求失败');
      } catch (e) {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log(`API响应数据:`, data);
    return data;
  } catch (error) {
    let errorMessage = '网络请求失败';
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      errorMessage = '无法连接到API服务器，请检查网络连接或服务器状态';
    } else if (error instanceof DOMException && error.name === 'AbortError') {
      errorMessage = '请求超时，请稍后再试';
    } else if (error instanceof Error) {
      errorMessage = `API请求错误: ${error.message}`;
    }

    toast.error(errorMessage);
    console.error('API请求失败:', {
      endpoint,
      error,
      timestamp: new Date().toISOString()
    });
    // 返回模拟数据保持页面可用
    if (endpoint === '/timeslots') {
      return [{
        date: new Date().toISOString().split('T')[0],
        slots: [
          { start: '09:00', end: '12:00', available: true },
          { start: '14:00', end: '18:00', available: true }
        ]
      }];
    }
    throw error;
  }
}

// 预约相关API
export async function getAvailableTimeslots() {
  return fetchAPI('/timeslots');
}

export async function getUserAppointments() {
  return fetchAPI('/appointments');
}

export async function getAllAppointments() {
  return fetchAPI('/admin/appointments');
}

// 通知相关API
export async function getNotificationRules() {
  return fetchAPI('/notifications/rules');
}

export async function getNotificationHistory() {
  return fetchAPI('/notifications/history');
}

// 系统设置API
export async function getSystemConfig() {
  return fetchAPI('/settings');
}

// 时段管理API
export async function getRegularTimeslots() {
  return fetchAPI('/timeslots/regular');
}

export async function getSpecialTimeslots() {
  return fetchAPI('/timeslots/special');
}

export async function updateTimeslot(id: string, data: any) {
  return fetchAPI(`/timeslots/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTimeslot(id: string) {
  return fetchAPI(`/timeslots/${id}`, {
    method: 'DELETE',
  });
}
