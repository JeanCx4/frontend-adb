import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PerfilEstudiante = () => {
  const { dni } = useParams();
  const navigate = useNavigate();
  const [estudiante, setEstudiante] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await api.get(`/estudiantes/${dni}`);
        setEstudiante(res.data);
      } catch (err) {
        setError('❌ Estudiante no encontrado.');
      }
    };
    cargarDatos();
  }, [dni]);

  if (error) {
    return <div className="alert alert-danger mt-4 text-center">{error}</div>;
  }

  if (!estudiante) {
    return <div className="text-center mt-4">⏳ Cargando...</div>;
  }

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate('/estudiantes')}>
        <ArrowBackIcon /> Volver
      </button>

      <div className="card shadow-sm p-4">
        <div className="row">
          <div className="col-md-4 text-center">
            {estudiante.FOTO ? (
              <img
                src={estudiante.FOTO}
                alt="Estudiante"
                className="img-fluid rounded mb-3"
                style={{ maxHeight: '250px', objectFit: 'cover' }}
              />
            ) : (
              <div className="text-muted">Sin foto</div>
            )}

            {estudiante.QR_IMAGEN && (
              <div className="mt-3">
                <img
                  src={`data:image/png;base64,${estudiante.QR_IMAGEN}`}
                  alt="QR"
                  style={{ width: '140px' }}
                />
              </div>
            )}
          </div>

          <div className="col-md-8">
            <h3>{estudiante.NOMBRES} {estudiante.APELLIDOS}</h3>
            <p><strong>DNI:</strong> {estudiante.DNI}</p>
            <p><strong>Email:</strong> {estudiante.EMAIL}</p>
            <p><strong>Teléfono:</strong> {estudiante.TELEFONO}</p>
            <p><strong>Fecha de nacimiento:</strong> {estudiante.FECHA_NACIMIENTO?.slice(0, 10)}</p>

            <p><strong>Carreras:</strong><br />
              {estudiante.Carreras?.length
                ? estudiante.Carreras.map(c => `• ${c.NOMBRE}`).join('\n')
                : 'Sin asignar'}
            </p>

            <p><strong>Clubes:</strong><br />
              {estudiante.Clubs?.length
                ? estudiante.Clubs.map(c => `• ${c.NOMBRE}`).join('\n')
                : 'Sin asignar'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilEstudiante;
