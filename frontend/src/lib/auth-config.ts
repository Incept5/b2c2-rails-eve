export const authConfig = {
  enabled: import.meta.env.VITE_AUTH_ENABLED === 'true',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
};

export const isAuthEnabled = () => authConfig.enabled;
