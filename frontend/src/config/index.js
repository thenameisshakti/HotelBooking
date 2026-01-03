const config = {
  apiBaseUrl: import.meta.env.VITE_API_URL,
  env: import.meta.env.VITE_APP_ENV,
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
};

export default config;