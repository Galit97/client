// API utility for handling base URL in development vs production
const rawBaseUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'https://wedi-bud-server.onrender.com';

const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

export const apiUrl = (endpoint: string): string => {
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  console.log(` API Debug: ${endpoint} -> ${fullUrl}`);
  console.log(` Current origin: ${window.location.origin}`);
  console.log(` API_BASE_URL: ${API_BASE_URL}`);

  return fullUrl;
};

export default apiUrl;
