// API utility for handling base URL in development vs production
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiUrl = (endpoint: string): string => {
  // If we have a production API URL, use it
  if (API_BASE_URL) {
    return `${API_BASE_URL}${endpoint}`;
  }
  
  // In development, use relative URL (works with Vite proxy)
  return endpoint;
};

export default apiUrl; 