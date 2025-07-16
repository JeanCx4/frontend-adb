import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

const EstudianteCard = ({ estudiante, recargar }) => {
  const navigate = useNavigate();

  const eliminar = async () => {
    if (window.confirm(`¿Eliminar a ${estudiante.NOMBRES} ${estudiante.APELLIDOS}?`)) {
      try {
        await api.delete(`/estudiantes/${estudiante.DNI}`);
        recargar();
      } catch (error) {
        console.error('❌ Error al eliminar estudiante:', error);
        alert('No se pudo eliminar el estudiante.');
      }
    }
  };

  const verPerfil = () => {
    navigate(`/perfil-estudiante/${estudiante.DNI}`);
  };

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body text-center d-flex flex-column justify-content-between">
        {estudiante.FOTO ? (
          <img
            src={estudiante.FOTO}
            alt="Estudiante"
            className="img-thumbnail mb-3"
            style={{ height: '150px', objectFit: 'cover', borderRadius: '8px' }}
          />
        ) : (
          <div className="text-muted mb-3">🖼️ Sin foto disponible</div>
        )}

        <h5 className="mb-1">{estudiante.NOMBRES} {estudiante.APELLIDOS}</h5>
        <small className="text-muted">DNI: {estudiante.DNI}</small>

        <p className="mt-3 mb-1"><strong>📧 Email:</strong> <br /> {estudiante.EMAIL || '—'}</p>
        <p className="mb-1"><strong>📱 Teléfono:</strong> <br /> {estudiante.TELEFONO || '—'}</p>

        <p className="mb-1"><strong>🎓 Carreras:</strong> <br />
          {Array.isArray(estudiante.Carreras) && estudiante.Carreras.length > 0
            ? estudiante.Carreras.map(c => c.NOMBRE).join(', ')
            : 'Sin asignar'}
        </p>

        <p className="mb-1"><strong>🤝 Clubes:</strong> <br />
          {Array.isArray(estudiante.Clubs) && estudiante.Clubs.length > 0
            ? estudiante.Clubs.map(c => c.NOMBRE).join(', ')
            : 'Sin asignar'}
        </p>

        {estudiante.QR_IMAGEN ? (
          <div className="mt-3">
            <img
              src={`data:image/png;base64,${estudiante.QR_IMAGEN}`}
              alt="QR"
              style={{ width: '120px' }}
            />
            <small className="text-muted d-block mt-1">🔗 Perfil escaneable</small>
          </div>
        ) : (
          <div className="text-muted mt-3">📷 QR no generado</div>
        )}

        <div className="d-flex justify-content-center gap-2 mt-4">
          <button className="btn btn-outline-primary btn-sm" onClick={verPerfil}>
            <VisibilityIcon className="me-1" /> Ver perfil
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={eliminar}>
            <DeleteIcon className="me-1" /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstudianteCard;
