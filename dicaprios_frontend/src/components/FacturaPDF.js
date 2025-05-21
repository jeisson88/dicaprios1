// src/components/FacturaPDF.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const FacturaPDF = ({ factura }) => {
  return (
    <div id="factura-pdf" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', margin: '0' }}>Dicaprios Sport</h1>
        <h2 style={{ fontSize: '20px', margin: '5px 0' }}>Factura del Pedido</h2>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Pedido ID:</strong> {factura.pedido}</p>
        <p><strong>Fecha de Emisión:</strong> {factura.fecha_emision}</p>
        <p><strong>Cliente:</strong> {factura.cliente}</p>
        <p><strong>Total:</strong> Q{factura.total.toFixed(2)}</p>
      </div>
      <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Detalles del Pedido:</h3>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '20px',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Producto</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Cantidad</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Precio Unitario</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {factura.detalles.map((detalle, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{detalle.producto}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{detalle.cantidad}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>Q{parseFloat(detalle.precio_unitario).toFixed(2)}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>Q{parseFloat(detalle.subtotal).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>Gracias por su compra en Dicaprios Sport</p>
      </div>
    </div>
  );
};

export const generarFacturaPDF = (factura) => {
  // Crear un div temporal en el documento para renderizar el contenido del PDF
  const input = document.createElement('div');
  document.body.appendChild(input);

  // Renderizar el componente FacturaPDF dentro del div temporal
  const root = ReactDOM.createRoot(input);
  root.render(<FacturaPDF factura={factura} />);

  // Esperar un momento para que el contenido se renderice antes de generar el PDF
  setTimeout(() => {
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        pdf.addImage(imgData, 'PNG', 10, 10, 190, 0); // Ajustar la posición y el tamaño de la imagen
        pdf.save(`Factura_Pedido_${factura.pedido}.pdf`);
      })
      .catch((error) => {
        console.error('Error al generar el PDF:', error);
      })
      .finally(() => {
        // Limpiar el DOM eliminando el div temporal
        document.body.removeChild(input);
      });
  }, 500);
};

export default FacturaPDF;
