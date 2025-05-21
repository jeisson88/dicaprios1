// src/components/HomePage.js
import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/dicaprios_logo.png'; // Asegúrate de colocar la imagen en la carpeta `src/assets` con el nombre `dicaprios_logo.png`

const HomePage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login'); // Redirige al usuario a la página de inicio de sesión
  };

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
      <Box sx={{ mb: 4 }}>
        <img src={logo} alt="Dicaprios Logo" style={{ maxWidth: '200px' }} />
      </Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Bienvenidos a Dicaprios Sport
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Misión
        </Typography>
        <Typography variant="body1" paragraph>
          Convertirnos en una empresa global de calzado, comprometida con la excelencia y la innovación, brindando productos de la más alta calidad que
           combinen estilo, confort y sostenibilidad. Nos enfocamos en mejorar la vida de nuestros clientes a través de diseños únicos que reflejen sus
            valores y personalidad, al tiempo que fomentamos prácticas responsables y éticas en toda nuestra cadena de suministro.
        </Typography>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Visión
        </Typography>
        <Typography variant="body1" paragraph>
          Ser una marca de calzado líder a nivel nacional, reconocida por nuestra capacidad de influir en la moda y la cultura global, mientras adoptamos 
          tecnologías sostenibles e inclusivas que marquen un estándar en la industria del calzado. Aspiramos a inspirar cambios positivos en el país a 
          través de nuestros productos, promoviendo una economía circular y construyendo comunidades más fuertes y comprometidas con el bienestar social y 
          ambiental.
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleLoginClick}
        sx={{ mt: 4 }}
      >
        Ir al Login
      </Button>
    </Container>
  );
};

export default HomePage;
