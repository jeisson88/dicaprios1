// src/components/PedidoForm.js
import React, { useState, useEffect, useCallback } from 'react'; // useCallback
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, MenuItem, CircularProgress, Alert } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DetallePedidoForm from './DetallePedidoForm';
import { useNavigate } from 'react-router-dom'; // Para navegación opcional
import {generarFacturaPDF } from './FacturaPDF';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const PedidoForm = ({ pedido: pedidoProp, onPedidoUpdated, onCancel, fetchPedidosList }) => { // Renombrado pedido a pedidoProp para claridad interna
  const [pedido, setPedido] = useState(null); // Estado interno para manejar el pedido
  const [fecha, setFecha] = useState(new Date());
  const [estadoLocal, setEstadoLocal] = useState('Pendiente'); // Estado local para el select
  const [cliente, setCliente] = useState('');
  const [clientes, setClientes] = useState([]);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  const [loadingSubmit, setLoadingSubmit] = useState(false); // Loading para submit del form principal
  const [loadingData, setLoadingData] = useState(false);    // Loading para fetchClientes
  const [loadingFactura, setLoadingFactura] = useState(false); // NUEVO: Loading para generar factura

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoadingData(true);
    setError(null);
    setSuccessMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError("No autenticado.");
      setLoadingData(false);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    axios.get(`${API_BASE_URL}/clientes/`, { headers })
      .then(response => {
        setClientes(response.data);
      })
      .catch(err => {
        console.error('Error al obtener los clientes', err);
        setError(err.response?.data?.detail || "Error cargando clientes");
      });

    if (pedidoProp && pedidoProp.id) {
      // Cargar datos completos del pedido si es necesario o usar pedidoProp directamente
      // Para este ejemplo, asumimos que pedidoProp tiene 'id', 'fecha', 'estado', 'cliente' (ID)
      // Si necesitamos más datos (como detalles para recalcular algo o el estado más actualizado), haríamos un fetch aquí.
      axios.get(`${API_BASE_URL}/pedidos/${pedidoProp.id}/`, { headers })
        .then(response => {
          const fetchedPedido = response.data;
          setPedido(fetchedPedido); // Guardar el pedido completo
          setFecha(fetchedPedido.fecha ? new Date(fetchedPedido.fecha) : new Date());
          setEstadoLocal(fetchedPedido.estado || 'Pendiente');
          setCliente(fetchedPedido.cliente || ''); // Asume que es el ID del cliente
          // Decidir si mostrar detalles por defecto al editar:
          // setMostrarDetalles(true); 
        })
        .catch(err => {
          console.error('Error al obtener datos del pedido', err);
          setError(err.response?.data?.detail || "Error cargando datos del pedido");
          setPedido(null); // Resetear pedido si falla la carga
        })
        .finally(() => setLoadingData(false));
    } else { // Nuevo pedido
      setPedido(null); // Asegurar que no hay pedido cargado
      setFecha(new Date());
      setEstadoLocal('Pendiente');
      setCliente('');
      setMostrarDetalles(false); // No mostrar detalles para un nuevo pedido hasta que se cree
      setLoadingData(false);
    }
  }, [pedidoProp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setError(null);
    setSuccessMessage('');

    const token = localStorage.getItem('token');
    if (!token) { /* ... manejo de token ... */ }
    const headers = { Authorization: `Bearer ${token}` };
    const formattedFecha = fecha.toISOString().split('T')[0];

    const pedidoData = {
      cliente: cliente,
      fecha: formattedFecha,
      estado: estadoLocal,
    };

    try {
      let response;
      if (pedido && pedido.id) {
        response = await axios.put(`${API_BASE_URL}/pedidos/${pedido.id}/`, pedidoData, { headers });
        setPedido(response.data); // Actualizar el estado del pedido local
        setSuccessMessage('Pedido actualizado exitosamente.');
      } else {
        response = await axios.post(`${API_BASE_URL}/pedidos/`, pedidoData, { headers });
        setPedido(response.data); // Guardar el nuevo pedido creado en el estado
        setMostrarDetalles(true); // Mostrar sección de detalles después de crear el encabezado del pedido
        setSuccessMessage('Encabezado del pedido creado. Ahora puedes añadir detalles.');
      }
      if (onPedidoUpdated) { // Esta prop podría ser para refrescar la lista de pedidos principal
        onPedidoUpdated(response.data);
      }
      if (fetchPedidosList) { // Si se pasa una función para refrescar la lista de PedidosList.js
        fetchPedidosList();
      }
    } catch (err) { /* ... manejo de error ... */ }
    finally { setLoadingSubmit(false); }
  };

  // --- NUEVA FUNCIÓN PARA GENERAR FACTURA (ADAPTADA DE PEDIDOSLIST) ---
  const handleGenerarFacturaDesdeForm = async (pedidoIdParaFacturar) => {
    if (!pedidoIdParaFacturar) {
      setError("ID de pedido no válido para generar factura.");
      return;
    }
    setLoadingFactura(true);
    setError(null);
    setSuccessMessage('');
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/pedidos/${pedidoIdParaFacturar}/generar-factura/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(`Factura #${response.data.id} generada para el pedido #${pedidoIdParaFacturar}.`);
      // Actualizar el estado del pedido local para reflejar el cambio (ej. a 'Facturado')
      if (pedido && pedido.id === pedidoIdParaFacturar) {
        setPedido(prev => ({ ...prev, estado: response.data.pedido_estado || 'Facturado' })); // Asume que el backend devuelve el nuevo estado del pedido
        setEstadoLocal(response.data.pedido_estado || 'Facturado');
      }

      if (response.data) {
        generarFacturaPDF(response.data); // Llamar a la función para generar PDF
      }
      if (fetchPedidosList) { // Si se pasa una función para refrescar la lista de PedidosList.js
        fetchPedidosList();
      }
      // Opcional: navegar
      // navigate(`/facturas/${response.data.id}`);
    } catch (err) {
      console.error('Error al generar la factura desde el formulario', err.response || err);
      setError(err.response?.data?.error || err.response?.data?.detail || 'Error al generar la factura.');
    } finally {
      setLoadingFactura(false);
    }
  };
  // --- FIN NUEVA FUNCIÓN ---

  if (loadingData && !pedido) { // Muestra cargando si no hay pedidoProp y se están cargando datos iniciales
    return <Container sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /><Typography>Cargando datos del formulario...</Typography></Container>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          {pedido && pedido.id ? `Editando Pedido #${pedido.id}` : 'Añadir Nuevo Pedido'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}

        {/* --- INICIO DE LA SECCIÓN DEL FORMULARIO A REVISAR --- */}
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}> {/* Contenedor Flex para los campos */}

            {/* Contenedor específico para DatePicker para asegurar el ancho */}
            <Box>
              <DatePicker
                selected={fecha}
                onChange={(date) => setFecha(date)}
                dateFormat="yyyy-MM-dd"
                customInput={
                  <TextField
                    label="Fecha"
                    variant="outlined"
                    fullWidth // fullWidth debería funcionar aquí
                    value={fecha.toISOString().split('T')[0]}
                    InputProps={{ readOnly: (pedido && pedido.id) }} // Hacerlo readOnly si se edita y la fecha no debe cambiar
                  />
                }
                popperPlacement="bottom-start"
                disabled={loadingSubmit || loadingFactura || loadingData}
              />
            </Box>

            <TextField
              select
              label="Estado"
              variant="outlined"
              // margin="normal" // Quitar margin si se usa gap en el Box padre
              fullWidth
              value={estadoLocal}
              onChange={(e) => setEstadoLocal(e.target.value)}
              disabled={loadingSubmit || loadingFactura || loadingData || !(pedido && pedido.id)}
            >
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="Facturado">Facturado</MenuItem>
              <MenuItem value="Cancelado">Cancelado</MenuItem>
            </TextField>

            <TextField
              select
              label="Cliente"
              variant="outlined"
              // margin="normal" // Quitar margin si se usa gap en el Box padre
              fullWidth
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              disabled={loadingSubmit || loadingFactura || loadingData || (pedido && pedido.id)}
              required
            >
              <MenuItem value=""><em>Seleccione un cliente</em></MenuItem>
              {clientes.map((cli) => (
                <MenuItem key={cli.id} value={cli.id}>
                  {cli.nombre_completo || cli.nombre || `Cliente ID: ${cli.id}`} {/* Ajustar según tu modelo Cliente */}
                </MenuItem>
              ))}
            </TextField>
          </Box> {/* --- FIN DEL CONTENEDOR FLEX DE CAMPOS --- */}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            {onCancel && (
              <Button variant="outlined" color="secondary" fullWidth onClick={onCancel} disabled={loadingSubmit || loadingFactura}>
                {pedido && pedido.id ? 'Cerrar Vista' : 'Cancelar Creación'}
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              disabled={loadingSubmit || loadingData || loadingFactura || (pedido && pedido.id && estadoLocal === 'Facturado')}
            >
              {loadingSubmit ? <CircularProgress size={24} /> : (pedido && pedido.id ? 'Guardar Cambios Pedido' : 'Crear Encabezado Pedido')}
            </Button>
          </Box>
        </form>
        {/* --- FIN DE LA SECCIÓN DEL FORMULARIO A REVISAR --- */}


        {/* SECCIÓN DE DETALLES Y BOTÓN GENERAR FACTURA */}
        {pedido && pedido.id && (
          <>
            <Button
              variant="outlined"
              color="info"
              fullWidth
              sx={{ mt: 3, mb: 1 }}
              onClick={() => setMostrarDetalles(prev => !prev)}
              disabled={loadingFactura || loadingSubmit}
            >
              {mostrarDetalles ? 'Ocultar Detalles del Pedido' : 'Ver/Añadir Detalles del Pedido'}
            </Button>

            {mostrarDetalles && (
              <DetallePedidoForm
                key={pedido.id} // Asegura que se renderice correctamente al cambiar el pedido
                pedidoId={pedido.id}
                pedidoEstado={pedido.estado} // El estado del objeto 'pedido' completo
                onGenerarFactura={() => handleGenerarFacturaDesdeForm(pedido.id)}
                isLoadingFactura={loadingFactura}
              />
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default PedidoForm;