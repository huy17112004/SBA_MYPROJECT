import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Add a response interceptor to handle the ApiResponse wrapper
api.interceptors.response.use(
  (response) => {
    // If the response follows the ApiResponse structure { code, message, data }
    // we return just the 'data' part to the components.
    if (response.data && response.data.hasOwnProperty('data') && response.data.hasOwnProperty('code')) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;