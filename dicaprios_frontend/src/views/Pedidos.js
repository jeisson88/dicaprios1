// src/views/Pedidos.js
import React from 'react';
import { Container } from '@mui/material';
import PedidosList from '../components/PedidosList';

const Pedidos = () => {
  return (
    <Container>
      <PedidosList />
    </Container>
  );
};

export default Pedidos;