// src/components/PedidoForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, MenuItem } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DetallePedidoForm from './DetallePedidoForm';

const PedidoForm = ({ pedido, onPedidoUpdated }) => {
  const [fecha, setFecha] = useState(new Date());
  const [estado, setEstado] = useState('');
  const [cliente, setCliente] = useState('');
  const [clientes, setClientes] = useState([]);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  useEffect(() => {
    if (pedido) {
      setFecha(new Date(pedido.fecha));
      setEstado(pedido.estado);
      setCliente(pedido.cliente);
      setMostrarDetalles(true);
    }
    fetchClientes();
  }, [pedido]);

  const fetchClientes = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/clientes/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setClientes(response.data);
    } catch (error) {
      console.error('Error al obtener los clientes', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (pedido) {
        // Editar pedido existente
        response = await axios.put(
          `http://127.0.0.1:8000/api/pedidos/${pedido.id}/`,
          {
            fecha,
            estado,
            cliente,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (response.status === 200) {
          alert('Pedido actualizado exitosamente');
        }
      } else {
        // Crear un nuevo pedido
        response = await axios.post(
          'http://127.0.0.1:8000/api/pedidos/',
          {
            fecha,
            estado,
            cliente,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (response.status === 201) {
          alert('Pedido agregado exitosamente');
        }
      }

      onPedidoUpdated();
    } catch (error) {
      console.error('Error al guardar el pedido', error);
      alert('Error al guardar el pedido');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {pedido ? 'Editar Pedido' : 'Añadir Nuevo Pedido'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mt: 2, mb: 2 }}>
            <DatePicker
              selected={fecha}
              onChange={(date) => setFecha(date)}
              dateFormat="yyyy-MM-dd"
              customInput={
                <TextField
                  label="Fecha"
                  variant="outlined"
                  fullWidth
                  value={fecha}
                  onChange={() => {}}
                />
              }
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
          >
            <MenuItem value="Pendiente">Pendiente</MenuItem>
            <MenuItem value="Facturado">Facturado</MenuItem>
          </TextField>
          <TextField
            select
            label="Cliente"
            variant="outlined"
            margin="normal"
            fullWidth
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          >
            {clientes.map((cli) => (
              <MenuItem key={cli.id} value={cli.id}>
                {cli.nombre}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            type="submit"
          >
            {pedido ? 'Guardar Cambios' : 'Añadir Pedido'}
          </Button>
        </form>
        {pedido && (
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => setMostrarDetalles(!mostrarDetalles)}
          >
            {mostrarDetalles ? 'Ocultar Detalles' : 'Ver Detalles'}
          </Button>
        )}
        {mostrarDetalles && <DetallePedidoForm pedidoId={pedido?.id} />}
      </Box>
    </Container>
  );
};

export default PedidoForm;
