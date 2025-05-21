// src/components/FacturaDetalle.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, MenuItem } from '@mui/material';
import { generarFacturaPDF } from './FacturaPDF';

const FacturaDetalle = ({ onVolver }) => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState('');
  const [total, setTotal] = useState(0);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [fechaEmision] = useState(new Date().toISOString().slice(0, 10));
  const [detallesPedido, setDetallesPedido] = useState([]);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/pedidos/?estado=Pendiente', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPedidos(response.data);
    } catch (error) {
      console.error('Error al obtener los pedidos pendientes', error);
    }
  };

  const handlePedidoChange = async (e) => {
    const pedidoId = parseInt(e.target.value, 10);
    setPedidoSeleccionado(pedidoId);
    try {
      // Obtener detalles del pedido y calcular el total
      const response = await axios.get(`http://127.0.0.1:8000/api/detalles-pedido/?pedido=${pedidoId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setDetallesPedido(response.data);
      const totalPedido = response.data.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);
      setTotal(totalPedido);

      // Obtener nombre e ID del cliente asociado al pedido
      const pedidoResponse = await axios.get(`http://127.0.0.1:8000/api/pedidos/${pedidoId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const clienteId = pedidoResponse.data.cliente;
      setClienteId(clienteId);
      const clienteResponse = await axios.get(`http://127.0.0.1:8000/api/clientes/${clienteId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setClienteNombre(clienteResponse.data.nombre);
    } catch (error) {
      console.error('Error al obtener el detalle del pedido', error);
    }
  };

  const handleFacturar = async () => {
    try {
      // Obtener el pedido actual antes de actualizar
      const pedidoResponse = await axios.get(`http://127.0.0.1:8000/api/pedidos/${pedidoSeleccionado}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      // Crear el objeto actualizado con el estado cambiado a "Facturado"
      const pedidoActualizado = {
        ...pedidoResponse.data,
        estado: 'Facturado'
      };
  
      // Actualizar el pedido con todos los campos, incluyendo el nuevo estado
      await axios.put(`http://127.0.0.1:8000/api/pedidos/${pedidoSeleccionado}/`, pedidoActualizado, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      // Crear la factura después de actualizar el pedido
      await axios.post('http://127.0.0.1:8000/api/facturas/', {
        cliente: pedidoActualizado.cliente,
        pedido: pedidoSeleccionado,
        fecha_emision: fechaEmision,
        total: total
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      // Generar PDF de la factura, incluyendo detalles del pedido
      const factura = {
        cliente: clienteNombre,
        pedido: pedidoSeleccionado,
        fecha_emision: fechaEmision,
        total: total,
        detalles: detallesPedido
      };
      generarFacturaPDF(factura);

      // Notificar al usuario que la facturación fue exitosa
      alert('Pedido facturado exitosamente');
  
      // Limpiar los campos y volver a la lista de facturas
      setPedidoSeleccionado('');
      setTotal(0);
      setClienteNombre('');
      setDetallesPedido([]);
      // onVolver();
    } catch (error) {
      console.error('Error al facturar el pedido', error);
      alert('Error al facturar el pedido: ' + error.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Facturación de Pedido
        </Typography>
        <TextField
          select
          label="Pedido"
          variant="outlined"
          margin="normal"
          fullWidth
          value={pedidoSeleccionado}
          onChange={handlePedidoChange}
        >
          {pedidos.map((pedido) => (
            <MenuItem key={pedido.id} value={pedido.id}>
              {`Pedido #${pedido.id}`}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Fecha de Emisión"
          variant="outlined"
          margin="normal"
          fullWidth
          value={fechaEmision}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Total del Pedido"
          variant="outlined"
          margin="normal"
          fullWidth
          value={total}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Cliente"
          variant="outlined"
          margin="normal"
          fullWidth
          value={clienteNombre}
          InputProps={{ readOnly: true }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleFacturar}
          disabled={!pedidoSeleccionado}
        >
          Facturar Pedido
        </Button>
        {/* <Button
          variant="contained"
          color="secondary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={onVolver}
        >
          Volver
        </Button> */}
      </Box>
    </Container>
  );
};

export default FacturaDetalle;
