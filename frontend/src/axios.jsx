import axios from 'axios';
import  store  from './store';
import { setToken } from './slices/userAuthSlice';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});




api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;


    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.log('Error response intercepted:', error.response);
      originalRequest._retry = true;
      try {
        console.log('Attempting to refresh token...');
        const response = await api.post('/refresh-token', {}, { withCredentials: true });
        console.log('Received new access token:', response.data);
        const { accessToken } = response.data;
 
        store.dispatch(setToken({ token: accessToken }));

        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('Retrying request with new access token:', originalRequest.headers);


        return api(originalRequest);
      } catch (err) {
        console.error('Error refreshing token:', err);
        store.dispatch(clearCredentials());  
        return Promise.reject(err);
      }
    }


    return Promise.reject(error);
  }
);

export default api;

