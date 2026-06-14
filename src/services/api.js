import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://lotus-business-server.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  suspend: async (userId) => {
    const response = await api.patch(`/admin/suspend/${userId}`);
    return response.data;
  },

  forceLogout: async (userId) => {
    const response = await api.post(`/admin/force-logout/${userId}`);
    return response.data;
  },

  upgradeToPremium: async (userId) => {
    const response = await api.post('/admin/upgrade-premium', { userId });
    return response.data;
  },

  reactivateLicense: async (userId, licenseType) => {
    const response = await api.post('/admin/reactivate-license', {
      userId,
      licenseType,
    });
    return response.data;
  },
};

export const licensesAPI = {
  getAll: async () => {
    const usersResponse = await api.get('/admin/users');
    const users = usersResponse.data.users || [];

    const licenses = users.map((user) => ({
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

    return { licenses };
  },

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

export default api;
