// src/components/CategoriaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

const CategoriaForm = ({ categoria, onCategoriaUpdated }) => {
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (categoria) {
      setNombreCategoria(categoria.nombre_categoria);
    }
  }, [categoria]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (categoria) {
        // Editar categoría existente
        response = await axios.put(`http://127.0.0.1:8000/api/categorias/${categoria.id}/`, {
          nombre_categoria: nombreCategoria,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.status === 200) {
          alert('Categoría actualizada exitosamente');
        }
      } else {
        // Crear una nueva categoría
        response = await axios.post('http://127.0.0.1:8000/api/categorias/', {
          nombre_categoria: nombreCategoria,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.status === 201) {
          alert('Categoría agregada exitosamente');
        }
      }

      // Redirigir a la lista de categorías o actualizar el estado
      onCategoriaUpdated();
    } catch (error) {
      console.error('Error al guardar la categoría', error);
      setError('Error al guardar la categoría ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {categoria ? 'Editar Categoría' : 'Añadir Nueva Categoría'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre de la Categoría"
            variant="outlined"
            margin="normal"
            fullWidth
            value={nombreCategoria}
            onChange={(e) => setNombreCategoria(e.target.value)}
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
            {loading ? 'Procesando...' : categoria ? 'Guardar Cambios' : 'Añadir Categoría'}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default CategoriaForm;
