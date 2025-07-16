import React, { useEffect, useState } from 'react';
import api from '../services/api';
import EstudianteCard from './EstudianteCard';
import AgregarEstudiante from './AgregarEstudiante';

const GestionEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);

  const cargarDatos = async () => {
    try {
      const res = await api.get('/estudiantes');
      setEstudiantes(res.data);
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">🎓 Gestión de Estudiantes</h2>

      <AgregarEstudiante /> {/* Formulario embebido */}

      <div className="row mt-5">
        {estudiantes.map(est => (
          <div className="col-md-6 mb-4" key={est.DNI}>
            <EstudianteCard estudiante={est} recargar={cargarDatos} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionEstudiantes;
