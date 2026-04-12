import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Automatically add the token to every request
api.interceptors.request.use((config) => {
  const token = import.meta.env.VITE_BACKEND_AUTH;
  if (token) {
    config.headers.Authorization = token;
  } else {
    console.warn("WARNING! NO AUTH KEY FOUND!")
  }
  return config;
});

export default api;