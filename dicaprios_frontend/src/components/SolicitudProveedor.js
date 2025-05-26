import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Container, Typography, Box, TextField, MenuItem, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Alert
} from '@mui/material';

const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Ajusta si es diferente

const SolicitudProveedor = () => {
    const [proveedores, setProveedores] = useState([]);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
    const [productosDelProveedor, setProductosDelProveedor] = useState([]);
    const [cantidades, setCantidades] = useState({}); // { productoId: cantidad }

    const [loadingProveedores, setLoadingProveedores] = useState(false);
    const [loadingProductos, setLoadingProductos] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Cargar proveedores al montar el componente
    useEffect(() => {
        setLoadingProveedores(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE_URL}/proveedores/`, { // Asegúrate que esta URL sea la correcta para tu ProveedorViewSet
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setProveedores(response.data || []);
        })
        .catch(err => {
            console.error("Error cargando proveedores:", err);
            setError("Error al cargar la lista de proveedores.");
        })
        .finally(() => {
            setLoadingProveedores(false);
        });
    }, []);

    // Cargar productos cuando se selecciona un proveedor
    useEffect(() => {
        if (proveedorSeleccionado) {
            setLoadingProductos(true);
            setError(''); // Limpiar errores anteriores de productos
            setSuccessMessage('');
            setProductosDelProveedor([]); // Limpiar productos anteriores
            setCantidades({}); // Limpiar cantidades anteriores

            const token = localStorage.getItem('token');
            axios.get(`${API_BASE_URL}/productos/?proveedor_id=${proveedorSeleccionado}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setProductosDelProveedor(response.data || []);
            })
            .catch(err => {
                console.error("Error cargando productos del proveedor:", err);
                setError(`Error al cargar productos para el proveedor ID ${proveedorSeleccionado}.`);
            })
            .finally(() => {
                setLoadingProductos(false);
            });
        } else {
            setProductosDelProveedor([]); // Limpiar si no hay proveedor seleccionado
            setCantidades({});
        }
    }, [proveedorSeleccionado]);

    const handleCantidadChange = (productoId, cantidad) => {
        const cantNum = parseInt(cantidad, 10);
        setCantidades(prev => ({
            ...prev,
            [productoId]: isNaN(cantNum) || cantNum < 0 ? 0 : cantNum, // Guardar como número, mínimo 0
        }));
    };

    const handleSubmitSolicitud = async () => {
        setError('');
        setSuccessMessage('');
        setLoadingSubmit(true);

        const productosParaActualizar = Object.entries(cantidades)
            .filter(([productoId, cantidad]) => cantidad > 0) // Solo enviar los que tengan cantidad > 0
            .map(([productoId, cantidad]) => ({
                producto_id: parseInt(productoId, 10), // Asegurar que producto_id es número
                cantidad_a_anadir: cantidad,
            }));

        if (productosParaActualizar.length === 0) {
            setError("No se han especificado cantidades para ningún producto.");
            setLoadingSubmit(false);
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(
                `${API_BASE_URL}/productos/actualizar-stock-lote/`,
                productosParaActualizar,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccessMessage(response.data.mensaje || "Stock actualizado exitosamente.");
            // Resetear cantidades y opcionalmente recargar productos para ver stock actualizado
            setCantidades({});
            // Para ver el stock actualizado inmediatamente, se deberían recargar los productos del proveedor
            if (proveedorSeleccionado) {
                // Re-trigger useEffect para productos
                const currentSelection = proveedorSeleccionado;
                setProveedorSeleccionado(''); // Forzar cambio
                setTimeout(() => setProveedorSeleccionado(currentSelection), 0); // y luego restaurar
            }

        } catch (err) {
            console.error("Error al actualizar stock:", err.response || err);
            setError(err.response?.data?.error || err.response?.data?.mensaje || "Error al procesar la solicitud.");
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Solicitud a Proveedores (Actualizar Stock)
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>1. Seleccione un Proveedor</Typography>
                {loadingProveedores ? <CircularProgress size={24} /> : (
                    <TextField
                        select
                        label="Proveedor"
                        value={proveedorSeleccionado}
                        onChange={(e) => setProveedorSeleccionado(e.target.value)}
                        fullWidth
                        variant="outlined"
                        disabled={loadingProveedores}
                    >
                        <MenuItem value=""><em>-- Seleccione un Proveedor --</em></MenuItem>
                        {proveedores.map(p => (
                            <MenuItem key={p.id} value={p.id}>{p.nombre_proveedor}</MenuItem>
                        ))}
                    </TextField>
                )}
            </Paper>

            {proveedorSeleccionado && (
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        2. Especifique Cantidades a Recibir/Solicitar (para añadir al stock)
                    </Typography>
                    {loadingProductos ? <CircularProgress /> : (
                        productosDelProveedor.length > 0 ? (
                            <TableContainer component={Paper} sx={{ mt: 2 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID Producto</TableCell>
                                            <TableCell>Nombre Producto</TableCell>
                                            <TableCell>Stock Actual</TableCell>
                                            <TableCell sx={{width: '150px'}}>Cantidad a Añadir</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {productosDelProveedor.map(producto => (
                                            <TableRow key={producto.id}>
                                                <TableCell>{producto.id}</TableCell>
                                                <TableCell>{producto.nombre_producto}</TableCell>
                                                <TableCell>{producto.stock}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        value={cantidades[producto.id] || ''}
                                                        onChange={(e) => handleCantidadChange(producto.id, e.target.value)}
                                                        size="small"
                                                        variant="outlined"
                                                        InputProps={{ inputProps: { min: 0 } }}
                                                        sx={{width: '100px'}}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography sx={{mt: 2}}>
                                No hay productos asociados a este proveedor o no se pudieron cargar.
                            </Typography>
                        )
                    )}
                    {productosDelProveedor.length > 0 && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmitSolicitud}
                            disabled={loadingSubmit || loadingProductos}
                            sx={{ mt: 3 }}
                        >
                            {loadingSubmit ? <CircularProgress size={24} color="inherit" /> : "Actualizar Stock de Productos Seleccionados"}
                        </Button>
                    )}
                </Paper>
            )}
        </Container>
    );
};

export default SolicitudProveedor;