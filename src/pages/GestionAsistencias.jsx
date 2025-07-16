import React, { useEffect, useState } from 'react';
import api from '../services/api';
import AddIcon from '@mui/icons-material/Add';

const GestionAsistencias = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [dniInput, setDniInput] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorConsola, setErrorConsola] = useState(null);

  const cargarAsistencias = async () => {
    try {
      setLoading(true);
      const res = await api.get('/asistencias');
      if (Array.isArray(res.data)) {
        setAsistencias(res.data);
      } else {
        setAsistencias([]);
        console.warn('⚠️ Respuesta inesperada:', res.data);
      }
    } catch (error) {
      console.error('💥 Error al obtener asistencias:', error);
      setErrorConsola(error.message);
      setAsistencias([]);
      setMensaje('❌ Error al obtener asistencias.');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstudiantes = async () => {
    try {
      const res = await api.get('/estudiantes');
      if (Array.isArray(res.data)) {
        setEstudiantes(res.data);
      }
    } catch (err) {
      console.error('❌ Error cargando estudiantes:', err);
    }
  };

  useEffect(() => {
    cargarAsistencias();
    cargarEstudiantes();
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const registrar = async () => {
    if (!dniInput.trim()) {
      setMensaje('❌ Ingrese un DNI válido.');
      return;
    }

    try {
      await api.post('/asistencias', { DNI_ESTUDIANTE: dniInput.trim() });
      setMensaje('✅ Asistencia registrada.');
      setDniInput('');
      cargarAsistencias();
    } catch (err) {
      console.error('💥 Error registrando asistencia:', err);
      setMensaje('❌ Error al registrar asistencia.');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">🕒 Registro de Asistencias</h2>

      <div className="mb-3 d-flex gap-2 align-items-center">
        <input
          type="text"
          list="lista-dnis"
          className="form-control"
          placeholder="🪪 DNI del estudiante"
          value={dniInput}
          onChange={(e) => setDniInput(e.target.value)}
        />
        <datalist id="lista-dnis">
          {estudiantes.map((e) => (
            <option key={e.DNI} value={e.DNI}>
              {e.NOMBRES} {e.APELLIDOS}
            </option>
          ))}
        </datalist>

        <button className="btn btn-primary d-flex align-items-center" onClick={registrar}>
          <AddIcon className="me-1" /> Registrar
        </button>
      </div>

      {mensaje && (
        <div className={`alert ${mensaje.startsWith('✅') ? 'alert-success' : 'alert-danger'}`}>
          {mensaje}
        </div>
      )}

      {errorConsola && (
        <div className="alert alert-warning mt-2">
          🔎 Detalle técnico: <code>{errorConsola}</code>
        </div>
      )}

      <div className="table-responsive mt-4">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light text-center">
            <tr>
              <th>🪪 DNI</th>
              <th>👤 Nombre</th>
              <th>📅 Fecha / Hora</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center text-muted">Cargando asistencias...</td>
              </tr>
            ) : asistencias.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center text-muted">No hay asistencias registradas.</td>
              </tr>
            ) : (
              asistencias.map((a) => (
                <tr key={a.ID}>
                  <td>{a.DNI_ESTUDIANTE}</td>
                  <td>{a.Estudiante?.NOMBRES || '—'} {a.Estudiante?.APELLIDOS || ''}</td>
                  <td>{new Date(a.FECHA_HORA).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionAsistencias;
