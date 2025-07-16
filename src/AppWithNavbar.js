import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// 🧭 Página principal
import Dashboard from './pages/Dashboard';

// 🎓 Estudiantes
import GestionEstudiantes from './pages/GestionEstudiantes';
import EditarEstudiante from './pages/EditarEstudiante';
import PerfilEstudiante from './pages/PerfilEstudiante';
import AgregarEstudiante from './components/AgregarEstudiante';

// 🕒 Asistencias (manual)
import GestionAsistencias from './pages/GestionAsistencias';

// 📱 Asistencias QR
import RegistroAsistenciaQR from './pages/RegistroAsistenciaQR';

// 🧪 Componente de prueba
import GeneradorQRPrueba from './components/GeneradorQRPrueba';

// 🏛️ Datos institucionales
import Facultades from './pages/Facultades';
import Carreras from './pages/Carreras';
import Clubes from './pages/Clubes';

const AppWithNavbar = () => {
  return (
    <>
      <Navbar />

      <Routes>
        {/* 🔀 Redirección desde raíz */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* 🧭 Panel principal */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />

        {/* 🎓 Gestión de estudiantes */}
        <Route
          path="/estudiantes"
          element={<ProtectedRoute><GestionEstudiantes /></ProtectedRoute>}
        />
        <Route
          path="/agregar-estudiante"
          element={<ProtectedRoute><AgregarEstudiante /></ProtectedRoute>}
        />
        <Route
          path="/editar-estudiante/:dni"
          element={<ProtectedRoute><EditarEstudiante /></ProtectedRoute>}
        />
        <Route
          path="/perfil-estudiante/:dni"
          element={<ProtectedRoute><PerfilEstudiante /></ProtectedRoute>}
        />

        {/* 🕒 Registro de asistencias */}
        <Route
          path="/asistencias"
          element={<ProtectedRoute><GestionAsistencias /></ProtectedRoute>}
        />

        {/* 📱 Escáner QR para asistencias */}
        <Route
          path="/registro-qr"
          element={<ProtectedRoute><RegistroAsistenciaQR /></ProtectedRoute>}
        />

        {/* 🧪 Generador de QR de prueba */}
        <Route
          path="/generar-qr-prueba"
          element={<ProtectedRoute><GeneradorQRPrueba /></ProtectedRoute>}
        />

        {/* 🏛️ Datos institucionales */}
        <Route
          path="/facultades"
          element={<ProtectedRoute><Facultades /></ProtectedRoute>}
        />
        <Route
          path="/carreras"
          element={<ProtectedRoute><Carreras /></ProtectedRoute>}
        />
        <Route
          path="/clubes"
          element={<ProtectedRoute><Clubes /></ProtectedRoute>}
        />
      </Routes>
    </>
  );
};

export default AppWithNavbar;

