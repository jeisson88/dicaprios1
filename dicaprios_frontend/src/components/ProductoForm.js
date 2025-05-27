// dicaprios_frontend/src/components/ProductoForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, MenuItem, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const ProductoForm = ({ producto, onProductoUpdated }) => {
  const [nombreProducto, setNombreProducto] = useState('');
  const [precio, setPrecio] = useState('');
  const [talla, setTalla] = useState('');
  const [color, setColor] = useState('');
  const [stock, setStock] = useState('');
  const [categoria, setCategoria] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [imagenArchivo, setImagenArchivo] = useState(null); // <--- NUEVO ESTADO PARA EL ARCHIVO DE IMAGEN
  const [imagenPreview, setImagenPreview] = useState(null); // <--- NUEVO ESTADO PARA LA VISTA PREVIA DE IMAGEN (opcional)


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
          setCategoria(producto.categoria || '');
          setProveedor(producto.proveedor || '');
          // Si 'producto.imagen' contiene la URL de la imagen actual, puedes usarla para la vista previa
          if (producto.imagen) {
            // Asegúrate de que la URL sea completa si es relativa
            const imageUrl = producto.imagen.startsWith('http') ? producto.imagen : `${API_BASE_URL.replace('/api', '')}${producto.imagen}`;
            setImagenPreview(imageUrl);
          } else {
            setImagenPreview(null);
          }
          setImagenArchivo(null); // Resetear el archivo seleccionado al cargar un producto existente
        } else {
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

  // --- NUEVA FUNCIÓN PARA MANEJAR CAMBIO DE IMAGEN ---
  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenArchivo(file);
      setImagenPreview(URL.createObjectURL(file)); // Crear URL para vista previa local
    } else {
      setImagenArchivo(null);
      // Si se deselecciona, y es un producto existente con imagen, mostrar la imagen original
      if (producto && producto.imagen) {
        const imageUrl = producto.imagen.startsWith('http') ? producto.imagen : `${API_BASE_URL.replace('/api', '')}${producto.imagen}`;
        setImagenPreview(imageUrl);
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

    // --- USAR FormData PARA ENVIAR DATOS, INCLUYENDO ARCHIVOS ---
    const formData = new FormData();
    formData.append('nombre_producto', nombreProducto);
    formData.append('precio', precio);
    if (talla) formData.append('talla', talla); // Solo añadir si tiene valor
    formData.append('color', color);
    formData.append('stock', stock);
    if (categoria) formData.append('categoria', categoria);
    if (proveedor) formData.append('proveedor', proveedor);

    // Añadir la imagen solo si se ha seleccionado un nuevo archivo
    // Si no se selecciona un nuevo archivo y es una edición, el backend no debería borrar la imagen existente
    // a menos que se envíe explícitamente null o un string vacío para 'imagen',
    // pero eso depende de cómo maneje tu backend las actualizaciones parciales (PATCH vs PUT).
    // Con PUT, si no envías 'imagen', puede interpretarse como que se quiere eliminar.
    // Con `blank=True, null=True` en el modelo y `required=False` en el serializador,
    // no enviar el campo imagen durante un PUT no debería eliminarla si ya existe.
    // Si se quiere permitir borrar la imagen, se necesitaría una lógica adicional.
    if (imagenArchivo) {
      formData.append('imagen', imagenArchivo);
    }

    try {
      let response;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          // Axios establece 'Content-Type': 'multipart/form-data' automáticamente con FormData
        },
      };

      if (producto && producto.id) {
        // Editar producto existente
        // Usar PUT o PATCH. PATCH es mejor para actualizaciones parciales.
        // Si tu backend espera todos los campos con PUT y quieres evitar borrar la imagen
        // si no se sube una nueva, considera usar PATCH o asegurar que tu PUT no borre campos no enviados.
        // Para este ejemplo, asumimos que el backend maneja bien la ausencia del campo 'imagen' en una actualización
        // y no la borra si no se proporciona una nueva.
        response = await axios.put(`${API_BASE_URL}/productos/${producto.id}/`, formData, config);
        if (response.status === 200) {
          alert('Producto actualizado exitosamente');
        }
      } else {
        // Crear un nuevo producto
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
        // Intentar obtener un mensaje de error más específico del backend
        const responseData = err.response.data;
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (typeof responseData === 'object') {
          // Si es un objeto (ej. errores de validación de DRF), intentar formatearlo
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

          {/* --- NUEVO CAMPO PARA SUBIR IMAGEN --- */}
          <TextField
            type="file"
            label="Imagen del Producto"
            margin="normal"
            fullWidth
            InputLabelProps={{
              shrink: true, // Para que el label no se superponga con el texto "No file chosen"
            }}
            inputProps={{
              accept:"image/*" // Aceptar solo archivos de imagen
            }}
            onChange={handleImagenChange}
            helperText={imagenArchivo ? imagenArchivo.name : (producto && producto.imagen ? "Hay una imagen actual. Sube una nueva para reemplazarla." : "Sube una imagen para el producto.")}
          />

          {/* --- VISTA PREVIA DE LA IMAGEN (OPCIONAL) --- */}
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