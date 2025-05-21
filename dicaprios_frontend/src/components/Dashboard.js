import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemText, Box, CssBaseline, AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material';
import { Home, People, ShoppingCart, Category, LocalShipping, Receipt, Menu, Logout } from '@mui/icons-material';

const Dashboard = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Perform logout logic here
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Dicaprios Sport
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" component={Link} to="/">
              <Home />
            </IconButton>
            <IconButton color="inherit" component={Link} to="/clientes">
              <People />
            </IconButton>
            <IconButton color="inherit" component={Link} to="/pedidos">
              <ShoppingCart />
            </IconButton>
            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button component={Link} to="/">
              <Home sx={{ mr: 2 }} />
              <ListItemText primary="Inicio" />
            </ListItem>
            <ListItem button component={Link} to="/clientes">
              <People sx={{ mr: 2 }} />
              <ListItemText primary="Gestión de Clientes" />
            </ListItem>
            <ListItem button component={Link} to="/productos">
              <Category sx={{ mr: 2 }} />
              <ListItemText primary="Gestión de Productos" />
            </ListItem>
            <ListItem button component={Link} to="/categorias">
              <Category sx={{ mr: 2 }} />
              <ListItemText primary="Gestión de Categorias" />
            </ListItem>
            <ListItem button component={Link} to="/proveedores">
              <LocalShipping sx={{ mr: 2 }} />
              <ListItemText primary="Gestión de Proveedores" />
            </ListItem>
            <ListItem button component={Link} to="/pedidos">
              <ShoppingCart sx={{ mr: 2 }} />
              <ListItemText primary="Gestión de Pedidos" />
            </ListItem>
            <ListItem button component={Link} to="/facturas">
              <Receipt sx={{ mr: 2 }} />
              <ListItemText primary="Facturación" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Dashboard;