// src/components/FacturasList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Container, Typography } from '@mui/material';
import FacturaDetalle from './FacturaDetalle';

const FacturasList = () => {
  const [facturas, setFacturas] = useState([]);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  useEffect(() => {
    fetchFacturas();
  }, []);

  const fetchFacturas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/facturas/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFacturas(response.data);
    } catch (error) {
      console.error('Error al obtener las facturas', error);
    }
  };

  const handleVerDetalle = (factura) => {
    setFacturaSeleccionada(factura);
    setMostrarDetalle(true);
  };

  return (
    <Container>
      {mostrarDetalle ? (
        <FacturaDetalle factura={facturaSeleccionada} onVolver={() => setMostrarDetalle(false)} />
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Gestión de Facturas
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha de Emisión</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {facturas.map((factura) => (
                  <TableRow key={factura.id}>
                    <TableCell>{factura.id}</TableCell>
                    <TableCell>{factura.fecha_emision}</TableCell>
                    <TableCell>{factura.cliente_nombre}</TableCell>
                    <TableCell>{factura.total}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleVerDetalle(factura)}
                      >
                        Ver Detalle
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

export default FacturasList;

