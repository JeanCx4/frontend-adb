import api from './api';

/**
 * Función para iniciar sesión con credenciales.
 * @param {string} correo - correo del usuario
 * @param {string} clave - contraseña en texto plano
 * @returns {object} - datos del usuario o error
 */
export const login = async (correo, clave) => {
  try {
    const res = await api.post('/auth/login', { correo, clave });

    // Validamos que el token venga en la respuesta
    if (!res.data.token) {
      throw new Error('No se recibió token del servidor');
    }

    // Guardamos el token en localStorage
    localStorage.setItem('token', res.data.token);

    // Puedes guardar otros datos si lo necesitas
    // localStorage.setItem('usuario', JSON.stringify(res.data.usuario));

    return res.data; // útil para redirección o carga de datos
  } catch (err) {
    // Si hay error, lo lanzamos para que el componente lo capture
    throw err.response?.data || { mensaje: 'Error inesperado en el login' };
  }
};
