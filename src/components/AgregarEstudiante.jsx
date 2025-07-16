import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AgregarEstudiante = () => {
  const [form, setForm] = useState({
    DNI: '',
    NOMBRES: '',
    APELLIDOS: '',
    FECHA_NACIMIENTO: '',
    TELEFONO: '',
    EMAIL: '',
    FOTO: '',
    CARRERAS: [],
    CLUBES: []
  });

  const [mensaje, setMensaje] = useState('');
  const [facultades, setFacultades] = useState([]);
  const [facultadSeleccionada, setFacultadSeleccionada] = useState('');
  const [todasCarreras, setTodasCarreras] = useState([]);
  const [carrerasFiltradas, setCarrerasFiltradas] = useState([]);
  const [clubes, setClubes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resFacultades, resCarreras, resClubes] = await Promise.all([
          api.get('/facultades'),
          api.get('/carreras'),
          api.get('/clubes')
        ]);
        setFacultades(resFacultades.data);
        setTodasCarreras(resCarreras.data);
        setClubes(resClubes.data);
      } catch (error) {
        setMensaje('❌ Error al cargar datos iniciales.');
        console.error('Error al cargar datos:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (facultadSeleccionada) {
      const filtradas = todasCarreras.filter(c => c.ID_FACULTAD === parseInt(facultadSeleccionada));
      setCarrerasFiltradas(filtradas);
    } else {
      setCarrerasFiltradas([]);
    }
    setForm(prev => ({ ...prev, CARRERAS: [] }));
  }, [facultadSeleccionada, todasCarreras]);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMensaje('❌ La foto no debe exceder 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, FOTO: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleMultiSelect = (e) => {
    const { name, options } = e.target;
    const values = Array.from(options).filter(o => o.selected).map(o => parseInt(o.value));
    setForm(prev => ({ ...prev, [name]: values }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.DNI || !form.NOMBRES || !form.APELLIDOS || !form.EMAIL || !form.FECHA_NACIMIENTO) {
      setMensaje('❌ Todos los campos obligatorios deben estar llenos.');
      return;
    }
    if (isNaN(Date.parse(form.FECHA_NACIMIENTO))) {
      setMensaje('❌ Fecha de nacimiento inválida.');
      return;
    }

    try {
      const fecha = new Date(form.FECHA_NACIMIENTO).toISOString();
      const resEstudiante = await api.post('/estudiantes', {
        DNI: form.DNI,
        NOMBRES: form.NOMBRES,
        APELLIDOS: form.APELLIDOS,
        FECHA_NACIMIENTO: fecha,
        TELEFONO: form.TELEFONO,
        EMAIL: form.EMAIL,
        FOTO: form.FOTO
      });

      let erroresCarreras = [];
      for (const idCarrera of form.CARRERAS) {
        try {
          await api.post('/estudiante-carrera', { dniEstudiante: form.DNI, idCarrera });
        } catch (err) {
          erroresCarreras.push(`Carrera ID ${idCarrera}: ${err.response?.data?.error || 'Error desconocido'}`);
        }
      }

      let erroresClubes = [];
      for (const idClub of form.CLUBES) {
        try {
          await api.post('/estudiante-club', { dniEstudiante: form.DNI, idClub });
        } catch (err) {
          erroresClubes.push(`Club ID ${idClub}: ${err.response?.data?.error || 'Error desconocido'}`);
        }
      }

      const mensajeFinal = erroresCarreras.length || erroresClubes.length
        ? `✅ ${resEstudiante.data.NOMBRES} registrado, pero hubo errores: ${[...erroresCarreras, ...erroresClubes].join('; ')}`
        : `✅ ${resEstudiante.data.NOMBRES} registrado correctamente.`;
      setMensaje(mensajeFinal);

      setForm({
        DNI: '', NOMBRES: '', APELLIDOS: '',
        FECHA_NACIMIENTO: '', TELEFONO: '', EMAIL: '',
        FOTO: '', CARRERAS: [], CLUBES: []
      });
      setFacultadSeleccionada('');
    } catch (err) {
      setMensaje(`❌ Error al registrar: ${err.response?.data?.error || 'Intente de nuevo'}`);
      console.error('Error al registrar:', err);
    }
  };

  const handleVolver = () => navigate('/estudiantes');

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📋 Registrar Estudiante</h2>
      <button className="btn btn-secondary mb-3" onClick={handleVolver}>
        <ArrowBackIcon /> Volver
      </button>

      <form className="row g-3 bg-white p-4 rounded shadow-sm" onSubmit={handleSubmit}>
        <div className="col-md-6">
          <label className="form-label">🪪 DNI</label>
          <input type="text" className="form-control" name="DNI" value={form.DNI} required onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">👤 Nombres</label>
          <input type="text" className="form-control" name="NOMBRES" value={form.NOMBRES} required onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">👤 Apellidos</label>
          <input type="text" className="form-control" name="APELLIDOS" value={form.APELLIDOS} required onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">🎂 Fecha de nacimiento</label>
          <input type="date" className="form-control" name="FECHA_NACIMIENTO" value={form.FECHA_NACIMIENTO} required onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">📞 Teléfono</label>
          <input type="text" className="form-control" name="TELEFONO" value={form.TELEFONO} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">📧 Correo electrónico</label>
          <input type="email" className="form-control" name="EMAIL" value={form.EMAIL} required onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">🏛️ Facultad</label>
          <select className="form-select" value={facultadSeleccionada} onChange={e => setFacultadSeleccionada(e.target.value)}>
            <option value="">Seleccione una facultad</option>
            {facultades.map(f => <option key={f.ID} value={f.ID}>{f.NOMBRE}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">🎓 Carreras</label>
          <select multiple name="CARRERAS" className="form-select" onChange={handleMultiSelect}>
            {carrerasFiltradas.map(c => <option key={c.ID} value={c.ID}>{c.NOMBRE}</option>)}
          </select>
          <small className="text-muted">Ctrl/Cmd + clic para seleccionar varias</small>
        </div>
        <div className="col-md-6">
          <label className="form-label">🤝 Clubes</label>
          <select multiple name="CLUBES" className="form-select" onChange={handleMultiSelect}>
            {clubes.map(c => <option key={c.ID} value={c.ID}>{c.NOMBRE}</option>)}
          </select>
          <small className="text-muted">Ctrl/Cmd + clic para seleccionar varias</small>
        </div>
        <div className="col-12">
          <label className="form-label">🖼️ Subir Foto</label>
          <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
          {form.FOTO && (
            <div className="text-center mt-3">
              <img src={form.FOTO} alt="Vista previa" style={{ maxHeight: '150px', borderRadius: '8px' }} />
            </div>
          )}
        </div>
        <div className="col-12 d-grid">
          <button type="submit" className="btn btn-primary">✅ Agregar Estudiante</button>
        </div>
        {mensaje && <div className={`alert ${mensaje.startsWith('✅') ? 'alert-success' : 'alert-danger'} mt-3`}>{mensaje}</div>}
      </form>
    </div>
  );
};

export default AgregarEstudiante;
