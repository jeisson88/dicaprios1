// src/components/ProveedorForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

const ProveedorForm = ({ proveedor, onProveedorUpdated }) => {
  const [nombreProveedor, setNombreProveedor] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (proveedor) {
      setNombreProveedor(proveedor.nombre_proveedor);
      setContacto(proveedor.contacto);
      setTelefono(proveedor.telefono);
      setDireccion(proveedor.direccion);
    }
  }, [proveedor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (proveedor) {
        // Editar proveedor existente
        response = await axios.put(`http://127.0.0.1:8000/api/proveedores/${proveedor.id}/`, {
          nombre_proveedor: nombreProveedor,
          contacto,
          telefono,
          direccion,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.status === 200) {
          alert('Proveedor actualizado exitosamente');
        }
      } else {
        // Crear un nuevo proveedor
        response = await axios.post('http://127.0.0.1:8000/api/proveedores/', {
          nombre_proveedor: nombreProveedor,
          contacto,
          telefono,
          direccion,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.status === 201) {
          alert('Proveedor agregado exitosamente');
        }
      }

      // Redirigir a la lista de proveedores o actualizar el estado
      onProveedorUpdated();
    } catch (error) {
      console.error('Error al guardar el proveedor', error);
      setError('Error al guardar el proveedor ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {proveedor ? 'Editar Proveedor' : 'Añadir Nuevo Proveedor'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre del Proveedor"
            variant="outlined"
            margin="normal"
            fullWidth
            value={nombreProveedor}
            onChange={(e) => setNombreProveedor(e.target.value)}
          />
          <TextField
            label="Contacto"
            variant="outlined"
            margin="normal"
            fullWidth
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
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
            {loading ? 'Procesando...' : proveedor ? 'Guardar Cambios' : 'Añadir Proveedor'}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default ProveedorForm;
