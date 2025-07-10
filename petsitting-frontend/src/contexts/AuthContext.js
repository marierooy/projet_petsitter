import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000; // en secondes

        if (decoded.exp && decoded.exp > now) {
          setUser({ token, ...decoded });
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Token invalide', err);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      localStorage.setItem('token', token);
      setUser({ token, ...decoded });
    } catch (err) {
      console.error('Erreur lors du décodage du token', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
