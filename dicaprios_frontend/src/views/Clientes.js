// src/views/Clientes.js
import React, { useState } from 'react';
import ClientesList from '../components/ClientList';
import NuevoClienteForm from '../components/NuevoClienteForm';
import { Container, Button, Box } from '@mui/material';

const Clientes = () => {
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleNuevoCliente = () => {
    setClienteSeleccionado(null);
    setMostrarFormulario(true);
  };

  const handleEditarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarFormulario(true);
  };

  const handleClienteGuardado = () => {
    setMostrarFormulario(false);
  };

  return (
    <Container>
      {!mostrarFormulario && (
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" color="primary" onClick={handleNuevoCliente}>
            Añadir Nuevo Cliente
          </Button>
        </Box>
      )}
      {mostrarFormulario ? (
        <NuevoClienteForm cliente={clienteSeleccionado} onClienteSaved={handleClienteGuardado} />
      ) : (
        <ClientesList onEditCliente={handleEditarCliente} />
      )}
    </Container>
  );
};

export default Clientes;
