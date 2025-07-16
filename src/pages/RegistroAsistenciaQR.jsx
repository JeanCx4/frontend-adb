import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EscanerQR from '../components/EscanerQR';

const RegistroAsistenciaQR = () => {
  const [mostrarEscaner, setMostrarEscaner] = useState(false);
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState(''); // 'success' o 'error'

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    cargarAsistencias();
  }, []);

  const cargarAsistencias = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/asistencias`);
      setAsistencias(response.data);
    } catch (error) {
      console.error('Error cargando asistencias:', error);
      mostrarMensaje('Error al cargar asistencias', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => {
      setMensaje('');
      setTipoMensaje('');
    }, 5000);
  };

  const validarEstudiante = async (dni) => {
    try {
      const response = await axios.get(`${API_URL}/estudiantes/validar-qr/${dni}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Estudiante no encontrado');
      }
      throw new Error('Error al validar estudiante');
    }
  };

  const registrarAsistencia = async (dni) => {
    try {
      const response = await axios.post(`${API_URL}/asistencias/qr`, { dni });
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Error al registrar asistencia');
    }
  };

  const handleQRDetected = async (dni) => {
    setMostrarEscaner(false);
    setLoading(true);

    try {
      // 1. Validar que el estudiante existe
      const validacion = await validarEstudiante(dni);
      
      if (!validacion.valido) {
        mostrarMensaje('QR no válido', 'error');
        return;
      }

      // 2. Registrar asistencia
      const resultado = await registrarAsistencia(dni);
      
      // 3. Mostrar mensaje de éxito con información del estudiante
      const estudiante = validacion.estudiante;
      mostrarMensaje(
        `✅ Asistencia registrada para: ${estudiante.NOMBRES} ${estudiante.APELLIDOS} (DNI: ${estudiante.DNI})`,
        'success'
      );

      // 4. Recargar lista de asistencias
      await cargarAsistencias();

    } catch (error) {
      console.error('Error procesando QR:', error);
      mostrarMensaje(error.message || 'Error al procesar código QR', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerAsistenciasHoy = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    return asistencias.filter(asistencia => {
      const fechaAsistencia = new Date(asistencia.FECHA_HORA);
      return fechaAsistencia >= hoy && fechaAsistencia < mañana;
    });
  };

  const asistenciasHoy = obtenerAsistenciasHoy();

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>📱 Registro de Asistencias QR</h2>
              <p className="text-muted">Escanea códigos QR para registrar asistencias</p>
            </div>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => setMostrarEscaner(true)}
              disabled={loading}
            >
              📷 Escanear QR
            </button>
          </div>

          {/* Mensajes */}
          {mensaje && (
            <div className={`alert alert-${tipoMensaje === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}>
              {mensaje}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setMensaje('')}
              ></button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center mb-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Procesando...</span>
              </div>
              <p className="mt-2">Procesando...</p>
            </div>
          )}

          {/* Estadísticas del día */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h5 className="card-title">📊 Asistencias Hoy</h5>
                  <h2 className="card-text">{asistenciasHoy.length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h5 className="card-title">📈 Total Asistencias</h5>
                  <h2 className="card-text">{asistencias.length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h5 className="card-title">🕐 Última Asistencia</h5>
                  <p className="card-text">
                    {asistencias.length > 0 
                      ? formatearFecha(asistencias[0].FECHA_HORA)
                      : 'Sin registros'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de asistencias del día */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">🎯 Asistencias de Hoy ({new Date().toLocaleDateString('es-ES')})</h5>
            </div>
            <div className="card-body">
              {asistenciasHoy.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-clipboard-x" style={{fontSize: '3rem'}}></i>
                  <p className="mt-2">No hay asistencias registradas hoy</p>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setMostrarEscaner(true)}
                  >
                    📷 Registrar Primera Asistencia
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>DNI</th>
                        <th>Estudiante</th>
                        <th>Hora</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asistenciasHoy.map((asistencia, index) => (
                        <tr key={asistencia.ID}>
                          <td>
                            <span className="badge bg-secondary">
                              {asistencia.DNI_ESTUDIANTE}
                            </span>
                          </td>
                          <td>
                            {asistencia.Estudiante ? 
                              `${asistencia.Estudiante.NOMBRES} ${asistencia.Estudiante.APELLIDOS}` :
                              'Estudiante no encontrado'
                            }
                          </td>
                          <td>
                            {new Date(asistencia.FECHA_HORA).toLocaleTimeString('es-ES')}
                          </td>
                          <td>
                            <span className="badge bg-success">
                              ✅ Presente
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Historial completo */}
          {asistencias.length > asistenciasHoy.length && (
            <div className="card mt-4">
              <div className="card-header">
                <h5 className="mb-0">📚 Historial Completo de Asistencias</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive" style={{maxHeight: '400px', overflowY: 'auto'}}>
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Fecha/Hora</th>
                        <th>DNI</th>
                        <th>Estudiante</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asistencias.map((asistencia) => (
                        <tr key={asistencia.ID}>
                          <td>{formatearFecha(asistencia.FECHA_HORA)}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {asistencia.DNI_ESTUDIANTE}
                            </span>
                          </td>
                          <td>
                            {asistencia.Estudiante ? 
                              `${asistencia.Estudiante.NOMBRES} ${asistencia.Estudiante.APELLIDOS}` :
                              'Estudiante no encontrado'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Escáner QR */}
      {mostrarEscaner && (
        <EscanerQR
          onQRDetected={handleQRDetected}
          onClose={() => setMostrarEscaner(false)}
        />
      )}
    </div>
  );
};

export default RegistroAsistenciaQR;
