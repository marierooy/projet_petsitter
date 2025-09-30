import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>; // ⏳ évite la redirection prématurée
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
