// API utility for handling base URL in development vs production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://wedding-planner-wj86.onrender.com';

export const apiUrl = (endpoint: string): string => {
  // In development, use localhost if no VITE_API_URL is set
  if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
    return `http://localhost:5000${endpoint}`;
  }
  
  // In production, use the Render backend URL
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  
  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log(`API Call: ${endpoint} -> ${fullUrl}`);
  }
  
  // Always log in production to debug the issue
  console.log(`🔍 API Debug: ${endpoint} -> ${fullUrl} (ENV: ${import.meta.env.MODE}, BASE: ${API_BASE_URL})`);
  
  return fullUrl;
};

export default apiUrl; 