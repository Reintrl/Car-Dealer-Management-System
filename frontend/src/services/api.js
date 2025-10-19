import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Car Endpoints
export const getAllCars = () => apiClient.get('/cars');
export const getCarById = (id) => apiClient.get(`/cars/${id}`);
export const createCar = (carData) => apiClient.post('/cars', carData);
export const createCarsBulk = (carsData) => apiClient.post('/cars/bulk', carsData);
export const updateCar = (id, carData) => apiClient.put(`/cars/${id}`, carData);
export const deleteCar = (id) => apiClient.delete(`/cars/${id}`);
export const filterCars = (minYear, maxYear, maxMileage) =>
    apiClient.get('/cars/filter', { params: { minYear, maxYear, maxMileage } });

// Dealer Endpoints
export const getAllDealers = () => apiClient.get('/dealers');
export const getDealerById = (id) => apiClient.get(`/dealers/${id}`);
export const createDealer = (dealerData) => apiClient.post('/dealers', dealerData);
export const updateDealer = (id, dealerData) => apiClient.put(`/dealers/${id}`, dealerData);
export const deleteDealer = (id) => apiClient.delete(`/dealers/${id}`);
export const getDealersByBrand = (brand) =>
    apiClient.get('/dealers/by-brand', { params: { brand } });
export const getDealersByBrandNative = (brand) =>
    apiClient.get('/dealers/by-brand-native', { params: { brand } });
export const getDealerCars = (dealerId) => apiClient.get(`/dealers/${dealerId}/cars`);

// Order Endpoints
export const getAllOrders = () => apiClient.get('/orders');
export const getOrderById = (id) => apiClient.get(`/orders/${id}`);
export const createOrder = (orderData) => apiClient.post('/orders', orderData);
export const updateOrder = (id, orderData) => apiClient.put(`/orders/${id}`, orderData);
export const deleteOrder = (id) => apiClient.delete(`/orders/${id}`);

// User Endpoints
export const getAllUsers = () => apiClient.get('/users');
export const getUserById = (id) => apiClient.get(`/users/${id}`);
export const createUser = (userData) => apiClient.post('/users', userData);
export const updateUser = (id, userData) => apiClient.put(`/users/${id}`, userData);
export const deleteUser = (id) => apiClient.delete(`/users/${id}`);
export const addFavoriteCar = (userId, carId) =>
    apiClient.post(`/users/${userId}/favorite-cars/${carId}`);
export const removeFavoriteCar = (userId, carId) =>
    apiClient.delete(`/users/${userId}/favorite-cars/${carId}`);

export default apiClient;
