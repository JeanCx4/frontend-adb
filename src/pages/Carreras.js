import { useEffect, useState } from 'react';
import api from '../services/api';

const Carreras = () => {
  const [carreras, setCarreras] = useState([]);
  const [nombre, setNombre] = useState('');
  const [idFacultad, setIdFacultad] = useState('');
  const [facultades, setFacultades] = useState([]);

  useEffect(() => {
    cargarCarreras();
    api.get('/facultades').then((res) => setFacultades(res.data));
  }, []);

  const cargarCarreras = async () => {
    const res = await api.get('/carreras');
    setCarreras(res.data);
  };

  const agregar = async () => {
    if (!nombre.trim() || !idFacultad) return;
    await api.post('/carreras', { NOMBRE: nombre, ID_FACULTAD: idFacultad });
    setNombre('');
    setIdFacultad('');
    cargarCarreras();
  };

  const eliminar = async (id) => {
    await api.delete(`/carreras/${id}`);
    cargarCarreras();
  };

  return (
    <div className="container mt-4">
      <h2>Carreras</h2>
      <div className="row g-2 mb-3 w-75">
        <div className="col">
          <input
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de carrera"
          />
        </div>
        <div className="col">
          <select
            className="form-select"
            value={idFacultad}
            onChange={(e) => setIdFacultad(e.target.value)}
          >
            <option value="">Seleccione facultad</option>
            {facultades.map((f) => (
              <option key={f.ID} value={f.ID}>{f.NOMBRE}</option>
            ))}
          </select>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" onClick={agregar}>Agregar</button>
        </div>
      </div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Carrera</th>
            <th>Facultad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {carreras.map((c) => (
            <tr key={c.ID}>
              <td>{c.ID}</td>
              <td>{c.NOMBRE}</td>
              <td>{c.FACULTAD?.NOMBRE || c.ID_FACULTAD}</td>
              <td>
                <button className="btn btn-sm btn-danger" onClick={() => eliminar(c.ID)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Carreras;
