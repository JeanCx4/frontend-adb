import { useEffect, useState } from 'react';
import api from '../services/api';

const Clubes = () => {
  const [clubes, setClubes] = useState([]);
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    cargarClubes();
  }, []);

  const cargarClubes = async () => {
    const res = await api.get('/clubes');
    setClubes(res.data);
  };

  const agregar = async () => {
    if (!nombre.trim()) return;
    await api.post('/clubes', { NOMBRE: nombre });
    setNombre('');
    cargarClubes();
  };

  const eliminar = async (id) => {
    await api.delete(`/clubes/${id}`);
    cargarClubes();
  };

  return (
    <div className="container mt-4">
      <h2>Clubes</h2>
      <div className="input-group mb-3 w-50">
        <input
          type="text"
          className="form-control"
          placeholder="Nombre del club"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button className="btn btn-primary" onClick={agregar}>Agregar</button>
      </div>
      <ul className="list-group">
        {clubes.map((c) => (
          <li key={c.ID} className="list-group-item d-flex justify-content-between">
            {c.NOMBRE}
            <button className="btn btn-danger btn-sm" onClick={() => eliminar(c.ID)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Clubes;
