import axios from 'axios';

// Use window.location.hostname to support network access
const API = axios.create({
    baseURL: `http://${window.location.hostname}:5000/api`
});

export const getEmployees = () => API.get('/employees');
export const getEmployee = (id) => API.get(`/employees/${id}`);
export const addEmployee = (data) => API.post('/employees', data);
export const updateEmployee = (id, data) => API.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => API.delete(`/employees/${id}`);

