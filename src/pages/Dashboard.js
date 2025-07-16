import { Link } from 'react-router-dom';

const Dashboard = () => {
  const tarjetas = [
    { ruta: '/estudiantes', texto: 'Estudiantes', icono: '🎓' },
    { ruta: '/facultades', texto: 'Facultades', icono: '🏛️' },
    { ruta: '/carreras', texto: 'Carreras', icono: '📚' },
    { ruta: '/clubes', texto: 'Clubes', icono: '🏀' },
    { ruta: '/asistencias', texto: 'Asistencia', icono: '📲' } // ✅ Ruta corregida
  ];

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Bienvenido, administrador</h2>
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
