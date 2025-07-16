import { Navigate } from 'react-router-dom';
import { getToken } from '../utils/token';

const ProtectedRoute = ({ children }) => {
  return getToken() ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
