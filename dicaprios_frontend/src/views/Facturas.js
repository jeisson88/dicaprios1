// src/views/Facturas.js
import React from 'react';
import { Container } from '@mui/material';
import FacturasList from '../components/FacturaDetalle';

const Facturas = () => {
  return (
    <Container>
      <FacturasList />
    </Container>
  );
};

export default Facturas;