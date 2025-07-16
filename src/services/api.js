import axios from 'axios';
import { getToken } from '../utils/token';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Servicios para asistencias QR
export const asistenciaQRService = {
  // Validar estudiante por DNI
  validarEstudiante: (dni) => 
    api.get(`/estudiantes/validar-qr/${dni}`),
  
  // Registrar asistencia por QR
  registrarAsistencia: (dni) => 
    api.post('/asistencias/qr', { dni }),
  
  // Obtener todas las asistencias
  obtenerAsistencias: () => 
    api.get('/asistencias'),
  
  // Obtener asistencias de hoy
  obtenerAsistenciasHoy: () => {
    const hoy = new Date().toISOString().split('T')[0];
    return api.get(`/asistencias?fecha=${hoy}`);
  }
};

export default api;
