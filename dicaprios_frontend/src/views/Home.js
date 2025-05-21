import React from 'react';
import { Typography, Container } from '@mui/material';

const Home = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Bienvenido al Sistema de Gestión
      </Typography>
      <Typography variant="body1">
        Aquí puedes encontrar un resumen del sistema, incluyendo productos destacados, métricas del sistema y otra información importante.
      </Typography>
    </Container>
  );
};

export default Home;
