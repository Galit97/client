import { apiUrl } from '../utils/api';

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = apiUrl(endpoint);
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API calls
export const authAPI = {
  register: (data: any) => apiCall('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) => 
    apiCall('/api/users/login', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (data: { email: string }) => 
    apiCall('/api/users/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  getUser: (userId: string, token: string) => 
    apiCall(`/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
};

// Wedding API calls
export const weddingAPI = {
  getOwnerWedding: (token: string) => 
    apiCall('/api/weddings/owner', { headers: { Authorization: `Bearer ${token}` } }),
  getUserWeddings: (token: string) => 
    apiCall('/api/weddings/user', { headers: { Authorization: `Bearer ${token}` } }),
  getByParticipant: (token: string) => 
    apiCall('/api/weddings/by-participant', { headers: { Authorization: `Bearer ${token}` } }),
  getById: (id: string) => apiCall(`/api/weddings/${id}`),
  create: (data: any, token: string) => 
    apiCall('/api/weddings', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  update: (id: string, data: any, token: string) => 
    apiCall(`/api/weddings/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  createInvite: (data: any, token: string) => 
    apiCall('/api/weddings/invites', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  acceptInvite: (token: string, authToken: string) => 
    apiCall(`/api/weddings/invites/accept/${token}`, { 
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` }
    }),
};

// Guest API calls
export const guestAPI = {
  getAll: (token: string) => 
    apiCall('/api/guests', { headers: { Authorization: `Bearer ${token}` } }),
  getByWedding: (weddingId: string, token: string) => 
    apiCall(`/api/guests/by-wedding/${weddingId}`, { headers: { Authorization: `Bearer ${token}` } }),
  create: (data: any, token: string) => 
    apiCall('/api/guests', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  update: (id: string, data: any, token: string) => 
    apiCall(`/api/guests/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  delete: (id: string, token: string) => 
    apiCall(`/api/guests/${id}`, { 
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }),
};

// Vendor API calls
export const vendorAPI = {
  getAll: (token: string) => 
    apiCall('/api/vendors', { headers: { Authorization: `Bearer ${token}` } }),
  create: (data: any, token: string) => 
    apiCall('/api/vendors', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  update: (id: string, data: any, token: string) => 
    apiCall(`/api/vendors/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  delete: (id: string, token: string) => 
    apiCall(`/api/vendors/${id}`, { 
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }),
  uploadFile: (formData: FormData, token: string) => {
    const url = apiUrl('/api/upload');
    return fetch(url, {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};

// Checklist API calls
export const checklistAPI = {
  getAll: (token: string) => 
    apiCall('/api/checklists', { headers: { Authorization: `Bearer ${token}` } }),
  create: (data: any, token: string) => 
    apiCall('/api/checklists', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  update: (id: string, data: any, token: string) => 
    apiCall(`/api/checklists/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  delete: (id: string, token: string) => 
    apiCall(`/api/checklists/${id}`, { 
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }),
};

// Budget API calls
export const budgetAPI = {
  getByOwner: (token: string) => 
    apiCall('/api/budgets/owner', { headers: { Authorization: `Bearer ${token}` } }),
  saveSettings: (data: any, token: string) => 
    apiCall('/api/budgets/settings', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
};

// Comparison API calls
export const comparisonAPI = {
  getVendorComparisons: (weddingId: string, token: string) => 
    apiCall(`/api/comparisons/vendor/${weddingId}`, { headers: { Authorization: `Bearer ${token}` } }),
  saveVendorComparisons: (data: any, token: string) => 
    apiCall('/api/comparisons/vendor', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  getVenueComparisons: (weddingId: string, token: string) => 
    apiCall(`/api/comparisons/venue/${weddingId}`, { headers: { Authorization: `Bearer ${token}` } }),
  saveVenueComparisons: (data: any, token: string) => 
    apiCall('/api/comparisons/venue', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
};

// List API calls
export const listAPI = {
  getImportantThings: (token: string) => 
    apiCall('/api/lists/importantThings', { headers: { Authorization: `Bearer ${token}` } }),
  saveImportantThings: (data: any, token: string) => 
    apiCall('/api/lists/importantThings', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  getWeddingDay: (token: string) => 
    apiCall('/api/lists/weddingDay', { headers: { Authorization: `Bearer ${token}` } }),
  saveWeddingDay: (data: any, token: string) => 
    apiCall('/api/lists/weddingDay', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
};

// User API calls
export const userAPI = {
  getAll: (token: string) => 
    apiCall('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
};
