import axios from 'axios'; // O tu cliente HTTP configurado, ej. apiClient

// Ajusta la baseURL según la configuración de tu proxy en package.json o tu URL completa del backend
const API_URL = '/api/productos/proveedores/'; // Ajusta esta URL si es diferente

// Obtener todos los proveedores
const getAllProveedores = () => {
    return axios.get(API_URL);
};

// Obtener un proveedor por ID (opcional, si lo necesitas)
const getProveedorById = (id) => {
    return axios.get(`${API_URL}${id}/`);
};

// Crear un nuevo proveedor (opcional, si lo manejas desde otro form)
const createProveedor = (proveedorData) => {
    return axios.post(API_URL, proveedorData);
};

// Actualizar un proveedor (opcional)
const updateProveedor = (id, proveedorData) => {
    return axios.put(`${API_URL}${id}/`, proveedorData);
};

// Eliminar un proveedor (opcional)
const deleteProveedor = (id) => {
    return axios.delete(`${API_URL}${id}/`);
};

export { 
    getAllProveedores, 
    getProveedorById,
    createProveedor,
    updateProveedor,
    deleteProveedor
};