import axios from 'axios';
import { fetchCsrfToken } from './csrf';

// Crée une instance Axios avec l'URL de base et withCredentials activé
const api = axios.create({
  withCredentials: true, // pour envoyer les cookies HttpOnly
});

// Intercepteur avant chaque requête
api.interceptors.request.use(async (config) => {
  // On ajoute le token CSRF uniquement pour les requêtes modifiant l'état
  if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
    const csrfToken = await fetchCsrfToken();
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;