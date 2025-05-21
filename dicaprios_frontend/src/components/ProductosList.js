// src/components/ProductosList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  Container, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import ProductoForm from './ProductoForm'; // Asegúrate de importar ProductoForm aquí

const ProductosList = () => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/productos/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProductos(response.data);
    } catch (error) {
      console.error('Error al obtener los productos', error);
    }
  };

  const handleDeleteConfirm = (id) => {
    setProductoAEliminar(id);
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/productos/${productoAEliminar}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchProductos();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error al eliminar el producto', error);
    }
  };

  const handleEdit = (producto) => {
    setProductoSeleccionado(producto);
    setMostrarFormulario(true);
  };

  const handleProductoUpdated = () => {
    setMostrarFormulario(false);
    setProductoSeleccionado(null);
    fetchProductos();
  };

  return (
    <Container>
      {mostrarFormulario ? (
        <ProductoForm producto={productoSeleccionado} onProductoUpdated={handleProductoUpdated} />
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Gestión de Productos
          </Typography>
          <Button variant="contained" color="primary" onClick={() => setMostrarFormulario(true)}>
            Añadir Nuevo Producto
          </Button>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Talla</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productos.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell>{producto.id}</TableCell>
                    <TableCell>{producto.nombre_producto}</TableCell>
                    <TableCell>{producto.precio}</TableCell>
                    <TableCell>{producto.talla}</TableCell>
                    <TableCell>{producto.color}</TableCell>
                    <TableCell>{producto.stock}</TableCell>
                    <TableCell>{producto.categoria}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEdit(producto)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleDeleteConfirm(producto.id)}
                        sx={{ ml: 1 }}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
              <Button onClick={() => setOpenDialog(false)} color="primary">
                Cancelar
              </Button>
              <Button onClick={handleDelete} color="secondary">
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
