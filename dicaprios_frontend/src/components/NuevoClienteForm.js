// NuevoClienteForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

const NuevoClienteForm = ({ cliente, onClienteSaved }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cliente) {
      setNombre(cliente.nombre);
      setEmail(cliente.email);
      setTelefono(cliente.telefono);
      setDireccion(cliente.direccion);
    }
  }, [cliente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (cliente) {
        // Editar cliente existente
        response = await axios.put(`http://127.0.0.1:8000/api/clientes/${cliente.id}/`, {
          nombre,
          email,
          telefono,
          direccion,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.status === 200) {
          alert('Cliente actualizado exitosamente');
        }
      } else {
        // Crear un nuevo cliente
        response = await axios.post('http://127.0.0.1:8000/api/clientes/', {
          nombre,
          email,
          telefono,
          direccion,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.status === 201) {
          alert('Cliente agregado exitosamente');
        }
      }

      onClienteSaved();
    } catch (error) {
      console.error('Error al guardar el cliente', error);
      setError('Error al guardar el cliente ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {cliente ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre"
            variant="outlined"
            margin="normal"
            fullWidth
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <TextField
            label="Email"
            variant="outlined"
            margin="normal"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Teléfono"
            variant="outlined"
            margin="normal"
            fullWidth
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <TextField
            label="Dirección"
            variant="outlined"
            margin="normal"
            fullWidth
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Procesando...' : cliente ? 'Guardar Cambios' : 'Añadir Cliente'}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default NuevoClienteForm;
