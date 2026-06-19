import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://lotus-business-server.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const CACHE_TTL = 20 * 1000;
const cache = {
  users: {
    data: null,
    promise: null,
    timestamp: 0,
  },
};

const clearUsersCache = () => {
  cache.users.data = null;
  cache.users.promise = null;
  cache.users.timestamp = 0;
};

const mapUsersToLicenses = (users) => users.map((user) => ({
  id: user.id,
  key: user.licenseKey,
  type: user.licenseType,
  status: user.licenseStatus,
  createdAt: user.createdAt,
  endDate: user.expirationDate,
  user: {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  },
}));

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/admin/login', { email, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
  },
};

export const usersAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    clearUsersCache();
    return response.data;
  },

  getAll: async ({ force = false } = {}) => {
    const now = Date.now();

    if (!force && cache.users.data && now - cache.users.timestamp < CACHE_TTL) {
      return cache.users.data;
    }

    if (!force && cache.users.promise) {
      return cache.users.promise;
    }

    cache.users.promise = api.get('/admin/users')
      .then((response) => {
        cache.users.data = response.data;
        cache.users.timestamp = Date.now();
        cache.users.promise = null;
        return response.data;
      })
      .catch((error) => {
        cache.users.promise = null;
        throw error;
      });

    return cache.users.promise;
  },

  refreshAll: async () => {
    const response = await api.get('/admin/users');
    cache.users.data = response.data;
    cache.users.timestamp = Date.now();
    return response.data;
  },

  suspend: async (userId) => {
    const response = await api.patch(`/admin/suspend/${userId}`);
    clearUsersCache();
    return response.data;
  },

  forceLogout: async (userId) => {
    const response = await api.post(`/admin/force-logout/${userId}`);
    clearUsersCache();
    return response.data;
  },

  upgradeToPremium: async (userId) => {
    const response = await api.post('/admin/upgrade-premium', { userId });
    clearUsersCache();
    return response.data;
  },

  reactivateLicense: async (userId, licenseType) => {
    const response = await api.post('/admin/reactivate-license', {
      userId,
      licenseType,
    });
    clearUsersCache();
    return response.data;
  },
};

export const licensesAPI = {
  getAll: async () => {
    const usersResponse = await usersAPI.getAll();
    const users = usersResponse.users || [];
    const licenses = mapUsersToLicenses(users);

    return { licenses };
  },

  fromUsers: (users) => ({ licenses: mapUsersToLicenses(users || []) }),

  sendLicenseEmail: async (userId) => {
    const response = await api.post('/admin/send-license-email', { userId });
    return response.data;
  },
};

export const adminsAPI = {
  getAll: async () => {
    const response = await api.get('/admin/admins');
    return response.data;
  },

  create: async (adminData) => {
    const response = await api.post('/admin/create', adminData);
    return response.data;
  },

  sendEmail: async (emailData) => {
    const useDebug = import.meta.env.VITE_USE_DEBUG_SEND_EMAIL === '1' || import.meta.env.VITE_USE_DEBUG_SEND_EMAIL === 'true';
    const endpoint = useDebug ? '/admin/send-email-debug' : '/admin/send-email';
    const response = await api.post(endpoint, emailData);
    return response.data;
  },

  sendLicenseEmail: async (userId) => {
    const response = await api.post('/admin/send-license-email', { userId });
    return response.data;
  },
};

export const infosAPI = {
  getAll: async () => {
    const response = await api.get('/admin/infos');
    return response.data;
  },

  create: async (infoData) => {
    const response = await api.post('/admin/infos', infoData);
    return response.data;
  },

  update: async (infoId, infoData) => {
    const response = await api.patch(`/admin/infos/${infoId}`, infoData);
    return response.data;
  },

  remove: async (infoId) => {
    const response = await api.delete(`/admin/infos/${infoId}`);
    return response.data;
  },
};

export const notificationsAPI = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  create: async (notificationData) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  remove: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },
};

export const activityAPI = {
  getAll: async () => {
    const response = await api.get('/activity');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/activity/stats');
    return response.data;
  },
};

export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/admin/profile');
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/admin/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default api;
