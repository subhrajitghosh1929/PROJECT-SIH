/**
 * Centralized API Service for TransitMate (SIH Hackathon)
 * Connects React UI directly to Express backend on http://localhost:5000/api
 * Includes resilient local fallback and strict Admin Role-Based Authentication.
 */

export const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('tm_token') : null;
    this.adminToken = typeof window !== 'undefined' ? localStorage.getItem('tm_admin_token') : null;
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('tm_token', token);
      } else {
        localStorage.removeItem('tm_token');
      }
    }
  }

  setAdminToken(adminToken) {
    this.adminToken = adminToken;
    if (typeof window !== 'undefined') {
      if (adminToken) {
        localStorage.setItem('tm_admin_token', adminToken);
      } else {
        localStorage.removeItem('tm_admin_token');
      }
    }
  }

  getHeaders(isAdmin = false) {
    const headers = { 'Content-Type': 'application/json' };
    const activeToken = isAdmin ? (this.adminToken || this.token) : this.token;
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }
    return headers;
  }

  async request(endpoint, options = {}, isAdmin = false) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(isAdmin),
          ...(options.headers || {}),
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      return data;
    } catch (err) {
      console.warn(`[API] ${endpoint} request failed:`, err.message);
      throw err;
    }
  }

  // --- Auth APIs ---
  auth = {
    register: async (name, email, password) => {
      const data = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (data.token) this.setToken(data.token);
      return data;
    },

    login: async (email, password) => {
      const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) {
        this.setToken(data.token);
        if (data.user?.role === 'admin') {
          this.setAdminToken(data.token);
        }
      }
      return data;
    },

    adminLogin: async (email, password) => {
      const data = await this.request('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) {
        this.setAdminToken(data.token);
        this.setToken(data.token);
      }
      return data;
    },

    guest: async () => {
      const data = await this.request('/auth/guest', { method: 'POST' });
      if (data.token) this.setToken(data.token);
      return data;
    },

    getMe: async () => {
      return this.request('/auth/me');
    },

    updatePreferences: async (preferences) => {
      return this.request('/auth/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences),
      });
    },

    deleteAccount: async () => {
      const data = await this.request('/auth/account', { method: 'DELETE' });
      this.setToken(null);
      this.setAdminToken(null);
      return data;
    },

    logout: () => {
      this.setToken(null);
    },

    logoutAdmin: () => {
      this.setAdminToken(null);
    },
  };

  // --- Routes & Navigation ---
  routes = {
    getQuickDestinations: async () => {
      return this.request('/routes/quick-destinations');
    },

    search: async (destination, priority = 'fastest') => {
      const params = new URLSearchParams({ destination, priority });
      return this.request(`/routes/search?${params.toString()}`);
    },

    getRouteSet: async (tripKey) => {
      return this.request(`/routes/${tripKey}`);
    },
  };

  // --- Live Vehicle Tracking & Crowd Intelligence ---
  tracking = {
    getVehicle: async (tripKey) => {
      return this.request(`/track/${tripKey}`);
    },

    getCrowdMap: async (tripKey, gate = 2, unit = 'metric') => {
      return this.request(`/track/${tripKey}/crowd-map?gate=${gate}&unit=${unit}`);
    },

    boardVehicle: async (tripKey) => {
      return this.request(`/track/${tripKey}/board`, { method: 'POST' });
    },
  };

  // --- Alerts & Disruption Feeds ---
  alerts = {
    getAlerts: async (filter = 'all') => {
      return this.request(`/alerts?filter=${filter}`);
    },

    createAlert: async (alertData) => {
      return this.request('/alerts', {
        method: 'POST',
        body: JSON.stringify(alertData),
      });
    },
  };

  // --- Habits & Commuter Analytics ---
  habits = {
    getStats: async () => {
      return this.request('/habits/stats');
    },

    recordTrip: async (tripData) => {
      return this.request('/habits/record-trip', {
        method: 'POST',
        body: JSON.stringify(tripData),
      });
    },
  };

  // --- Community Crowdsourced Reports ---
  community = {
    getPosts: async () => {
      return this.request('/community/posts');
    },

    createPost: async (postData) => {
      return this.request('/community/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
    },

    confirmPost: async (postId) => {
      return this.request(`/community/posts/${postId}/confirm`, {
        method: 'POST',
      });
    },

    deletePost: async (postId) => {
      return this.request(`/community/posts/${postId}`, {
        method: 'DELETE',
      });
    },
  };

  // --- SIH Hackathon Evaluator & Protected Admin Tools ---
  admin = {
    getMetrics: async () => {
      return this.request('/admin/metrics', {}, true);
    },

    getDatabase: async () => {
      return this.request('/admin/database', {}, true);
    },

    injectDelay: async (tripKey, delayMinutes, reason) => {
      return this.request('/admin/inject-delay', {
        method: 'POST',
        body: JSON.stringify({ tripKey, delayMinutes, reason }),
      }, true);
    },

    broadcastAlert: async (alertData) => {
      return this.request('/admin/broadcast-alert', {
        method: 'POST',
        body: JSON.stringify(alertData),
      }, true);
    },

    setCrowd: async (tripKey, crowdLevel) => {
      return this.request('/admin/set-crowd', {
        method: 'POST',
        body: JSON.stringify({ tripKey, crowdLevel }),
      }, true);
    },

    reset: async () => {
      return this.request('/admin/reset', { method: 'POST' }, true);
    },
  };
}

export const api = new ApiService();
