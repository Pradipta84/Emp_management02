import axios from 'axios';

// Use window.location.hostname to support network access
// Remove any trailing slash from the VITE_API_URL to prevent double-slash (404) errors
let API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
if (API_BASE_URL.endsWith('/')) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
}

const API = axios.create({
    baseURL: `${API_BASE_URL}/api`
});

export const getEmployees = () => API.get('/employees');
export const getEmployee = (id) => API.get(`/employees/${id}`);
export const addEmployee = (data) => API.post('/employees', data);
export const updateEmployee = (id, data) => API.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => API.delete(`/employees/${id}`);

