import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Container, Typography } from '@mui/material';
import PedidoForm from './PedidoForm';

const PedidosList = () => {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState({});
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/pedidos/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setPedidos(response.data);
      fetchClientesParaPedidos(response.data);
    } catch (error) {
      console.error('Error al obtener los pedidos', error);
    }
  };

  const fetchClientesParaPedidos = async (pedidos) => {
    try {
      const clientesData = {};
      for (const pedido of pedidos) {
        if (!clientesData[pedido.cliente]) {
          const clienteResponse = await axios.get(`http://127.0.0.1:8000/api/clientes/${pedido.cliente}/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          clientesData[pedido.cliente] = clienteResponse.data.nombre;
        }
      }
      setClientes((prevClientes) => ({ ...prevClientes, ...clientesData }));
    } catch (error) {
      console.error('Error al obtener los clientes', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/pedidos/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchPedidos();
    } catch (error) {
      console.error('Error al eliminar el pedido', error);
    }
  };

  const handleEdit = (pedido) => {
    setPedidoSeleccionado(pedido);
    setMostrarFormulario(true);
  };

  const handlePedidoUpdated = () => {
    setMostrarFormulario(false);
    setPedidoSeleccionado(null);
    fetchPedidos();
  };

  return (
    <Container>
      {mostrarFormulario ? (
        <PedidoForm pedido={pedidoSeleccionado} onPedidoUpdated={handlePedidoUpdated} />
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Gestión de Pedidos
          </Typography>
          <Button variant="contained" color="primary" onClick={() => setMostrarFormulario(true)}>
            Añadir Nuevo Pedido
          </Button>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell>{pedido.id}</TableCell>
                    <TableCell>{pedido.fecha}</TableCell>
                    <TableCell>{pedido.estado}</TableCell>
                    <TableCell>{clientes[pedido.cliente] || 'Cargando...'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEdit(pedido)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleDelete(pedido.id)}
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

export default PedidosList;
