import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VisualizadorQR = ({ dni, onClose }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (dni) {
      generarQR();
    }
  }, [dni]);

  const generarQR = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${API_URL}/estudiantes/qr-asistencia/${dni}`);
      setQrData(response.data);
    } catch (err) {
      console.error('Error generando QR:', err);
      setError('Error al generar código QR');
    } finally {
      setLoading(false);
    }
  };

  const descargarQR = () => {
    if (!qrData?.qr?.image) return;

    const link = document.createElement('a');
    link.href = qrData.qr.image;
    link.download = `QR_Asistencia_${qrData.estudiante.DNI}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const imprimirQR = () => {
    if (!qrData) return;

    const ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(`
      <html>
        <head>
          <title>Código QR - ${qrData.estudiante.NOMBRES} ${qrData.estudiante.APELLIDOS}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px; 
            }
            .qr-container { 
              border: 2px solid #ccc; 
              padding: 20px; 
              margin: 20px auto; 
              max-width: 400px; 
            }
            .qr-image { 
              width: 250px; 
              height: 250px; 
              margin: 20px auto; 
            }
            .student-info { 
              margin: 10px 0; 
              font-size: 14px; 
            }
            .instructions { 
              font-size: 12px; 
              color: #666; 
              margin-top: 20px; 
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>Código QR para Asistencia</h2>
            <div class="student-info">
              <strong>Estudiante:</strong> ${qrData.estudiante.NOMBRES} ${qrData.estudiante.APELLIDOS}<br>
              <strong>DNI:</strong> ${qrData.estudiante.DNI}
            </div>
            <img src="${qrData.qr.image}" alt="Código QR" class="qr-image">
            <div class="instructions">
              <p>Presenta este código QR para registrar tu asistencia</p>
              <p>Mantén el código visible y en buen estado</p>
            </div>
          </div>
        </body>
      </html>
    `);
    
    ventanaImpresion.document.close();
    setTimeout(() => {
      ventanaImpresion.print();
      ventanaImpresion.close();
    }, 500);
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">📱 Código QR para Asistencia</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {loading && (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Generando QR...</span>
                </div>
                <p className="mt-2">Generando código QR...</p>
              </div>
            )}

            {error && (
              <div className="alert alert-danger">
                {error}
                <button 
                  className="btn btn-sm btn-outline-primary ms-2"
                  onClick={generarQR}
                >
                  Reintentar
                </button>
              </div>
            )}

            {qrData && !loading && (
              <div className="text-center">
                <div className="mb-3">
                  <h6>Estudiante: {qrData.estudiante.NOMBRES} {qrData.estudiante.APELLIDOS}</h6>
                  <p className="text-muted">DNI: {qrData.estudiante.DNI}</p>
                </div>

                <div className="qr-display mb-4">
                  <img 
                    src={qrData.qr.image}
                    alt="Código QR"
                    className="img-fluid"
                    style={{ maxWidth: '300px', border: '2px solid #ddd', padding: '10px' }}
                  />
                </div>

                <div className="alert alert-info">
                  <small>
                    <strong>Instrucciones:</strong><br/>
                    • Presenta este código QR para registrar asistencia<br/>
                    • Mantén el código visible y legible<br/>
                    • El código es único para este estudiante
                  </small>
                </div>

                <div className="d-flex gap-2 justify-content-center">
                  <button 
                    className="btn btn-primary"
                    onClick={descargarQR}
                  >
                    💾 Descargar
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={imprimirQR}
                  >
                    🖨️ Imprimir
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={generarQR}
                  >
                    🔄 Regenerar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizadorQR;
