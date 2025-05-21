import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './views/Home';
import Clientes from './views/Clientes';
import Productos from './views/Productos';
import Categorias from './views/Categorias';
import Proveedores from './views/Proveedores';
import Pedidos from './views/Pedidos';
import Facturas from './views/Facturas';
import React from 'react';
import Dashboard from './components/Dashboard';
import ListadoFacturas from './components/FacturasList';
import Login from './components/Login';
import HomePage from './components/HomePage';


function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para la página pública */}
        <Route path="/" element={<HomePage />} />
        
        {/* Ruta para Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route
          path="/*"
          element={
            localStorage.getItem('token') ? (
              <Dashboard>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/productos" element={<Productos />} />
                  <Route path="/categorias" element={<Categorias/>} />
                  <Route path="/proveedores" element={<Proveedores/>} />
                  <Route path="/pedidos" element={<Pedidos />} />
                  <Route path="/facturas" element={<Facturas />} />
                  <Route path="/facturaslista" element={<ListadoFacturas />} />
                </Routes>
              </Dashboard>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

