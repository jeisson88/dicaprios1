// src/components/PedidoForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, MenuItem, CircularProgress } from '@mui/material'; // CircularProgress
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DetallePedidoForm from './DetallePedidoForm'; // Asumo que este componente existe

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const PedidoForm = ({ pedido, onPedidoUpdated, onCancel }) => { // Añadido onCancel
  const [fecha, setFecha] = useState(new Date());
  const [estado, setEstado] = useState('Pendiente'); // <--- VALOR INICIAL POR DEFECTO
  const [cliente, setCliente] = useState('');
  const [clientes, setClientes] = useState([]);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [loading, setLoading] = useState(false); // Para el submit
  const [dataLoading, setDataLoading] = useState(false); // Para fetchClientes
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchInitialData = async () => {
      setDataLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("No autenticado.");
          setDataLoading(false);
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const clientesResponse = await axios.get(`${API_BASE_URL}/clientes/`, { headers });
        setClientes(clientesResponse.data);

        if (pedido && pedido.id) { // Modo edición
          setFecha(pedido.fecha ? new Date(pedido.fecha) : new Date());
          setEstado(pedido.estado || 'Pendiente'); // Cargar estado existente, o Pendiente si no viene
          setCliente(pedido.cliente || ''); // Asume que pedido.cliente es el ID
          setMostrarDetalles(true); // O según la lógica que prefieras para detalles en edición
        } else { // Modo creación
          setFecha(new Date());
          setEstado('Pendiente'); // Asegurar que sea Pendiente para nuevos pedidos
          setCliente('');
          setMostrarDetalles(false);
        }
      } catch (err) {
        console.error('Error al obtener datos para el formulario de pedido', err);
        setError(err.response?.data?.detail || err.message || "Error cargando datos");
      } finally {
        setDataLoading(false);
      }
    };
    fetchInitialData();
  }, [pedido]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError("No autenticado.");
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // Formatear fecha a YYYY-MM-DD si es necesario por el backend
    const formattedFecha = fecha.toISOString().split('T')[0];

    const pedidoData = {
      cliente: cliente, // Debe ser el ID del cliente
      fecha: formattedFecha,
      // Para creación, el estado será 'Pendiente' por el state inicial.
      // Para edición, el estado será el que esté en el state.
      estado: estado,
    };

    try {
      let response;
      if (pedido && pedido.id) {
        // Editar pedido existente
        response = await axios.put(
          `<span class="math-inline">\{API\_BASE\_URL\}/pedidos/</span>{pedido.id}/`,
          pedidoData,
          { headers }
        );
        if (response.status === 200) {
          alert('Pedido actualizado exitosamente');
        }
      } else {
        // Crear un nuevo pedido
        // El estado 'Pendiente' ya está en pedidoData.estado
        // El backend también aplicará su default si no se envía.
        response = await axios.post(
          `${API_BASE_URL}/pedidos/`,
          pedidoData,
          { headers }
        );
        if (response.status === 201) {
          alert('Pedido agregado exitosamente');
        }
      }

      if (onPedidoUpdated) {
        onPedidoUpdated(response.data); // Pasar el pedido actualizado/creado
      }
    } catch (err) {
      console.error('Error al guardar el pedido', err.response || err);
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message || 'Error al guardar el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Cargando datos...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {pedido && pedido.id ? 'Editar Pedido' : 'Añadir Nuevo Pedido'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mt: 2, mb: 2 }}>
            <DatePicker
              selected={fecha}
              onChange={(date) => setFecha(date)}
              dateFormat="yyyy-MM-dd"
              customInput={ // El customInput ya lo tenías bien
                <TextField
                  label="Fecha"
                  variant="outlined"
                  fullWidth
                  value={fecha.toISOString().split('T')[0]} // Mostrar en formato YYYY-MM-DD
                  InputProps={{ readOnly: true }} // Hacerlo readOnly ya que se maneja con el picker
                />
              }
              popperPlacement="bottom-start"
            />
          </Box>
          <TextField
            select
            label="Estado"
            variant="outlined"
            margin="normal"
            fullWidth
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            // Si es nuevo pedido y el estado siempre es Pendiente, podrías deshabilitarlo:
            disabled={!(pedido && pedido.id)} // Deshabilitado si es nuevo pedido
          >
            <MenuItem value="Pendiente">Pendiente</MenuItem>
            <MenuItem value="Facturado">Facturado</MenuItem>
            <MenuItem value="Cancelado">Cancelado</MenuItem> {/* Si añades más estados */}
          </TextField>
          <TextField
            select
            label="Cliente"
            variant="outlined"
            margin="normal"
            fullWidth
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            required
          >
            <MenuItem value=""><em>Seleccione un cliente</em></MenuItem>
            {clientes.map((cli) => (
              <MenuItem key={cli.id} value={cli.id}>
                {cli.nombre} {/* Asume que tu modelo Cliente tiene 'nombre' */}
              </MenuItem>
            ))}
          </TextField>

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                Error: {error}
            </Typography>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            {onCancel && (
                <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={onCancel} // Para cerrar el formulario sin guardar
                    disabled={loading}
                >
                    Cancelar
                </Button>
            )}
            <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                disabled={loading || dataLoading}
            >
                {loading ? <CircularProgress size={24} /> : (pedido && pedido.id ? 'Guardar Cambios' : 'Crear Pedido')}
            </Button>
          </Box>
        </form>
        {pedido && pedido.id && ( // Solo mostrar botón de detalles si estamos editando un pedido existente con ID
          <Button
            variant="contained"
            color="info" // Un color diferente para esta acción
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => setMostrarDetalles(!mostrarDetalles)}
          >
            {mostrarDetalles ? 'Ocultar Detalles del Pedido' : 'Ver/Añadir Detalles del Pedido'}
          </Button>
        )}
        {/* Asumo que DetallePedidoForm se encarga de obtener y mostrar detalles si pedidoId existe */}
        {pedido && pedido.id && mostrarDetalles && <DetallePedidoForm pedidoId={pedido.id} />}
      </Box>
    </Container>
  );
};

export default PedidoForm;