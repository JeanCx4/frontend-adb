import React, { useState } from 'react';
import QRCode from 'qrcode';

const GeneradorQRPrueba = () => {
  const [dni, setDni] = useState('12345678');
  const [qrImage, setQrImage] = useState('');
  const [tipoQR, setTipoQR] = useState('simple');

  const generarQR = async () => {
    try {
      let qrData;
      
      if (tipoQR === 'simple') {
        qrData = dni;
      } else if (tipoQR === 'json') {
        qrData = JSON.stringify({
          tipo: 'asistencia',
          dni: dni,
          timestamp: Date.now()
        });
      } else {
        qrData = `http://localhost:3001/perfil-estudiante/${dni}`;
      }

      const qrDataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        scale: 8,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrImage(qrDataURL);
    } catch (error) {
      console.error('Error generando QR:', error);
    }
  };

  const copiarTexto = () => {
    let qrData;
    if (tipoQR === 'simple') {
      qrData = dni;
    } else if (tipoQR === 'json') {
      qrData = JSON.stringify({
        tipo: 'asistencia',
        dni: dni,
        timestamp: Date.now()
      });
    } else {
      qrData = `http://localhost:3001/perfil-estudiante/${dni}`;
    }
    
    navigator.clipboard.writeText(qrData);
    alert('Texto copiado al portapapeles');
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h5>🧪 Generador de QR de Prueba</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">DNI:</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Ingresa un DNI de 8 dígitos"
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Tipo de QR:</label>
                <select 
                  className="form-select"
                  value={tipoQR}
                  onChange={(e) => setTipoQR(e.target.value)}
                >
                  <option value="simple">DNI Simple</option>
                  <option value="json">JSON Asistencia</option>
                  <option value="url">URL Perfil</option>
                </select>
              </div>

              <div className="d-flex gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={generarQR}
                >
                  🎯 Generar QR
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={copiarTexto}
                >
                  📋 Copiar Texto
                </button>
              </div>

              <div className="mt-3">
                <small className="text-muted">
                  <strong>Contenido del QR:</strong><br/>
                  {tipoQR === 'simple' && dni}<br/>
                  {tipoQR === 'json' && JSON.stringify({tipo: 'asistencia', dni: dni, timestamp: 'timestamp'}, null, 2)}<br/>
                  {tipoQR === 'url' && `http://localhost:3001/perfil-estudiante/${dni}`}
                </small>
              </div>
            </div>
            
            <div className="col-md-6">
              {qrImage && (
                <div className="text-center">
                  <h6>Código QR Generado:</h6>
                  <img 
                    src={qrImage} 
                    alt="Código QR"
                    className="img-fluid"
                    style={{ 
                      maxWidth: '300px',
                      border: '2px solid #ddd',
                      padding: '10px',
                      backgroundColor: 'white'
                    }}
                  />
                  <div className="mt-2">
                    <small className="text-success">
                      ✅ Usa este QR para probar el escáner
                    </small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneradorQRPrueba;
