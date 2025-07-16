import { Link } from 'react-router-dom';
import BackupWidget from '../components/BackupWidget';

const Dashboard = () => {
  const tarjetas = [
    { ruta: '/estudiantes', texto: 'Estudiantes', icono: '🎓' },
    { ruta: '/facultades', texto: 'Facultades', icono: '🏛️' },
    { ruta: '/carreras', texto: 'Carreras', icono: '📚' },
    { ruta: '/clubes', texto: 'Clubes', icono: '🏀' },
    { ruta: '/asistencias', texto: 'Asistencia', icono: '📲' }, // ✅ Ruta corregida
    { ruta: '/backups', texto: 'Backups', icono: '🗄️' }
  ];

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Bienvenido, administrador</h2>
      
      {/* Widget de información de backups */}
      <div className="row mb-4">
        <div className="col-md-4">
          <BackupWidget />
        </div>
        <div className="col-md-8">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="card-title mb-0">📊 Estado del Sistema</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="fs-4 text-success">✅</div>
                    <small>Base de Datos</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="fs-4 text-primary">🔒</div>
                    <small>Autenticación</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de navegación principal */}
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {tarjetas.map((card) => (
          <div className="col" key={card.texto}>
            <Link to={card.ruta} className="text-decoration-none">
              <div className="card text-center h-100 shadow-sm">
                <div className="card-body">
                  <h1>{card.icono}</h1>
                  <h5 className="card-title">{card.texto}</h5>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
