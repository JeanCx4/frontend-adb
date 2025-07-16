import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth.service';
import './Login.css';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await login(correo, clave);

      // Guarda el token en localStorage para futuras peticiones
      localStorage.setItem('auth_token', response.token);

      // Puedes guardar el rol o nombre si lo necesitas
      localStorage.setItem('auth_usuario', JSON.stringify(response.usuario));

      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Error de login:', err);
      setError(err?.mensaje || 'Correo o contraseña incorrecta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded shadow" style={{ width: '100%', maxWidth: 400 }}>
        <h3 className="mb-4 text-center">Iniciar sesión 🔐</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="form-group mb-3">
          <label htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            type="email"
            className="form-control"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group mb-4">
          <label htmlFor="clave">Contraseña</label>
          <input
            id="clave"
            type="password"
            className="form-control"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Validando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default Login;
