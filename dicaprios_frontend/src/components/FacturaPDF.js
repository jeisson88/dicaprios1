// src/components/FacturaPDF.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Asegúrate que esté importado si usas root.render
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const FacturaPDF = ({ factura }) => {
  // Verificar si 'factura' y 'factura.total' existen y convertir 'total' a número
  const totalFactura = factura && factura.total !== undefined && factura.total !== null 
                       ? parseFloat(factura.total) 
                       : 0;

  // Formatear fecha de emisión
  const fechaEmisionFormateada = factura && factura.fecha_emision 
                                 ? new Date(factura.fecha_emision).toLocaleDateString('es-GT', {
                                     year: 'numeric', month: 'long', day: 'numeric',
                                     hour: '2-digit', minute: '2-digit' // Opcional si quieres hora
                                   })
                                 : 'Fecha no disponible';
  
  // Obtener el nombre del cliente (asumiendo que el serializer lo envía como 'cliente_nombre')
  // o el ID del cliente si el nombre no está.
  const nombreCliente = factura && (factura.cliente_nombre || (factura.cliente ? `ID: ${factura.cliente}` : 'No especificado'));
  
  // Obtener el ID del pedido. El serializer que propuse envía 'pedido_id_original' o 'pedido_id'.
  // Si `factura.pedido` es un objeto, entonces `factura.pedido.id`. Si es solo un ID, entonces `factura.pedido`.
  const pedidoReferencia = factura && (factura.pedido_id_original || factura.pedido_id || (typeof factura.pedido === 'object' ? factura.pedido.id : factura.pedido) || 'N/A');


  return (
    // Es importante que este div tenga un ID si html2canvas lo usa directamente, o que se pase el elemento correcto a html2canvas
    <div id={`factura-pdf-content-${factura.id || 'temp'}`} style={{ padding: '20px', fontFamily: 'Arial, sans-serif', width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', margin: '0' }}>Dicaprios Sport</h1>
        <h2 style={{ fontSize: '20px', margin: '5px 0' }}>Factura</h2> {/* Simplificado */}
      </div>
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <p><strong>Factura ID:</strong> {factura.id || 'N/A'}</p>
        <p><strong>Pedido Referencia ID:</strong> {pedidoReferencia}</p>
        <p><strong>Fecha de Emisión:</strong> {fechaEmisionFormateada}</p>
        <p><strong>Cliente:</strong> {nombreCliente}</p>
        <p><strong>Total:</strong> Q{ (isNaN(totalFactura) ? 0 : totalFactura).toFixed(2) }</p> {/* Usar totalFactura y verificar NaN */}
      </div>
      <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Detalles de la Factura:</h3>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '20px',
          fontSize: '10pt' // Tamaño de fuente más pequeño para tablas
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Producto</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Cantidad</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Precio Unitario</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {factura && factura.detalles && factura.detalles.length > 0 ? (
            factura.detalles.map((detalle, index) => (
              <tr key={detalle.id || index}>
                <td style={{ border: '1px solid #ddd', padding: '6px' }}>
                  {detalle.producto_nombre || `ID: ${detalle.producto}`}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>
                  {detalle.cantidad}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>
                  Q{parseFloat(detalle.precio_unitario).toFixed(2)}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>
                  Q{parseFloat(detalle.subtotal).toFixed(2)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                No hay detalles para esta factura.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={{ textAlign: 'right', marginTop: '20px', paddingRight: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <h3 style={{ margin: '0' }}>Total General: Q{ (isNaN(totalFactura) ? 0 : totalFactura).toFixed(2) }</h3>
      </div>
      <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '9pt', color: '#555' }}>
        <p>Gracias por su compra en Dicaprios Sport</p>
        {/* Podrías añadir más información de la empresa aquí */}
      </div>
    </div>
  );
};

export const generarFacturaPDF = (facturaData) => {
  // Asegurarse de que facturaData es un objeto y no es null/undefined
  if (!facturaData || typeof facturaData !== 'object') {
    console.error("generarFacturaPDF: facturaData es inválido.", facturaData);
    alert("No se pueden generar los datos del PDF de la factura debido a datos incorrectos.");
    return;
  }

  const inputDiv = document.createElement('div');
  // Estilo para el div temporal para que no sea visible pero tenga dimensiones para el renderizado
  inputDiv.style.position = 'absolute';
  inputDiv.style.left = '-9999px'; 
  inputDiv.style.width = '210mm'; // Ancho A4
  document.body.appendChild(inputDiv);

  const root = ReactDOM.createRoot(inputDiv);
  // Usar Promise para manejar el renderizado asíncrono y la generación de PDF
  return new Promise((resolve, reject) => {
    // React 18 renderiza de forma asíncrona, usar un callback o setTimeout corto
    root.render(<FacturaPDF factura={facturaData} />);
    
    setTimeout(() => {
      html2canvas(inputDiv, { 
        scale: 2, // Aumentar escala para mejor resolución
        useCORS: true // Si tienes imágenes de otros dominios
      })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });
          
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgProps= pdf.getImageProperties(imgData);
          const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
          let heightLeft = imgHeight;
          let position = 10; // Margen superior inicial
          const leftMargin = 10;
          const effectivePdfWidth = pdfWidth - 2 * leftMargin; // Ancho útil

          pdf.addImage(imgData, 'PNG', leftMargin, position, effectivePdfWidth, imgHeight);
          heightLeft -= (pdfHeight - position - 10); // 10 es margen inferior

          while (heightLeft > 0) {
            position = heightLeft - imgHeight; // Mover la posición de la imagen en el canvas original
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', leftMargin, position, effectivePdfWidth, imgHeight);
            heightLeft -= pdfHeight;
          }
          
          pdf.save(`Factura_${facturaData.id || 'TEMP'}_Pedido_${facturaData.pedido_id_original || facturaData.pedido || 'N_A'}.pdf`);
          resolve(); // Resuelve la promesa si todo va bien
        })
        .catch((error) => {
          console.error('Error al generar el PDF con html2canvas:', error);
          alert("Error al generar el archivo PDF de la factura.");
          reject(error); // Rechaza la promesa en caso de error
        })
        .finally(() => {
          // Limpiar: desmontar el componente y remover el div temporal
          root.unmount();
          document.body.removeChild(inputDiv);
        });
    }, 500); // Un pequeño retraso para asegurar que el renderizado se complete
  });
};