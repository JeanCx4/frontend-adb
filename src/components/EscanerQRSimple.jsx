import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import './EscanerQR.css';

const EscanerQRSimple = ({ onQRDetected, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [cameraAccess, setCameraAccess] = useState(false);
  const [lastDetectedTime, setLastDetectedTime] = useState(0);
  const webcamRef = useRef(null);
  const scannerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Inicializar el escáner con configuración simple
    scannerRef.current = new BrowserMultiFormatReader();
    
    return () => {
      stopScanning();
      if (scannerRef.current) {
        scannerRef.current.reset();
      }
    };
  }, []);

  const startScanning = async () => {
    if (!webcamRef.current || !webcamRef.current.video) {
      setError('Cámara no disponible');
      return;
    }

    setScanning(true);
    setError('');
    
    // Método más directo usando el video stream
    const video = webcamRef.current.video;
    
    intervalRef.current = setInterval(async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        try {
          // Crear canvas sin transformaciones
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Dibujar el frame actual del video
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Intentar detectar QR
          const result = await scannerRef.current.decodeFromCanvas(canvas);
          
          if (result) {
            const currentTime = Date.now();
            if (currentTime - lastDetectedTime > 2000) { // Evitar detecciones repetidas
              setLastDetectedTime(currentTime);
              handleQRDetection(result.getText());
            }
          }
        } catch (err) {
          // Ignorar errores de detección - es normal cuando no hay QR
        }
      }
    }, 500); // Escanear cada 500ms
  };

  const stopScanning = () => {
    setScanning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleQRDetection = (qrText) => {
    console.log('🎯 QR detectado:', qrText);
    stopScanning();
    
    // Extraer DNI del texto
    const dni = extractDNI(qrText);
    
    if (dni) {
      console.log('✅ DNI extraído:', dni);
      onQRDetected(dni);
    } else {
      setError(`❌ QR no válido: "${qrText}". Asegúrate de usar un código QR de estudiante.`);
      setTimeout(() => {
        setError('');
        startScanning(); // Reiniciar escaneo automáticamente
      }, 3000);
    }
  };

  const extractDNI = (text) => {
    console.log('🔍 Analizando texto QR:', text);
    
    // Limpiar el texto
    const cleanText = text.trim();
    
    // 1. Si es un número directo de 8-10 dígitos
    if (/^\d{8,10}$/.test(cleanText)) {
      return cleanText;
    }
    
    // 2. JSON con estructura de asistencia
    try {
      const parsed = JSON.parse(cleanText);
      if (parsed.dni || parsed.DNI) {
        return parsed.dni || parsed.DNI;
      }
    } catch (e) {
      // No es JSON válido
    }
    
    // 3. URL con patrón de estudiante
    const urlMatch = cleanText.match(/\/(?:perfil-)?estudiante\/(\d{8,10})/i);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    // 4. Patrón dni= o id=
    const paramMatch = cleanText.match(/(?:dni|id)[=:](\d{8,10})/i);
    if (paramMatch) {
      return paramMatch[1];
    }
    
    // 5. Cualquier secuencia de 8-10 dígitos en el texto
    const digitMatch = cleanText.match(/\b(\d{8,10})\b/);
    if (digitMatch) {
      return digitMatch[1];
    }
    
    return null;
  };

  const handleUserMedia = () => {
    setCameraAccess(true);
    console.log('📹 Cámara iniciada correctamente');
  };

  const handleUserMediaError = (error) => {
    console.error('❌ Error de cámara:', error);
    setError('No se pudo acceder a la cámara. Verifica los permisos.');
    setCameraAccess(false);
  };

  return (
    <div className="escaner-qr-overlay">
      <div className="escaner-qr-container">
        <div className="escaner-qr-header">
          <h3>📱 Escáner QR Mejorado</h3>
          <button className="btn-close-escaner" onClick={onClose}>✕</button>
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
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "environment"
              }}
            />
            
            {scanning && (
              <div className="scanning-overlay">
                <div className="scanning-frame-simple">
                  <div className="corner corner-tl"></div>
                  <div className="corner corner-tr"></div>
                  <div className="corner corner-bl"></div>
                  <div className="corner corner-br"></div>
                </div>
                <p className="scanning-text">🔍 Buscando código QR...</p>
              </div>
            )}
          </div>

          <div className="escaner-controls">
            {!scanning ? (
              <button 
                className="btn btn-success btn-lg"
                onClick={startScanning}
                disabled={!cameraAccess}
              >
                🎯 Iniciar Escaneo
              </button>
            ) : (
              <button 
                className="btn btn-warning btn-lg"
                onClick={stopScanning}
              >
                ⏹️ Detener
              </button>
            )}
          </div>

          <div className="escaner-info">
            <div className="alert alert-info">
              <strong>💡 Instrucciones:</strong>
              <ul>
                <li>Coloca el código QR dentro del marco</li>
                <li>Mantén el dispositivo estable</li>
                <li>Asegúrate de tener buena iluminación</li>
                <li>El QR debe contener un DNI válido</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscanerQRSimple;
