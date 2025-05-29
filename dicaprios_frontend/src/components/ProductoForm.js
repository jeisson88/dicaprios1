// dicaprios_frontend/src/components/ProductoForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, MenuItem, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000/api'; // URL base para llamadas API
// const BACKEND_SERVER_URL = 'http://127.0.0.1:8000'; // URL base para construir URLs de imágenes si no son absolutas

const ProductoForm = ({ producto, onProductoUpdated }) => {
  const [nombreProducto, setNombreProducto] = useState('');
  const [precio, setPrecio] = useState('');
  const [talla, setTalla] = useState('');
  const [color, setColor] = useState('');
  const [stock, setStock] = useState('');
  const [categoria, setCategoria] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);


  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      setDataLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Token de autenticación no encontrado. Por favor, inicie sesión.");
          setDataLoading(false);
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };

        const [categoriasResponse, proveedoresResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/categorias/`, { headers }),
          axios.get(`${API_BASE_URL}/proveedores/`, { headers })
        ]);

        setCategorias(categoriasResponse.data);
        setProveedores(proveedoresResponse.data);

        if (producto) {
          setNombreProducto(producto.nombre_producto || '');
          setPrecio(producto.precio || '');
          setTalla(producto.talla || '');
          setColor(producto.color || '');
          setStock(producto.stock || '');
          setCategoria(producto.categoria || ''); // Asume que es el ID
          setProveedor(producto.proveedor || ''); // Asume que es el ID
          
          // --- CAMBIO AQUÍ: Usar producto.imagen_url ---
          // producto.imagen_url ya debería ser una URL absoluta devuelta por el backend
          if (producto.imagen_url) {
            setImagenPreview(producto.imagen_url);
          } else {
            setImagenPreview(null);
          }
          setImagenArchivo(null); 
        } else {
          // Resetear campos para un nuevo producto
          setNombreProducto('');
          setPrecio('');
          setTalla('');
          setColor('');
          setStock('');
          setCategoria('');
          setProveedor('');
          setImagenArchivo(null);
          setImagenPreview(null);
        }

      } catch (err) {
        console.error('Error al obtener datos iniciales', err);
        setError(err.response?.data?.detail || err.message || 'Error al cargar datos');
      } finally {
        setDataLoading(false);
      }
    };

    fetchInitialData();
  }, [producto]);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenArchivo(file);
      setImagenPreview(URL.createObjectURL(file)); 
    } else {
      setImagenArchivo(null);
      // --- CAMBIO AQUÍ: Usar producto.imagen_url para restaurar la vista previa ---
      if (producto && producto.imagen_url) {
        setImagenPreview(producto.imagen_url);
      } else {
        setImagenPreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError("Token de autenticación no encontrado.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('nombre_producto', nombreProducto);
    formData.append('precio', precio);
    if (talla) formData.append('talla', talla);
    formData.append('color', color);
    formData.append('stock', stock);
    if (categoria) formData.append('categoria', categoria); // Enviar el ID
    if (proveedor) formData.append('proveedor', proveedor); // Enviar el ID

    if (imagenArchivo) {
      formData.append('imagen', imagenArchivo); // El backend espera 'imagen' para el archivo
    }
    // Si no se sube un nuevo archivo (imagenArchivo es null) y es una edición,
    // no se envía el campo 'imagen' en el FormData. El backend debería
    // conservar la imagen existente si el campo no se envía.

    try {
      let response;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (producto && producto.id) {
        response = await axios.put(`${API_BASE_URL}/productos/${producto.id}/`, formData, config);
        if (response.status === 200) {
          alert('Producto actualizado exitosamente');
        }
      } else {
        response = await axios.post(`${API_BASE_URL}/productos/`, formData, config);
        if (response.status === 201) {
          alert('Producto agregado exitosamente');
        }
      }

      if (onProductoUpdated) {
        onProductoUpdated(response.data); 
      }
      navigate('/productos'); 
    } catch (err) {
      console.error('Error al guardar el producto', err.response || err);
      let errorMessage = 'Error al guardar el producto.';
      if (err.response && err.response.data) {
        const responseData = err.response.data;
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (typeof responseData === 'object') {
          errorMessage = Object.entries(responseData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Cargando datos del formulario...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
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
            required
          />
          <TextField
            label="Precio"
            variant="outlined"
            margin="normal"
            type="number"
            inputProps={{ step: "0.01" }}
            fullWidth
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
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
            required
          />
          <TextField
            label="Stock"
            variant="outlined"
            margin="normal"
            type="number"
            fullWidth
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
          <TextField
            select
            label="Categoría"
            variant="outlined"
            margin="normal"
            fullWidth
            value={categoria || ''}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <MenuItem value="">
              <em>Seleccione una categoría (opcional)</em>
            </MenuItem>
            {categorias.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.nombre_categoria}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Proveedor"
            variant="outlined"
            margin="normal"
            fullWidth
            value={proveedor || ''}
            onChange={(e) => setProveedor(e.target.value)}
          >
            <MenuItem value="">
              <em>Seleccione un proveedor (opcional)</em>
            </MenuItem>
            {proveedores.map((prov) => (
              <MenuItem key={prov.id} value={prov.id}>
                {prov.nombre_proveedor}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="file"
            label="Imagen del Producto"
            margin="normal"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              accept:"image/*"
            }}
            onChange={handleImagenChange}
            // --- CAMBIO AQUÍ: Usar producto.imagen_url para el helperText ---
            helperText={imagenArchivo ? imagenArchivo.name : (producto && producto.imagen_url ? "Hay una imagen actual. Sube una nueva para reemplazarla." : "Sube una imagen para el producto.")}
          />

          {imagenPreview && (
            <Box sx={{ my: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2">Vista previa:</Typography>
              <img 
                src={imagenPreview} 
                alt="Vista previa de la imagen" 
                style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px', border: '1px solid #ddd' }} 
              />
            </Box>
          )}


          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
              {error}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
            type="submit"
            disabled={loading || dataLoading}
          >
            {loading ? <CircularProgress size={24} /> : (producto ? 'Guardar Cambios' : 'Añadir Producto')}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default ProductoForm;