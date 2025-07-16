import { Link, useNavigate } from 'react-router-dom';
import { removeToken } from '../utils/token';
import './Navbar.css'; // si quieres estilos extra

const Navbar = () => {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <span className="navbar-brand">🎓 Panel Admin</span>
      <div className="navbar-nav">
        <Link className="nav-link" to="/dashboard">Inicio</Link>
        <Link className="nav-link" to="/estudiantes">Estudiantes</Link>
        <Link className="nav-link" to="/asistencias">Asistencia</Link> {/* ✅ ruta corregida */}
        <Link className="nav-link" to="/registro-qr">📱 Escáner QR</Link>
        <Link className="nav-link" to="/facultades">Facultades</Link>
        <Link className="nav-link" to="/carreras">Carreras</Link>
        <Link className="nav-link" to="/clubes">Clubes</Link>
      </div>
      <button className="btn btn-outline-light ms-auto" onClick={cerrarSesion}>
        Cerrar sesión
      </button>
    </nav>
  );
};

export default Navbar;
