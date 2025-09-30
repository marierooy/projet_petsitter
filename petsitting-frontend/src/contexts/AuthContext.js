import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchCsrfToken } from '../utils/csrf';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ⚡ Intercepteur global pour gérer la session expirée
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          if (error.config?.url.includes("/api/auth/me")) {
            return Promise.reject(error);
          }
          setUser(null);       // réinitialise le contexte
          navigate("/");       // redirection vers la page d'accueil
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await fetchCsrfToken();
        const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/auth/me`,
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": token },
        });
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const token = await fetchCsrfToken();
      await axios.post(`${process.env.REACT_APP_API_BASE}/api/auth/login`, credentials,
      {
        withCredentials: true,
        headers: { "X-CSRF-Token": token },
      });
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/auth/me`,
      {
        withCredentials: true,
        headers: { "X-CSRF-Token": token },
      });
      setUser(res.data.user);
      navigate("/");
    } catch (err) {
      console.error("Erreur login", err);
    }
  };

  const logout = async () => {
    try {
      const token = await fetchCsrfToken();
      await axios.post(`${process.env.REACT_APP_API_BASE}/api/auth/logout`, {},
      {
        withCredentials: true,
        headers: { "X-CSRF-Token": token },
      });
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Erreur logout", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);