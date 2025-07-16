import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EditarEstudiante = () => {
  const { dni } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    NOMBRES: '',
    APELLIDOS: '',
    FECHA_NACIMIENTO: '',
    TELEFONO: '',
    EMAIL: '',
    FOTO: '',
    CARRERAS: [],
    CLUBES: []
  });

  const [facultades, setFacultades] = useState([]);
  const [facultadSeleccionada, setFacultadSeleccionada] = useState('');
  const [todasCarreras, setTodasCarreras] = useState([]);
  const [carrerasFiltradas, setCarrerasFiltradas] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resEst, resFacultades, resCarreras, resClubes] = await Promise.all([
          api.get(`/estudiantes/${dni}`),
          api.get('/facultades'),
          api.get('/carreras'),
          api.get('/clubes')
        ]);

        const est = resEst.data;
        setForm({
          NOMBRES: est.NOMBRES || '',
          APELLIDOS: est.APELLIDOS || '',
          FECHA_NACIMIENTO: est.FECHA_NACIMIENTO?.slice(0, 10) || '',
          TELEFONO: est.TELEFONO || '',
          EMAIL: est.EMAIL || '',
          FOTO: est.FOTO || '',
          CARRERAS: est.Carreras?.map(c => c.ID) || [],
          CLUBES: est.Clubs?.map(cl => cl.ID) || []
        });

        setFacultades(resFacultades.data);
        setTodasCarreras(resCarreras.data);
        setClubes(resClubes.data);

        const primeraCarrera = est.Carreras?.[0];
        if (primeraCarrera) {
          setFacultadSeleccionada(String(primeraCarrera.ID_FACULTAD));
        }
      } catch (err) {
        console.error('💥 Error al cargar datos:', err);
        setMensaje('❌ Error al cargar datos del estudiante.');
      }
    };
    cargarDatos();
  }, [dni]);

  useEffect(() => {
    if (facultadSeleccionada) {
      const filtradas = todasCarreras.filter(c => c.ID_FACULTAD === parseInt(facultadSeleccionada));
      setCarrerasFiltradas(filtradas);
    } else {
      setCarrerasFiltradas([]);
    }
  }, [facultadSeleccionada, todasCarreras]);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMultiSelect = (e) => {
    const { name, options } = e.target;
    const values = Array.from(options).filter(o => o.selected).map(o => parseInt(o.value));
    setForm(prev => ({ ...prev, [name]: values }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        NOMBRES: form.NOMBRES,
        APELLIDOS: form.APELLIDOS,
        FECHA_NACIMIENTO: new Date(form.FECHA_NACIMIENTO).toISOString(),
        TELEFONO: form.TELEFONO,
        EMAIL: form.EMAIL,
        FOTO: form.FOTO,
        CARRERAS: form.CARRERAS,
        CLUBES: form.CLUBES
      };

      await api.put(`/estudiantes/${dni}`, payload);

      try {
        await api.get(`/estudiantes/qr/${dni}`);
      } catch (qrErr) {
        console.warn('⚠️ No se pudo regenerar el QR:', qrErr.message);
      }

      setMensaje('✅ Cambios guardados correctamente.');
    } catch (err) {
      console.error('💥 Error al guardar:', err);
      setMensaje('❌ Error al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => navigate('/estudiantes');

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">✏️ Editar Estudiante</h2>
      <button className="btn btn-secondary mb-3" onClick={handleVolver}>
        <ArrowBackIcon /> Volver
      </button>

      <form className="row g-3 bg-white p-4 rounded shadow-sm" onSubmit={handleSubmit}>
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
          <select multiple name="CARRERAS" className="form-select" value={form.CARRERAS} onChange={handleMultiSelect}>
            {carrerasFiltradas.map(c => <option key={c.ID} value={c.ID}>{c.NOMBRE}</option>)}
          </select>
          <small className="text-muted">Ctrl/Cmd + clic para seleccionar varias</small>
        </div>
        <div className="col-md-6">
          <label className="form-label">🤝 Clubes</label>
          <select multiple name="CLUBES" className="form-select" value={form.CLUBES} onChange={handleMultiSelect}>
            {clubes.map(cl => <option key={cl.ID} value={cl.ID}>{cl.NOMBRE}</option>)}
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
          <button type="submit" className="btn btn-primary">
            {loading ? 'Guardando...' : '✅ Actualizar Estudiante'}
          </button>
        </div>
        {mensaje && (
          <div className={`alert ${mensaje.startsWith('✅') ? 'alert-success' : 'alert-danger'} mt-3`}>
            {mensaje}
          </div>
        )}
      </form>
    </div>
  );
}

export default EditarEstudiante;