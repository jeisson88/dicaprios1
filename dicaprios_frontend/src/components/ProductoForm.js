// src/components/ProductoForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, MenuItem, CircularProgress } from '@mui/material'; // CircularProgress añadido
import { useNavigate } from 'react-router-dom';

// Es una buena práctica mover las URL de la API a un archivo de configuración o variables de entorno
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const ProductoForm = ({ producto, onProductoUpdated }) => {
  // Estados para los campos del formulario
  const [nombreProducto, setNombreProducto] = useState('');
  const [precio, setPrecio] = useState('');
  const [talla, setTalla] = useState('');
  const [color, setColor] = useState('');
  const [stock, setStock] = useState('');
  const [categoria, setCategoria] = useState(''); // ID de la categoría seleccionada
  const [proveedor, setProveedor] = useState(''); // NUEVO: ID del proveedor seleccionado

  // Estados para cargar datos de los selectores
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]); // NUEVO: Lista de proveedores

  // Estados de carga y error
  const [loading, setLoading] = useState(false); // Para el envío del formulario
  const [dataLoading, setDataLoading] = useState(false); // Para la carga inicial de datos (categorías, proveedores)
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      setDataLoading(true);
      setError(null);
      try {
        // Obtener token de autenticación
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Token de autenticación no encontrado. Por favor, inicie sesión.");
          setDataLoading(false);
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };

        // Peticiones en paralelo para categorías y proveedores
        const [categoriasResponse, proveedoresResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/categorias/`, { headers }),
          axios.get(`${API_BASE_URL}/proveedores/`, { headers }) // NUEVO: Obtener proveedores
        ]);

        setCategorias(categoriasResponse.data);
        setProveedores(proveedoresResponse.data); // NUEVO: Guardar proveedores

        // Si se está editando un producto, rellenar los campos
        if (producto) {
          setNombreProducto(producto.nombre_producto || '');
          setPrecio(producto.precio || '');
          setTalla(producto.talla || '');
          setColor(producto.color || '');
          setStock(producto.stock || '');
          setCategoria(producto.categoria || ''); // Asume que producto.categoria es el ID
          setProveedor(producto.proveedor || ''); // NUEVO: Asume que producto.proveedor es el ID
        } else {
          // Si es un nuevo producto, resetear los campos (útil si el form se reutiliza)
          setNombreProducto('');
          setPrecio('');
          setTalla('');
          setColor('');
          setStock('');
          setCategoria('');
          setProveedor('');
        }

      } catch (err) {
        console.error('Error al obtener datos iniciales', err);
        setError(err.response?.data?.detail || err.message || 'Error al cargar datos');
      } finally {
        setDataLoading(false);
      }
    };

    fetchInitialData();
  }, [producto]); // Dependencia 'producto' para recargar si cambia el producto a editar

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

    // Construir el payload. El backend espera los IDs para categoría y proveedor.
    const productoData = {
      nombre_producto: nombreProducto,
      precio: precio,
      talla: talla || null, // Enviar null si está vacío y el backend lo permite
      color: color,
      stock: stock,
      categoria: categoria || null, // Enviar null si no se selecciona y es opcional
      proveedor: proveedor || null, // NUEVO: Enviar ID del proveedor o null
    };

    try {
      let response;
      if (producto && producto.id) {
        // Editar producto existente
        response = await axios.put(`${API_BASE_URL}/productos/${producto.id}/`, productoData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          alert('Producto actualizado exitosamente');
        }
      } else {
        // Crear un nuevo producto
        response = await axios.post(`${API_BASE_URL}/productos/`, productoData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 201) {
          alert('Producto agregado exitosamente');
        }
      }

      if (onProductoUpdated) {
        onProductoUpdated(response.data); // Devolver el producto actualizado/creado
      }
      navigate('/productos'); // O a donde prefieras redirigir
    } catch (err) {
      console.error('Error al guardar el producto', err.response || err);
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message || 'Error al guardar el producto');
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
      <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}> {/* Ajustado margen superior e inferior */}
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
            required // Campo requerido
          />
          <TextField
            label="Precio"
            variant="outlined"
            margin="normal"
            type="number" // Tipo número para validación básica
            inputProps={{ step: "0.01" }} // Para decimales
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
            // No es requerido, ya que en el backend se puso blank=True, null=True
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
            value={categoria || ''} // Usar '' para valor no seleccionado
            onChange={(e) => setCategoria(e.target.value)}
            // No es requerido si en el backend categoria es opcional (null=True, blank=True)
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

          {/* --- NUEVO SELECTOR PARA PROVEEDOR --- */}
          <TextField
            select
            label="Proveedor"
            variant="outlined"
            margin="normal"
            fullWidth
            value={proveedor || ''} // Usar '' para valor no seleccionado
            onChange={(e) => setProveedor(e.target.value)}
            // No es requerido, ya que en el backend proveedor es opcional (null=True, blank=True)
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
          {/* --- FIN NUEVO SELECTOR --- */}

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
              {error}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, mb: 2 }} // Ajustado margen
            type="submit"
            disabled={loading || dataLoading} // Deshabilitar si se está cargando datos o enviando
          >
            {loading ? <CircularProgress size={24} /> : (producto ? 'Guardar Cambios' : 'Añadir Producto')}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default ProductoForm;