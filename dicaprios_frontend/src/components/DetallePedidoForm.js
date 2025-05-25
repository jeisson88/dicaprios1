// src/components/DetallePedidoForm.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    TextField, Button, Container, Typography, Box, MenuItem, 
    List, ListItem, ListItemText, IconButton, Divider, CircularProgress 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const DetallePedidoForm = ({ pedidoId, pedidoEstado, onGenerarFactura, isLoadingFactura }) => {
  const [detalles, setDetalles] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [errorDetalles, setErrorDetalles] = useState(null);

  // Función para resetear el estado del formulario de añadir producto y los detalles
  const resetFormularioDetalles = useCallback(() => {
    setDetalles([]);
    setProductoSeleccionado('');
    setCantidad(1);
    setErrorDetalles(null); // También limpiar errores de detalles
  }, []);


  const fetchDetallesPedido = useCallback(async () => {
    if (!pedidoId) {
      resetFormularioDetalles(); // Limpiar si no hay pedidoId
      return;
    }
    setLoadingDetalles(true);
    setErrorDetalles(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/detalles-pedido/?pedido_id=${pedidoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDetalles(response.data);
    } catch (error) {
      console.error('Error al obtener los detalles del pedido', error);
      setErrorDetalles('No se pudieron cargar los detalles del pedido.');
      setDetalles([]); // Limpiar detalles en caso de error
    } finally {
      setLoadingDetalles(false);
    }
  }, [pedidoId, resetFormularioDetalles]); // Añadir resetFormularioDetalles como dependencia

  const fetchProductos = useCallback(async () => {
    // La carga de productos puede ser independiente del pedidoId, se hace una vez
    // o cuando el componente se monta si la lista de productos no cambia frecuentemente.
    // Si solo se debe cargar cuando hay un pedidoId, añade la condición.
    setLoadingProductos(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/productos/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(response.data);
    } catch (error) {
      console.error('Error al obtener los productos', error);
    } finally {
      setLoadingProductos(false);
    }
  }, []);


  useEffect(() => {
    fetchDetallesPedido(); // Se encarga de limpiar si pedidoId no existe
    if (!productos.length) { // Cargar productos solo si no se han cargado antes
        fetchProductos();
    }
  }, [pedidoId, fetchDetallesPedido, fetchProductos, productos.length]); // dependencia productos.length

  const handleAddProducto = async (e) => {
    e.preventDefault();
    if (!productoSeleccionado || !pedidoId) {
      alert('Por favor, seleccione un producto y asegúrese de que el pedido exista.');
      return;
    }
    // ... (resto de la lógica de handleAddProducto sin cambios)
    const productoData = productos.find(p => p.id === productoSeleccionado);
    if (!productoData) {
      alert('Producto seleccionado no es válido.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/detalles-pedido/`, {
        pedido: pedidoId,
        producto: productoSeleccionado,
        cantidad,
        precio_unitario: productoData.precio,
        subtotal: cantidad * productoData.precio,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDetallesPedido(); 
      setProductoSeleccionado(''); // Resetear campos del form de añadir
      setCantidad(1);
    } catch (error) {
      console.error('Error al añadir el producto al pedido', error.response?.data || error.message);
      alert(`Error al añadir el producto: ${JSON.stringify(error.response?.data) || error.message}`);
    }
  };

  const handleDeleteDetalle = async (detalleId) => {
    // ... (lógica de eliminar detalle sin cambios) ...
     try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/detalles-pedido/${detalleId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDetallesPedido(); 
    } catch (error) {
      console.error('Error al eliminar el detalle del pedido', error);
      alert('Error al eliminar el detalle.');
    }
  };

  const puedeFacturar = pedidoEstado === 'Pendiente';

  // Si no hay pedidoId, no mostrar nada o un mensaje indicando que se debe crear/seleccionar un pedido
  if (!pedidoId && !loadingDetalles) { 
    // Podrías retornar null o un placeholder si el DetallePedidoForm
    // no debe ser visible cuando no hay un pedidoId activo.
    // Por ahora, el componente se renderizará vacío o con errores si se intenta usar sin pedidoId.
    // La limpieza de `detalles` la hace `WorkspaceDetallesPedido` cuando no hay `pedidoId`.
  }


  return (
    <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <Typography variant="h6" gutterBottom>
        {pedidoId ? `Detalles del Pedido (ID: ${pedidoId})` : 'Detalles del Pedido (Cree o seleccione un pedido)'}
      </Typography>
      
      {loadingDetalles ? (
        <Box sx={{display: 'flex', justifyContent: 'center', my:2}}><CircularProgress size={24} /></Box>
      ) : errorDetalles ? (
        <Typography color="error">{errorDetalles}</Typography>
      ) : (
        <List dense sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
          {detalles.map((detalle) => (
            <ListItem
              key={detalle.id}
              divider
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteDetalle(detalle.id)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${detalle.producto_nombre || productos.find(p=>p.id === detalle.producto)?.nombre_producto || 'Producto desconocido'} (x${detalle.cantidad})`}
                secondary={`P.U: $${parseFloat(detalle.precio_unitario).toFixed(2)} - Subtotal: $${parseFloat(detalle.subtotal).toFixed(2)}`}
              />
            </ListItem>
          ))}
          {/* Mostrar mensaje si no hay detalles Y hay un pedidoId activo */}
          {pedidoId && detalles.length === 0 && !loadingDetalles && (
            <ListItem><ListItemText primary="No hay productos añadidos a este pedido." /></ListItem>
          )}
          {!pedidoId && !loadingDetalles && ( // Mensaje si no hay pedido seleccionado
             <ListItem><ListItemText primary="Cree el encabezado del pedido para poder añadir productos." /></ListItem>
          )}
        </List>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Solo mostrar el formulario de añadir producto si hay un pedidoId */}
      {pedidoId && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Añadir Producto al Pedido</Typography>
          <Box component="form" onSubmit={handleAddProducto} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              select
              label="Producto"
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
              sx={{ minWidth: 200, flexGrow: 1 }}
              size="small"
              disabled={loadingProductos || !pedidoId} // Deshabilitar si no hay pedidoId
            >
              <MenuItem value=""><em>{loadingProductos ? "Cargando..." : "Seleccionar producto"}</em></MenuItem>
              {productos.map((prod) => (
                <MenuItem key={prod.id} value={prod.id}>
                  {prod.nombre_producto} (${parseFloat(prod.precio).toFixed(2)})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Cantidad"
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
              sx={{ width: '100px' }}
              size="small"
              InputProps={{ inputProps: { min: 1 } }}
              disabled={!pedidoId} // Deshabilitar si no hay pedidoId
            />
            <Button type="submit" variant="contained" size="medium" sx={{ height: '40px' }} disabled={!productoSeleccionado || !pedidoId}>
              Añadir Producto
            </Button>
          </Box>
        </>
      )}

      {pedidoId && onGenerarFactura && (
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={onGenerarFactura}
            disabled={!puedeFacturar || isLoadingFactura || detalles.length === 0} // También deshabilitar si no hay detalles
          >
            {isLoadingFactura ? <CircularProgress size={24} color="inherit" /> : 'Generar Factura para este Pedido'}
          </Button>
          {!puedeFacturar && pedidoEstado && (
            <Typography variant="caption" display="block" color="textSecondary" sx={{mt:1, textAlign:'center'}}>
              Este pedido no se puede facturar (Estado actual: {pedidoEstado}).
            </Typography>
          )}
           {detalles.length === 0 && puedeFacturar && (
             <Typography variant="caption" display="block" color="textSecondary" sx={{mt:1, textAlign:'center'}}>
              Añada productos al pedido para poder facturar.
            </Typography>
           )}
        </Box>
      )}
    </Box>
  );
};

export default DetallePedidoForm;