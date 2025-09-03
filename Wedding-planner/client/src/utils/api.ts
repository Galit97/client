// API utility for handling base URL in development vs production
const API_BASE_URL = 'https://server-l5jj.onrender.com';

export const apiUrl = (endpoint: string): string => {
  // Force production URL - no more localhost fallback
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  
  // Always log to debug the issue
  console.log(`🔍 API Debug: ${endpoint} -> ${fullUrl}`);
  console.log(`🔍 Current origin: ${window.location.origin}`);
  console.log(`🔍 API_BASE_URL: ${API_BASE_URL}`);
  
  return fullUrl;
};

export default apiUrl; 