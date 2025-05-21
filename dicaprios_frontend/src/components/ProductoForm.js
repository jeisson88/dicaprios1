// src/components/ProductoForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProductoForm = ({ producto, onProductoUpdated }) => {
  const [nombreProducto, setNombreProducto] = useState('');
  const [precio, setPrecio] = useState('');
  const [talla, setTalla] = useState('');
  const [color, setColor] = useState('');
  const [stock, setStock] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (producto) {
      setNombreProducto(producto.nombre_producto);
      setPrecio(producto.precio);
      setTalla(producto.talla);
      setColor(producto.color);
      setStock(producto.stock);
      setCategoria(producto.categoria);
    }
    fetchCategorias();
  }, [producto]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (producto) {
        // Editar producto existente
        response = await axios.put(`http://127.0.0.1:8000/api/productos/${producto.id}/`, {
          nombre_producto: nombreProducto,
          precio,
          talla,
          color,
          stock,
          categoria,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.status === 200) {
          alert('Producto actualizado exitosamente');
        }
      } else {
        // Crear un nuevo producto
        response = await axios.post('http://127.0.0.1:8000/api/productos/', {
          nombre_producto: nombreProducto,
          precio,
          talla,
          color,
          stock,
          categoria,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.status === 201) {
          alert('Producto agregado exitosamente');
        }
      }

      // Redirigir a la lista de productos o actualizar el estado
      onProductoUpdated();
      navigate('/productos');
    } catch (error) {
      console.error('Error al guardar el producto', error);
      setError('Error al guardar el producto ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {producto ? 'Editar Producto' : 'Añadir Nuevo Producto'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre del Producto"
            variant="outlined"
            margin="normal"
            fullWidth
            value={nombreProducto}
            onChange={(e) => setNombreProducto(e.target.value)}
          />
          <TextField
            label="Precio"
            variant="outlined"
            margin="normal"
            fullWidth
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
          <TextField
            label="Talla"
            variant="outlined"
            margin="normal"
            fullWidth
            value={talla}
            onChange={(e) => setTalla(e.target.value)}
          />
          <TextField
            label="Color"
            variant="outlined"
            margin="normal"
            fullWidth
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <TextField
            label="Stock"
            variant="outlined"
            margin="normal"
            fullWidth
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <TextField
            select
            label="Categoría"
            variant="outlined"
            margin="normal"
            fullWidth
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            {categorias.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.nombre_categoria}
              </MenuItem>
            ))}
          </TextField>
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
            {loading ? 'Procesando...' : producto ? 'Guardar Cambios' : 'Añadir Producto'}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default ProductoForm;
