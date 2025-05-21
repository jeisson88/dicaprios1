// src/components/CategoriasList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Container, Typography } from '@mui/material';
import CategoriaForm from './CategoriaForm';

const CategoriasList = () => {
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/categorias/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCategorias(response.data);
    } catch (error) {
      console.error('Error al obtener las categorías', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/categorias/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchCategorias();
    } catch (error) {
      console.error('Error al eliminar la categoría', error);
    }
  };

  const handleEdit = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setMostrarFormulario(true);
  };

  const handleCategoriaUpdated = () => {
    setMostrarFormulario(false);
    setCategoriaSeleccionada(null);
    fetchCategorias();
  };

  return (
    <Container>
      {mostrarFormulario ? (
        <CategoriaForm categoria={categoriaSeleccionada} onCategoriaUpdated={handleCategoriaUpdated} />
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Gestión de Categorías
          </Typography>
          <Button variant="contained" color="primary" onClick={() => setMostrarFormulario(true)}>
            Añadir Nueva Categoría
          </Button>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre de la Categoría</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categorias.map((categoria) => (
                  <TableRow key={categoria.id}>
                    <TableCell>{categoria.id}</TableCell>
                    <TableCell>{categoria.nombre_categoria}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEdit(categoria)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleDelete(categoria.id)}
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

export default CategoriasList;
