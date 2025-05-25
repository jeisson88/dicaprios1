// src/components/PedidosList.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, Button, Container, Typography, Dialog, DialogActions, 
    DialogContent, DialogContentText, DialogTitle, Box, 
    CircularProgress, Alert 
} from '@mui/material';
import PedidoForm from './PedidoForm';
import { generarFacturaPDF } from './FacturaPDF'; //  Asegúrate que la ruta sea correcta
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const PedidosList = () => {
  const [todosLosPedidos, setTodosLosPedidos] = useState([]); // Todos los pedidos del backend
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]); // Pedidos filtrados para mostrar
  const [clientes, setClientes] = useState({});
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [pedidoAEliminar, setPedidoAEliminar] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingAccion, setLoadingAccion] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const fetchClientesParaPedidos = useCallback(async (pedidosData) => {
    const clientesMap = { ...clientes };
    let clientesCargados = false;
    const token = localStorage.getItem('token');
    if (!token) return;

    for (const pedido of pedidosData) {
      if (pedido.cliente && !clientesMap[pedido.cliente]) {
        try {
          const clienteResponse = await axios.get(`${API_BASE_URL}/clientes/${pedido.cliente}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          clientesMap[pedido.cliente] = clienteResponse.data.nombre_completo || clienteResponse.data.nombre || `ID: ${pedido.cliente}`;
          clientesCargados = true;
        } catch (err) {
          console.error(`Error fetching client ${pedido.cliente}`, err);
          clientesMap[pedido.cliente] = `ID: ${pedido.cliente}`;
        }
      }
    }
    if (clientesCargados) {
      setClientes(clientesMap);
    }
  }, [clientes]);


  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("No autenticado. Por favor, inicie sesión.");
        setLoading(false);
        return;
      }
      // Se obtienen TODOS los pedidos
      const response = await axios.get(`${API_BASE_URL}/pedidos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodosLosPedidos(response.data); // Guardar todos los pedidos
      if (response.data && response.data.length > 0) {
        fetchClientesParaPedidos(response.data);
      }
    } catch (err) {
      console.error('Error al obtener los pedidos', err.response || err);
      setError(err.response?.data?.detail || err.message || 'Error al cargar los pedidos');
      setTodosLosPedidos([]); // Limpiar en caso de error
    } finally {
      setLoading(false);
    }
  }, [fetchClientesParaPedidos]);

  // useEffect para filtrar los pedidos cuando 'todosLosPedidos' cambia
  useEffect(() => {
    const filtrados = todosLosPedidos.filter(p => p.estado === 'Pendiente');
    setPedidosFiltrados(filtrados);
  }, [todosLosPedidos]);

  useEffect(() => {
    if (!mostrarFormulario) {
        fetchPedidos();
    }
  }, [fetchPedidos, mostrarFormulario]);

  const handleDeleteConfirm = (id) => {
    setPedidoAEliminar(id);
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    // ... (lógica de handleDelete sin cambios, seguirá llamando a fetchPedidos que recarga todos) ...
    if (!pedidoAEliminar) return;
    setLoadingAccion(`delete-${pedidoAEliminar}`);
    setError(null);
    setSuccessMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/pedidos/${pedidoAEliminar}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage(`Pedido #${pedidoAEliminar} eliminado exitosamente.`);
      fetchPedidos(); 
    } catch (error) {
      console.error('Error al eliminar el pedido', error);
      setError(error.response?.data?.detail || 'Error al eliminar el pedido.');
    } finally {
      setOpenDialog(false);
      setPedidoAEliminar(null);
      setLoadingAccion(null);
    }
  };

  const handleEdit = (pedido) => {
    setPedidoSeleccionado(pedido);
    setMostrarFormulario(true);
  };

  const handleAddNew = () => {
    setPedidoSeleccionado(null);
    setMostrarFormulario(true);
  };

  const handlePedidoUpdated = (updatedPedido) => {
    setMostrarFormulario(false);
    setPedidoSeleccionado(null);
    if (updatedPedido) {
        // fetchPedidos() se llamará cuando mostrarFormulario cambie,
        // lo que actualizará todosLosPedidos y luego pedidosFiltrados.
        setSuccessMessage('Operación de pedido guardada exitosamente.');
    }
  };
  
  const handleFormClose = () => {
    setMostrarFormulario(false);
    setPedidoSeleccionado(null);
  };

  const handleGenerarFacturaDesdeLista = async (pedidoId) => {
    // ... (lógica de handleGenerarFacturaDesdeLista sin cambios funcionales importantes aquí) ...
    // fetchPedidos() al final de esta función es clave, ya que recargará todosLosPedidos,
    // y el useEffect que filtra actualizará pedidosFiltrados.
    setLoadingAccion(`facturar-${pedidoId}`);
    setError(null);
    setSuccessMessage('');
    const token = localStorage.getItem('token');

    if (!token) {
      setError("Error de autenticación: No se encontró el token.");
      setLoadingAccion(null);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/pedidos/${pedidoId}/generar-factura/`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const facturaData = response.data;
      setSuccessMessage(`Factura #${facturaData.id} generada para el pedido #${pedidoId}. El pedido ha sido actualizado.`);
      fetchPedidos(); // MUY IMPORTANTE: Refrescar la lista de todos los pedidos

      if (facturaData && typeof facturaData.total !== 'undefined') {
        generarFacturaPDF(facturaData)
          .then(() => { /* Opcional: Mensaje PDF descargado */ })
          .catch(pdfError => {
            console.error("Fallo la generación del PDF desde PedidosList:", pdfError);
            setError(prev => (prev ? prev + " " : "") + "Error al generar el archivo PDF.");
          });
      } else {
        console.error("No se generará el PDF: los datos de la factura son incompletos.", facturaData);
        setError(prev => (prev ? prev + " " : "") + "Datos de factura incompletos para PDF.");
      }
    } catch (err) {
      console.error('Error al generar la factura', err.response || err);
      if (err.response && err.response.status === 401) {
        setError("Error de autenticación al generar la factura. Sesión expirada?");
      } else {
        const backendError = err.response?.data?.error || err.response?.data?.detail;
        setError(backendError || 'Error desconocido al generar la factura.');
      }
    } finally {
      setLoadingAccion(null);
    }
  };

  // UI de carga: Basado en loading Y si pedidosFiltrados está vacío
  if (loading && pedidosFiltrados.length === 0) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography>Cargando pedidos pendientes...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {mostrarFormulario ? (
        <PedidoForm 
            pedido={pedidoSeleccionado} 
            onPedidoUpdated={handlePedidoUpdated} 
            onCancel={handleFormClose}
            fetchPedidosList={fetchPedidos} 
        />
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
            <Typography variant="h4" component="h1">
              Pedidos Pendientes de Facturar
            </Typography>
            <Button variant="contained" color="primary" onClick={handleAddNew}>
              Añadir Nuevo Pedido
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}
          
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table stickyHeader aria-label="tabla de pedidos pendientes">
              <TableHead>
                <TableRow>
                  <TableCell>ID Pedido</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* USAR pedidosFiltrados para renderizar la tabla */}
                {pedidosFiltrados.length === 0 && !loading ? (
                    <TableRow>
                        <TableCell colSpan={5} align="center">
                            No hay pedidos pendientes para mostrar.
                        </TableCell>
                    </TableRow>
                ) : (
                pedidosFiltrados.map((pedido) => ( // <--- CAMBIO AQUÍ
                  <TableRow hover key={pedido.id}>
                    <TableCell>{pedido.id}</TableCell>
                    <TableCell>{clientes[pedido.cliente] || `ID: ${pedido.cliente}`}</TableCell>
                    <TableCell>{new Date(pedido.fecha).toLocaleDateString('es-GT')}</TableCell>
                    <TableCell>{pedido.estado}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(pedido)}
                        disabled={loadingAccion !== null}
                        sx={{ mr: 1 }}
                      >
                        Editar/Ver
                      </Button>
                      
                      {/* La condición pedido.estado === 'Pendiente' es redundante si la lista ya está filtrada, pero no daña */}
                      {pedido.estado === 'Pendiente' && ( 
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleGenerarFacturaDesdeLista(pedido.id)}
                          disabled={loadingAccion === `facturar-${pedido.id}` || (loadingAccion !== null && loadingAccion !== `facturar-${pedido.id}`)}
                          sx={{ mr: 1 }}
                        >
                          {loadingAccion === `facturar-${pedido.id}` ? <CircularProgress size={16} color="inherit"/> : 'Facturar'}
                        </Button>
                      )}

                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteConfirm(pedido.id)}
                        disabled={loadingAccion === `delete-${pedido.id}` || (loadingAccion !== null && loadingAccion !== `delete-${pedido.id}`)}
                      >
                        {loadingAccion === `delete-${pedido.id}` ? <CircularProgress size={16} color="inherit"/> : 'Eliminar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogContent>
              <DialogContentText>
                ¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleDelete} color="error" disabled={loadingAccion && loadingAccion.startsWith('delete-')}>
                {loadingAccion && loadingAccion.startsWith('delete-') ? <CircularProgress size={16} /> : "Eliminar"}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default PedidosList;