import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import './EscanerQR.css';

const EscanerQRFuncional = ({ onQRDetected, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [cameraAccess, setCameraAccess] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [metodosIntentados, setMetodosIntentados] = useState([]);
  const webcamRef = useRef(null);
  const codeReader = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Configurar el lector con configuraciones optimizadas
    codeReader.current = new BrowserMultiFormatReader();
    console.log('🔧 Escáner QR inicializado');
    
    return () => {
      stopScanning();
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  const startScanning = () => {
    if (!webcamRef.current?.video) {
      setError('❌ Cámara no disponible');
      return;
    }

    console.log('🎯 Iniciando escaneo...');
    setScanning(true);
    setError('');
    setMetodosIntentados([]);
    
    intervalRef.current = setInterval(tryDetectQR, 1000); // Cada segundo
  };

  const stopScanning = () => {
    console.log('⏹️ Deteniendo escaneo...');
    setScanning(false);
    setProcesando(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const tryDetectQR = async () => {
    if (procesando || !webcamRef.current?.video) return;
    
    setProcesando(true);
    const video = webcamRef.current.video;
    
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      setProcesando(false);
      return;
    }

    try {
      // Método 1: ZXing con canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Dibujar el frame actual
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Intentar con ZXing
      try {
        const result = await codeReader.current.decodeFromCanvas(canvas);
        if (result?.text) {
          console.log('✅ ZXing detectó:', result.text);
          handleDetection(result.text, 'ZXing Local');
          return;
        }
      } catch (zxingError) {
        console.log('⚠️ ZXing falló:', zxingError.message);
        if (!metodosIntentados.includes('ZXing')) {
          setMetodosIntentados(prev => [...prev, 'ZXing']);
        }
      }

      // Método 2: Solo si ZXing falló varias veces, usar API
      if (metodosIntentados.includes('ZXing')) {
        await tryWithAPI(canvas);
      }

    } catch (error) {
      console.log('❌ Error en detección:', error);
    } finally {
      setProcesando(false);
    }
  };

  const tryWithAPI = async (canvas) => {
    try {
      console.log('🌐 Intentando con API...');
      
      // Convertir canvas a blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });

      // Crear FormData
      const formData = new FormData();
      formData.append('file', blob, 'qr.jpg');

      // Intentar con API simple y confiable
      const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
        method: 'POST',
        body: formData,
        timeout: 5000 // 5 segundos timeout
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Respuesta API:', data);
        
        if (data && data[0] && data[0].symbol && data[0].symbol[0] && data[0].symbol[0].data) {
          const qrText = data[0].symbol[0].data;
          console.log('✅ API detectó:', qrText);
          handleDetection(qrText, 'QR Server API');
          return;
        }
      }

      if (!metodosIntentados.includes('API')) {
        setMetodosIntentados(prev => [...prev, 'API']);
      }

    } catch (apiError) {
      console.log('❌ API falló:', apiError);
      if (!metodosIntentados.includes('API')) {
        setMetodosIntentados(prev => [...prev, 'API Failed']);
      }
    }
  };

  const handleDetection = (qrText, metodo) => {
    console.log(`🎯 QR detectado con ${metodo}:`, qrText);
    stopScanning();
    
    const dni = extractDNI(qrText);
    
    if (dni) {
      console.log('✅ DNI extraído:', dni);
      onQRDetected(dni);
    } else {
      setError(`❌ QR detectado pero no contiene un DNI válido: "${qrText}"`);
      console.log('❌ No se pudo extraer DNI de:', qrText);
      setTimeout(() => {
        setError('');
        startScanning(); // Reiniciar escaneo
      }, 3000);
    }
  };

  const extractDNI = (text) => {
    console.log('🔍 Extrayendo DNI de:', text);
    const cleanText = text.trim();
    
    // 1. DNI directo (8-10 dígitos)
    if (/^\d{8,10}$/.test(cleanText)) {
      console.log('✅ DNI directo encontrado:', cleanText);
      return cleanText;
    }
    
    // 2. JSON con dni
    try {
      const parsed = JSON.parse(cleanText);
      if (parsed.dni || parsed.DNI) {
        console.log('✅ DNI desde JSON:', parsed.dni || parsed.DNI);
        return parsed.dni || parsed.DNI;
      }
    } catch (e) {
      // No es JSON
    }
    
    // 3. URL con patrón /estudiante/12345678
    const urlMatch = cleanText.match(/\/(?:perfil-)?estudiante\/(\d{8,10})/i);
    if (urlMatch) {
      console.log('✅ DNI desde URL:', urlMatch[1]);
      return urlMatch[1];
    }
    
    // 4. Patrón dni=12345678
    const paramMatch = cleanText.match(/(?:dni|id)[=:](\d{8,10})/i);
    if (paramMatch) {
      console.log('✅ DNI desde parámetro:', paramMatch[1]);
      return paramMatch[1];
    }
    
    // 5. Cualquier secuencia de 8-10 dígitos
    const digitMatch = cleanText.match(/\b(\d{8,10})\b/);
    if (digitMatch) {
      console.log('✅ DNI desde dígitos:', digitMatch[1]);
      return digitMatch[1];
    }
    
    console.log('❌ No se encontró DNI en el texto');
    return null;
  };

  const captureManual = async () => {
    if (!webcamRef.current) {
      setError('❌ Cámara no disponible');
      return;
    }

    try {
      setProcesando(true);
      console.log('📸 Captura manual iniciada...');
      
      // Capturar imagen
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error('No se pudo capturar la imagen');
      }

      // Convertir data URL a blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      
      // Crear canvas desde la imagen
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Intentar con ZXing primero
        try {
          const result = await codeReader.current.decodeFromCanvas(canvas);
          if (result?.text) {
            handleDetection(result.text, 'Manual - ZXing');
            return;
          }
        } catch (e) {
          console.log('ZXing manual falló, intentando API...');
        }
        
        // Si ZXing falla, usar API
        await tryWithAPI(canvas);
        
        if (!procesando) {
          setError('❌ No se detectó código QR en la captura');
          setTimeout(() => setError(''), 3000);
        }
      };
      
      img.src = imageSrc;

    } catch (error) {
      console.error('❌ Error en captura manual:', error);
      setError('❌ Error al capturar imagen: ' + error.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setProcesando(false);
    }
  };

  const handleUserMedia = () => {
    setCameraAccess(true);
    console.log('📹 Cámara iniciada correctamente');
  };

  const handleUserMediaError = (error) => {
    console.error('❌ Error de cámara:', error);
    setError('❌ No se pudo acceder a la cámara. Verifica los permisos.');
    setCameraAccess(false);
  };

  return (
    <div className="escaner-qr-overlay">
      <div className="escaner-qr-container">
        <div className="escaner-qr-header">
          <h3>📱 Escáner QR Funcional</h3>
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
              mirrored={false}
              videoConstraints={{
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: "environment"
              }}
              style={{
                transform: 'scaleX(1)'
              }}
            />
            
            {(scanning || procesando) && (
              <div className="scanning-overlay">
                <div className="scanning-frame-simple">
                  <div className="corner corner-tl"></div>
                  <div className="corner corner-tr"></div>
                  <div className="corner corner-bl"></div>
                  <div className="corner corner-br"></div>
                </div>
                <p className="scanning-text">
                  {procesando ? '🔄 Procesando...' : '🔍 Escaneando...'}
                </p>
                {metodosIntentados.length > 0 && (
                  <p className="scanning-methods">
                    Métodos: {metodosIntentados.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="escaner-controls">
            {!scanning ? (
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <button 
                  className="btn btn-success"
                  onClick={startScanning}
                  disabled={!cameraAccess || procesando}
                >
                  🎯 Iniciar Escaneo
                </button>
                <button 
                  className="btn btn-info"
                  onClick={captureManual}
                  disabled={!cameraAccess || procesando}
                >
                  📸 Captura Manual
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-warning btn-lg"
                onClick={stopScanning}
                disabled={procesando}
              >
                ⏹️ Detener
              </button>
            )}
          </div>

          <div className="escaner-info">
            <div className="alert alert-info">
              <strong>💡 Instrucciones:</strong>
              <ul>
                <li>🎯 <strong>Automático:</strong> Escaneo continuo cada segundo</li>
                <li>📸 <strong>Manual:</strong> Captura una foto y la procesa</li>
                <li>🔍 Coloca el QR centrado y con buena iluminación</li>
                <li>📱 Asegúrate de que el QR contenga un DNI de 8-10 dígitos</li>
              </ul>
              <div className="mt-2">
                <small className="text-muted">
                  <strong>Estado:</strong> {scanning ? '🔄 Activo' : '⏸️ Detenido'} | 
                  <strong>Procesando:</strong> {procesando ? '⚡ Sí' : '💤 No'} |
                  <strong>Cámara:</strong> {cameraAccess ? '✅ OK' : '❌ No'}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscanerQRFuncional;
