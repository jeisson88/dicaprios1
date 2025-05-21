// src/views/Productos.js
import React from 'react';
import ProductosList from '../components/ProductosList';
import { Container } from '@mui/material';

const Productos = () => {
  return (
    <Container>
      <ProductosList />
    </Container>
  );
};

export default Productos;
