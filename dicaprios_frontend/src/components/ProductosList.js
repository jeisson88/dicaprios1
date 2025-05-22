// src/components/ProductosList.js
import React, { useEffect, useState, useCallback } from 'react'; // useCallback añadido
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  Container, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Box, CircularProgress // Box y CircularProgress añadidos para mejorar la UI de carga
} from '@mui/material';
import ProductoForm from './ProductoForm';

// Mover la URL base a una constante para fácil mantenimiento
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const ProductosList = () => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [loading, setLoading] = useState(false); // Estado para la carga de la lista
  const [error, setError] = useState(null); // Estado para errores de carga

  // Usar useCallback para fetchProductos para evitar recreaciones innecesarias
  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("No autenticado. Por favor, inicie sesión.");
        setLoading(false);
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/productos/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProductos(response.data);
    } catch (err) {
      console.error('Error al obtener los productos', err.response || err);
      setError(err.response?.data?.detail || err.message || 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias, ya que no usa props o estado que cambie fuera de ella

  useEffect(() => {
    if (!mostrarFormulario) { // Solo cargar productos si el formulario no está visible
        fetchProductos();
    }
  }, [fetchProductos, mostrarFormulario]); // Dependencia de fetchProductos y mostrarFormulario

  const handleDeleteConfirm = (id) => {
    setProductoAEliminar(id);
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/productos/${productoAEliminar}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchProductos(); // Recargar lista después de eliminar
      setOpenDialog(false);
      setProductoAEliminar(null); // Limpiar el ID del producto a eliminar
    } catch (error) {
      console.error('Error al eliminar el producto', error);
      // Podrías añadir un estado para mostrar error de eliminación al usuario
    }
  };

  const handleEdit = (producto) => {
    setProductoSeleccionado(producto);
    setMostrarFormulario(true);
  };

  const handleAddNew = () => {
    setProductoSeleccionado(null); // Asegurarse que no hay producto seleccionado para el form nuevo
    setMostrarFormulario(true);
  };

  const handleProductoUpdated = (updatedProducto) => { // updatedProducto es el producto devuelto por el form
    setMostrarFormulario(false);
    setProductoSeleccionado(null);
    // fetchProductos(); // Ya se llama desde useEffect al cambiar mostrarFormulario
  };

  const handleFormClose = () => {
    setMostrarFormulario(false);
    setProductoSeleccionado(null);
  }

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography>Cargando productos...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">Error: {error}</Typography>
        <Button onClick={fetchProductos} variant="outlined" sx={{mt: 2}}>Reintentar</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg"> {/* Usar maxWidth="lg" para más espacio en tablas */}
      {mostrarFormulario ? (
        // Pasar también una función para cerrar el formulario
        <ProductoForm producto={productoSeleccionado} onProductoUpdated={handleProductoUpdated} onCancel={handleFormClose} />
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
            <Typography variant="h4" component="h1">
              Gestión de Productos
            </Typography>
            <Button variant="contained" color="primary" onClick={handleAddNew}>
              Añadir Nuevo Producto
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table stickyHeader aria-label="tabla de productos"> {/* stickyHeader es útil */}
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Talla</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Proveedor</TableCell> {/* NUEVA COLUMNA */}
                  <TableCell align="right">Acciones</TableCell> {/* Alineación para botones */}
                </TableRow>
              </TableHead>
              <TableBody>
                {productos.length === 0 && !loading ? (
                    <TableRow>
                        <TableCell colSpan={9} align="center"> {/* Ajustar colSpan */}
                            No hay productos para mostrar.
                        </TableCell>
                    </TableRow>
                ) : (
                productos.map((producto) => (
                  <TableRow hover key={producto.id}> {/* hover para mejor UX */}
                    <TableCell>{producto.id}</TableCell>
                    <TableCell component="th" scope="row">{producto.nombre_producto}</TableCell> {/* Mejor semántica */}
                    <TableCell>${parseFloat(producto.precio).toFixed(2)}</TableCell> {/* Formatear precio */}
                    <TableCell>{producto.talla || 'N/A'}</TableCell> {/* Mostrar N/A si es null/vacío */}
                    <TableCell>{producto.color}</TableCell>
                    <TableCell>{producto.stock}</TableCell>
                    <TableCell>{producto.categoria_nombre || 'N/A'}</TableCell> {/* MOSTRAR NOMBRE DE CATEGORÍA */}
                    <TableCell>{producto.proveedor_nombre || 'N/A'}</TableCell> {/* MOSTRAR NOMBRE DE PROVEEDOR */}
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small" // Botones más pequeños en tablas
                        onClick={() => handleEdit(producto)}
                        sx={{ mr: 1 }} // Margen entre botones
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error" // Usar color 'error' para acciones destructivas
                        size="small"
                        onClick={() => handleDeleteConfirm(producto.id)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </TableContainer>
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
          >
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogContent>
              <DialogContentText>
                ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleDelete} color="error">
                Eliminar
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default ProductosList;