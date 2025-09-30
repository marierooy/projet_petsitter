import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchCsrfToken } from '../utils/csrf';

const API_BASE = process.env.REACT_APP_API_BASE + '/api/auth' || '/api/auth';

function AuthForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    roles: [],
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const roles = new Set(prev.roles);
      checked ? roles.add(value) : roles.delete(value);
      return { ...prev, roles: Array.from(roles) };
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const CSRF_TOKEN = await fetchCsrfToken();
      const url = isRegister ? `${API_BASE}/register` : `${API_BASE}/login`;
      console.log(formData);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': CSRF_TOKEN
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        if (Array.isArray(data.errors)) {
          setError(data.errors); // tableau
        } else {
          setError(data.error || 'Erreur inconnue'); // string
        }
      } else {
        setMessage(data.message + ' ' + JSON.stringify(data.user) || 'Succès !');
        await login({
          email: formData.email,
          password: formData.password
        });
        setFormData({
          roles: [],
          first_name: '',
          last_name: '',
          email: '',
          password: '',
        });
        navigate('/');
      }
    } catch (err) {
      setError('Erreur réseau');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: 'auto', marginTop: '2rem' }}>
      <div className="text-center">
        <h2 className="text-xl font-bold text-[var(--color-green)] mb-3 pb-2 inline-block">{isRegister ? 'Créer un compte' : 'Se connecter'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="gap-1">
        {isRegister && (
          <>
            <label className="labelForm" htmlFor="petsitter-checkbox">
              <input
                type="checkbox"
                name="roles"
                value="petsitter"
                checked={formData.roles.includes("petsitter")}
                onChange={handleCheckboxChange}
                className="checkboxForm"
                id="petsitter-checkbox"
              />
              &nbsp; Petsitter
            </label>
            <label className="labelForm" htmlFor="owner-checkbox">
              <input
                type="checkbox"
                name="roles"
                value="owner"
                checked={formData.roles.includes("owner")}
                onChange={handleCheckboxChange}
                className="checkboxForm"
                id="owner-checkbox"
              />
              &nbsp; Propriétaire
            </label>

            <label className="labelForm">
              Prénom:
              <input
                className="inputForm"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required={isRegister}
              />
            </label>
            <label className="labelForm">
              Nom:
              <input
                className="inputForm"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required={isRegister}
              />
            </label>
          </>
        )}

        <label className="labelForm">
          Email:
          <input
            className="inputForm"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        <label className="labelForm">
          Mot de passe:
          <input
            className="inputForm"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>

        <button className="btn-green" type="submit">
          {isRegister ? "S'inscrire" : 'Se connecter'}
        </button>
      </form>

      {/* {message && <div className="alert-success">{message}</div>} */}
      {Array.isArray(error) ? (
        <div className="alert-error">
          <ul>
            {error.map((err, i) => (
              <li key={i}>{err.msg}</li>
            ))}
          </ul>
        </div>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : null}

      <hr style={{ margin: '1.5rem 0' }} />

      <div className="text-center">
        {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage(null);
            setError(null);
          }}
          className="btn-blue"
          style={{ marginLeft: '0.5rem' }}
        >
          {isRegister ? 'Se connecter' : "S'inscrire"}
        </button>
      </div>
    </div>
  );
}

export default AuthForm;