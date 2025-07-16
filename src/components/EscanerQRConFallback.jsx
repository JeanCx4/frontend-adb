import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import './EscanerQR.css';

const EscanerQRConFallback = ({ onQRDetected, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [cameraAccess, setCameraAccess] = useState(false);
  const [usandoAPI, setUsandoAPI] = useState(false);
  const webcamRef = useRef(null);
  const scannerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
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
    console.log('🎯 Iniciando escaneo automático mejorado...');
    
    const video = webcamRef.current.video;
    let contadorIntentos = 0;
    
    intervalRef.current = setInterval(async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        contadorIntentos++;
        
        try {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Dibujar el frame actual
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Intentar ZXing primero (solo las primeras 5 veces)
          if (contadorIntentos <= 5) {
            try {
              const result = await scannerRef.current.decodeFromCanvas(canvas);
              if (result && result.getText()) {
                console.log('✅ ZXing detectó:', result.getText());
                handleQRDetection(result.getText(), 'ZXing Local');
                return;
              }
            } catch (zxingError) {
              // ZXing falló, continuar con API
            }
          }
          
          // Usar API cada 3 intentos (para no saturar)
          if (contadorIntentos % 3 === 0 && !usandoAPI) {
            console.log(`🌐 Intento ${contadorIntentos}: Usando API automática...`);
            await intentarConAPIAutomatica(canvas);
          }
          
        } catch (err) {
          console.log('Error en ciclo de escaneo:', err);
        }
      }
    }, 800); // Aumentar intervalo para dar más tiempo a las APIs
  };

  // Nueva función específica para API automática (más simple y confiable)
  const intentarConAPIAutomatica = async (canvas) => {
    if (usandoAPI) return; // Evitar llamadas simultáneas
    
    try {
      setUsandoAPI(true);
      console.log('🌐 API automática iniciando...');
      
      // Convertir canvas a blob de forma más robusta
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error('No se pudo crear blob'));
          }
        }, 'image/jpeg', 0.9);
      });
      
      // Crear FormData
      const formData = new FormData();
      formData.append('file', blob, 'auto-scan.jpg');
      
      // Usar QuickChart API con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
      
      const response = await fetch('https://quickchart.io/qr/read', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 API automática respuesta:', data);
        
        if (data.text && data.text.trim()) {
          handleQRDetection(data.text, 'QuickChart Auto');
          return;
        }
      }
      
    } catch (apiError) {
      if (apiError.name === 'AbortError') {
        console.log('⏰ API automática: timeout');
      } else {
        console.log('❌ API automática falló:', apiError.message);
      }
    } finally {
      setTimeout(() => setUsandoAPI(false), 500); // Delay para evitar spam
    }
  };

  const intentarConAPI = async (canvas) => {
    try {
      setUsandoAPI(true);
      console.log('🌐 Intentando con QuickChart API...');
      
      // Convertir canvas a blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });
      
      // Crear FormData
      const formData = new FormData();
      formData.append('file', blob, 'qr-scan.jpg');
      
      // Usar QuickChart API (gratuita y confiable)
      const response = await fetch('https://quickchart.io/qr/read', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Respuesta de API:', data);
        
        if (data.text) {
          handleQRDetection(data.text, 'QuickChart API');
          return;
        }
      }
      
      // Fallback: Intentar con API alternativa
      await intentarConAPIAlternativa(canvas);
      
    } catch (apiError) {
      console.log('❌ QuickChart API falló:', apiError);
      await intentarConAPIAlternativa(canvas);
    } finally {
      setUsandoAPI(false);
    }
  };

  const intentarConAPIAlternativa = async (canvas) => {
    try {
      console.log('🔄 Intentando con API alternativa...');
      
      // Convertir a base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      const base64Data = imageData.split(',')[1];
      
      // Usar API de GoQR.me (también gratuita)
      const response = await fetch('http://api.qrserver.com/v1/read-qr-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `fileurl=data:image/jpeg;base64,${base64Data}`
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data[0]?.symbol?.[0]?.data) {
          handleQRDetection(data[0].symbol[0].data, 'QRServer API');
        }
      }
      
    } catch (error) {
      console.log('❌ API alternativa también falló:', error);
    }
  };

  const stopScanning = () => {
    setScanning(false);
    setUsandoAPI(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleQRDetection = (qrText, metodo) => {
    console.log(`🎯 QR detectado con ${metodo}:`, qrText);
    stopScanning();
    
    const dni = extractDNI(qrText);
    
    if (dni) {
      console.log('✅ DNI extraído:', dni);
      onQRDetected(dni);
    } else {
      setError(`❌ QR no válido: "${qrText}". Método: ${metodo}`);
      setTimeout(() => {
        setError('');
        startScanning();
      }, 3000);
    }
  };

  const extractDNI = (text) => {
    const cleanText = text.trim();
    
    // DNI directo
    if (/^\d{8,10}$/.test(cleanText)) {
      return cleanText;
    }
    
    // JSON
    try {
      const parsed = JSON.parse(cleanText);
      if (parsed.dni || parsed.DNI) {
        return parsed.dni || parsed.DNI;
      }
    } catch (e) {}
    
    // URL patterns
    const patterns = [
      /\/(?:perfil-)?estudiante\/(\d{8,10})/i,
      /(?:dni|id)[=:](\d{8,10})/i,
      /\b(\d{8,10})\b/
    ];
    
    for (const pattern of patterns) {
      const match = cleanText.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const handleUserMedia = () => {
    setCameraAccess(true);
    console.log('📹 Cámara iniciada');
  };

  const handleUserMediaError = (error) => {
    console.error('❌ Error de cámara:', error);
    setError('No se pudo acceder a la cámara');
    setCameraAccess(false);
  };

  const captureAndTryAPI = async () => {
    if (!webcamRef.current) return;
    
    try {
      setUsandoAPI(true);
      console.log('📸 Capturando imagen para API...');
      
      // Capturar imagen actual
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (imageSrc) {
        // Convertir data URL a blob
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        
        // Crear FormData
        const formData = new FormData();
        formData.append('file', blob, 'manual-capture.jpg');
        
        // Intentar con QuickChart primero
        const apiResponse = await fetch('https://quickchart.io/qr/read', {
          method: 'POST',
          body: formData
        });
        
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          console.log('📊 Respuesta manual API:', data);
          
          if (data.text) {
            handleQRDetection(data.text, 'Manual - QuickChart');
          } else {
            setError('No se detectó QR en la captura. Intenta con mejor iluminación.');
            setTimeout(() => setError(''), 3000);
          }
        } else {
          throw new Error('API no disponible');
        }
      } else {
        setError('No se pudo capturar la imagen');
      }
    } catch (error) {
      console.error('❌ Error en captura manual:', error);
      setError('Error al procesar imagen. Verifica tu conexión a internet.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUsandoAPI(false);
    }
  };

  return (
    <div className="escaner-qr-overlay">
      <div className="escaner-qr-container">
        <div className="escaner-qr-header">
          <h3>📱 Escáner QR Mejorado {usandoAPI && '(Usando API)' }</h3>
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
                width: 640,
                height: 480,
                facingMode: "environment"
              }}
              style={{
                transform: 'scaleX(1)' // Sin espejo para QR
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
                <p className="scanning-text">
                  🔍 {usandoAPI ? 'Procesando con API...' : 'Buscando código QR...'}
                </p>
              </div>
            )}
          </div>

          <div className="escaner-controls">
            {!scanning ? (
              <div className="d-flex gap-2 justify-content-center">
                <button 
                  className="btn btn-success"
                  onClick={startScanning}
                  disabled={!cameraAccess}
                >
                  🎯 Escaneo Automático
                </button>
                <button 
                  className="btn btn-info"
                  onClick={captureAndTryAPI}
                  disabled={!cameraAccess || usandoAPI}
                >
                  📸 Captura Manual
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button 
                  className="btn btn-warning btn-lg mb-2"
                  onClick={stopScanning}
                >
                  ⏹️ Detener
                </button>
                <div>
                  <small className="text-muted">
                    Escaneando automáticamente... Si no detecta, usa "Captura Manual"
                  </small>
                </div>
              </div>
            )}
          </div>

          <div className="escaner-info">
            <div className="alert alert-info">
              <strong>💡 Instrucciones:</strong>
              <ul>
                <li>🎯 <strong>Automático:</strong> Escanea cada 0.8s con ZXing + API cada 3 intentos</li>
                <li>📸 <strong>Manual:</strong> Captura y usa API externa (MÁS CONFIABLE)</li>
                <li>💡 <strong>Tip:</strong> Si automático no funciona, usa Manual</li>
                <li>🔍 Mantén el QR centrado, con buena luz y sin movimiento</li>
              </ul>
              <div className="mt-2">
                <small className="text-muted">
                  <strong>Estado:</strong> {scanning ? '🔄 Escaneando...' : '⏸️ Listo'} | 
                  <strong>API:</strong> {usandoAPI ? '🌐 Activa' : '💤 Inactiva'}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscanerQRConFallback;
