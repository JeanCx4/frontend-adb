import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import QrCodeIcon from '@mui/icons-material/QrCode';
import VisualizadorQR from './VisualizadorQR';

const GestionEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);
  const [dniSeleccionado, setDniSeleccionado] = useState('');
  const navigate = useNavigate();

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/estudiantes');
      const datos = Array.isArray(res.data) ? res.data : [];
      setEstudiantes(datos);
    } catch (error) {
      console.error('💥 Error al obtener estudiantes:', error);
      setMensaje('❌ No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const eliminarEstudiante = async (dni) => {
    if (window.confirm('¿Estás seguro de eliminar este estudiante?')) {
      try {
        await api.delete(`/estudiantes/${dni}`);
        setMensaje('✅ Estudiante eliminado con éxito.');
        cargarDatos();
      } catch (error) {
        console.error('💥 Error al eliminar estudiante:', error);
        setMensaje('❌ Error al eliminar estudiante.');
      }
    }
  };

  const handleNuevoEstudiante = () => navigate('/agregar-estudiante');
  const editarEstudiante = (dni) => navigate(`/editar-estudiante/${dni}`);
  const verPerfil = (dni) => navigate(`/perfil-estudiante/${dni}`);
  
  const generarQR = (dni) => {
    setDniSeleccionado(dni);
    setMostrarQR(true);
  };

  const cerrarQR = () => {
    setMostrarQR(false);
    setDniSeleccionado('');
  };

  useEffect(() => {
    cargarDatos();
    cargarDatos();
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">🎓 Gestionar Estudiantes</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">📋 Lista de estudiantes</h5>
        <button
          className="btn btn-success d-flex align-items-center"
          onClick={handleNuevoEstudiante}
        >
          <AddIcon className="me-1" /> Nuevo estudiante
        </button>
      </div>

      {mensaje && (
        <div
          className={`alert ${mensaje.startsWith('✅') ? 'alert-success' : 'alert-danger'} mt-2`}
        >
          {mensaje}
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr className="text-center">
              <th>🖼️ Foto</th>
              <th>👤 Nombre</th>
              <th>📧 Email</th>
              <th>🎓 Carreras</th>
              <th>🤝 Clubes</th>
              <th>🔲 QR</th>
              <th>⚙️ Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center text-muted">Cargando estudiantes...</td>
              </tr>
            ) : estudiantes.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted">No hay estudiantes registrados.</td>
              </tr>
            ) : (
              estudiantes.map((est) => (
                <tr key={est.DNI}>
                  <td className="text-center">
                    {est.FOTO ? (
                      <img
                        src={est.FOTO}
                        alt="Estudiante"
                        style={{ width: '60px', borderRadius: '4px' }}
                      />
                    ) : '—'}
                  </td>
                  <td>
                    {est.NOMBRES} {est.APELLIDOS}
                    <br />
                    <small className="text-muted">DNI: {est.DNI}</small>
                  </td>
                  <td>{est.EMAIL || '—'}</td>
                  <td>
                    {Array.isArray(est.Carreras) && est.Carreras.length > 0
                      ? est.Carreras.map((c) => c.NOMBRE).join(', ')
                      : '—'}
                  </td>
                  <td>
                    {Array.isArray(est.Clubs) && est.Clubs.length > 0
                      ? est.Clubs.map((c) => c.NOMBRE).join(', ')
                      : '—'}
                  </td>
                  <td className="text-center">
                    {est.QR_IMAGEN ? (
                      <img
                        src={`data:image/png;base64,${est.QR_IMAGEN}`}
                        alt="QR"
                        style={{ width: '100px' }}
                      />
                    ) : (
                      <span className="text-muted">No generado</span>
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-outline-primary btn-sm me-1"
                      onClick={() => verPerfil(est.DNI)}
                    >
                      <VisibilityIcon fontSize="small" /> Perfil
                    </button>
                    <button
                      className="btn btn-outline-success btn-sm me-1"
                      onClick={() => generarQR(est.DNI)}
                      title="Generar código QR para asistencia"
                    >
                      <QrCodeIcon fontSize="small" /> QR
                    </button>
                    <button
                      className="btn btn-outline-warning btn-sm me-1"
                      onClick={() => editarEstudiante(est.DNI)}
                    >
                      <EditIcon fontSize="small" /> Editar
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => eliminarEstudiante(est.DNI)}
                    >
                      <DeleteIcon fontSize="small" /> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal para visualizar QR */}
      {mostrarQR && (
        <VisualizadorQR 
          dni={dniSeleccionado}
          onClose={cerrarQR}
        />
      )}
    </div>
  );
};

export default GestionEstudiantes;
