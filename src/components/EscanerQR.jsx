import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import './EscanerQR.css';

const EscanerQR = ({ onQRDetected, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [cameraAccess, setCameraAccess] = useState(false);
  const [lastScan, setLastScan] = useState('');
  const webcamRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());
  const scanInterval = useRef(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    // Inicializar el lector QR con configuraciones optimizadas
    const hints = new Map();
    hints.set('TRY_HARDER', true);
    hints.set('POSSIBLE_FORMATS', ['QR_CODE']);
    codeReader.current = new BrowserMultiFormatReader(hints);

    // Limpiar al desmontar el componente
    return () => {
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
      }
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  const startScanning = () => {
    if (!webcamRef.current) {
      setError('Cámara no disponible');
      return;
    }

    setScanning(true);
    setError('');
    isProcessing.current = false;

    // Reducir la frecuencia de escaneo para mejor rendimiento
    scanInterval.current = setInterval(async () => {
      if (isProcessing.current) return;

      try {
        const video = webcamRef.current.video;
        if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
          isProcessing.current = true;

          // Crear canvas con resolución optimizada
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          // Usar resolución más baja para mejor rendimiento
          const scale = 0.5;
          canvas.width = video.videoWidth * scale;
          canvas.height = video.videoHeight * scale;
          
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          try {
            const result = await codeReader.current.decodeFromCanvas(canvas);
            if (result && result.getText()) {
              const qrText = result.getText();
              
              // Evitar procesar el mismo QR múltiples veces
              if (qrText !== lastScan) {
                setLastScan(qrText);
                stopScanning();
                
                // Extraer DNI del resultado
                const dniMatch = extractDNIFromQR(qrText);
                
                if (dniMatch) {
                  onQRDetected(dniMatch);
                } else {
                  setError('QR no válido para asistencia. Asegúrate de usar un QR de estudiante.');
                  setTimeout(() => {
                    setError('');
                    setLastScan('');
                  }, 3000);
                }
              }
            }
          } catch (err) {
            // No se detectó QR, continuar escaneando
          } finally {
            isProcessing.current = false;
          }
        }
      } catch (err) {
        console.error('Error escaneando:', err);
        setError('Error al escanear QR');
        isProcessing.current = false;
      }
    }, 300); // Escanear cada 300ms en lugar de 100ms
  };

  const stopScanning = () => {
    setScanning(false);
    if (scanInterval.current) {
      clearInterval(scanInterval.current);
      scanInterval.current = null;
    }
  };

  const extractDNIFromQR = (qrText) => {
    try {
      console.log('QR detectado:', qrText); // Para debugging
      
      // Limpiar el texto
      const cleanText = qrText.trim();
      
      // 1. Intentar parsear como JSON primero (QR de asistencia)
      try {
        const qrData = JSON.parse(cleanText);
        if (qrData.tipo === 'asistencia' && qrData.dni) {
          console.log('DNI extraído de JSON:', qrData.dni);
          return qrData.dni;
        }
      } catch (jsonErr) {
        // No es JSON, continuar con otros formatos
      }

      // 2. Buscar URL con patrón de perfil de estudiante
      const urlPatterns = [
        /\/perfil-estudiante\/(\d{8,10})/,
        /\/estudiante\/(\d{8,10})/,
        /dni[=:](\d{8,10})/i,
        /id[=:](\d{8,10})/i
      ];
      
      for (const pattern of urlPatterns) {
        const match = cleanText.match(pattern);
        if (match && match[1]) {
          console.log('DNI extraído de URL:', match[1]);
          return match[1];
        }
      }
      
      // 3. Si es directamente un DNI (8-10 dígitos)
      const dniPattern = /^(\d{8,10})$/;
      const dniMatch = cleanText.match(dniPattern);
      if (dniMatch) {
        console.log('DNI directo:', dniMatch[1]);
        return dniMatch[1];
      }
      
      // 4. Buscar cualquier secuencia de 8-10 dígitos en el texto
      const digitPattern = /(\d{8,10})/;
      const digitMatch = cleanText.match(digitPattern);
      if (digitMatch) {
        console.log('DNI encontrado en texto:', digitMatch[1]);
        return digitMatch[1];
      }
      
      console.log('No se pudo extraer DNI del QR');
      return null;
    } catch (err) {
      console.error('Error extrayendo DNI:', err);
      return null;
    }
  };

  const handleUserMedia = () => {
    setCameraAccess(true);
  };

  const handleUserMediaError = (error) => {
    console.error('Error accediendo a la cámara:', error);
    setError('No se pudo acceder a la cámara. Verifique los permisos.');
    setCameraAccess(false);
  };

  return (
    <div className="escaner-qr-overlay">
      <div className="escaner-qr-container">
        <div className="escaner-qr-header">
          <h3>📱 Escáner de Asistencia QR</h3>
          <button 
            className="btn-close-escaner" 
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="escaner-qr-content">
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <div className="camera-container">
            <Webcam
              ref={webcamRef}
              audio={false}
              width={400}
              height={300}
              screenshotFormat="image/jpeg"
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              videoConstraints={{
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: "environment", // Preferir cámara trasera en móviles
                frameRate: { ideal: 15, max: 30 } // Limitar frame rate para mejor rendimiento
              }}
            />
            
            {scanning && (
              <div className="scanning-overlay">
                <div className="scanning-frame"></div>
                <p className="scanning-text">Buscando código QR...</p>
              </div>
            )}
          </div>

          <div className="escaner-controls">
            {!scanning ? (
              <button 
                className="btn btn-primary btn-lg"
                onClick={startScanning}
                disabled={!cameraAccess}
              >
                🎯 Iniciar Escaneo
              </button>
            ) : (
              <button 
                className="btn btn-secondary btn-lg"
                onClick={stopScanning}
              >
                ⏹️ Detener Escaneo
              </button>
            )}
          </div>

          <div className="escaner-instructions">
            <p><strong>Instrucciones:</strong></p>
            <ul>
              <li>Asegúrate de tener buena iluminación</li>
              <li>Coloca el código QR dentro del marco de la cámara</li>
              <li>Mantén el dispositivo estable</li>
              <li>El escáner detectará automáticamente el código QR</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscanerQR;
