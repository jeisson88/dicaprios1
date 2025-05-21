// src/components/ClientesList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  Container, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';

const ClientesList = ({ onEditCliente }) => {
  const [clientes, setClientes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/clientes/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setClientes(response.data);
    } catch (error) {
      console.error('Error al obtener los clientes', error);
    }
  };

  const handleDeleteConfirm = (id) => {
    setClienteAEliminar(id);
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/clientes/${clienteAEliminar}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchClientes();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error al eliminar el cliente', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Gestión de Clientes
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Direccion</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.id}</TableCell>
                <TableCell>{cliente.nombre}</TableCell>
                <TableCell>{cliente.email}</TableCell>
                <TableCell>{cliente.telefono}</TableCell>
                <TableCell>{cliente.direccion}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => onEditCliente(cliente)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleDeleteConfirm(cliente.id)}
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
            ¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.
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
    </Container>
  );
};

export default ClientesList;
