// src/components/ProveedoresList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Container, Typography } from '@mui/material';
import ProveedorForm from './ProveedorForm';

const ProveedoresList = () => {
  const [proveedores, setProveedores] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/proveedores/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProveedores(response.data);
    } catch (error) {
      console.error('Error al obtener los proveedores', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/proveedores/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchProveedores();
    } catch (error) {
      console.error('Error al eliminar el proveedor', error);
    }
  };

  const handleEdit = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setMostrarFormulario(true);
  };

  const handleProveedorUpdated = () => {
    setMostrarFormulario(false);
    setProveedorSeleccionado(null);
    fetchProveedores();
  };

  return (
    <Container>
      {mostrarFormulario ? (
        <ProveedorForm proveedor={proveedorSeleccionado} onProveedorUpdated={handleProveedorUpdated} />
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Gestión de Proveedores
          </Typography>
          <Button variant="contained" color="primary" onClick={() => setMostrarFormulario(true)}>
            Añadir Nuevo Proveedor
          </Button>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre del Proveedor</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Dirección</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proveedores.map((proveedor) => (
                  <TableRow key={proveedor.id}>
                    <TableCell>{proveedor.id}</TableCell>
                    <TableCell>{proveedor.nombre_proveedor}</TableCell>
                    <TableCell>{proveedor.contacto}</TableCell>
                    <TableCell>{proveedor.telefono}</TableCell>
                    <TableCell>{proveedor.direccion}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEdit(proveedor)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleDelete(proveedor.id)}
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
        </>
      )}
    </Container>
  );
};

export default ProveedoresList;
