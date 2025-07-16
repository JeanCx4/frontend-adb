import { useEffect, useState } from 'react';
import api from '../services/api';

const Facultades = () => {
  const [facultades, setFacultades] = useState([]);
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    cargarFacultades();
  }, []);

  const cargarFacultades = async () => {
    const res = await api.get('/facultades');
    setFacultades(res.data);
  };

  const agregar = async () => {
    if (!nombre.trim()) return;
    await api.post('/facultades', { NOMBRE: nombre });
    setNombre('');
    cargarFacultades();
  };

  const eliminar = async (id) => {
    await api.delete(`/facultades/${id}`);
    cargarFacultades();
  };

  return (
    <div className="container mt-4">
      <h2>Facultades</h2>
      <div className="input-group mb-3 w-50">
        <input
          type="text"
          className="form-control"
          placeholder="Nueva facultad"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button className="btn btn-primary" onClick={agregar}>Agregar</button>
      </div>
      <ul className="list-group">
        {facultades.map((f) => (
          <li key={f.ID} className="list-group-item d-flex justify-content-between">
            {f.NOMBRE}
            <button className="btn btn-danger btn-sm" onClick={() => eliminar(f.ID)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Facultades;
