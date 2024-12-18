export const getEnv = () => import.meta.env.MODE

export const isLocal = import.meta.env.DEV

export const env = {
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
}
