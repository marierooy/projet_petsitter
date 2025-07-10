import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
      const url = isRegister ? `${API_BASE}/register` : `${API_BASE}/login`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        if (data.token) {
          login(data.token);
          navigate('/');
        }
        setFormData({
          roles: [],
          first_name: '',
          last_name: '',
          email: '',
          password: '',
        });
      }
    } catch (err) {
      setError('Erreur réseau');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>{isRegister ? 'Créer un compte' : 'Se connecter'}</h2>
      <form onSubmit={handleSubmit} class='gap-1'>
        {isRegister && (
          <>
            <label class="labelForm" for="petsitter-checkbox">
              <input
                type="checkbox"
                name="roles"
                value="petsitter"
                checked={formData.roles.includes("petsitter")}
                onChange={handleCheckboxChange}
                class='checkboxForm'
                id="petsitter-checkbox" 
              />
              &nbsp; Petsitter
            </label>
            <label class="labelForm" for="owner-checkbox">
              <input
                type="checkbox"
                name="roles"
                value="owner"
                checked={formData.roles.includes("owner")}
                onChange={handleCheckboxChange}
                class='checkboxForm'
                id="owner-checkbox" 
              />
              &nbsp; Propriétaire
            </label>

            <label class="labelForm">
              Prénom:
              <input class='inputForm' type="text" name="first_name" value={formData.first_name} onChange={handleChange} required={isRegister} />
            </label>
            <label class="labelForm">
              Nom:
              <input class='inputForm' type="text" name="last_name" value={formData.last_name} onChange={handleChange} required={isRegister} />
            </label>
          </>
        )}
        <label class="labelForm">
          Email:
          <input class='inputForm' type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>
        <label class="labelForm">
          Mot de passe:
          <input class='inputForm' type="password" name="password" value={formData.password} onChange={handleChange} required />
        </label>

        <button class="btn-blue" type="submit">{isRegister ? 'S\'inscrire' : 'Se connecter'}</button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {Array.isArray(error) ? (
        <ul style={{ color: 'red' }}>
          {error.map((err, i) => (
            <li key={i}>{err.msg}</li>
          ))}
        </ul>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : null}

      <hr />

      {isRegister ? 'Déjà un compte ?': 'Pas encore de compte ?'}
      <button onClick={() => {
        setIsRegister(!isRegister);
        setMessage(null);
        setError(null);
      }} class='btn-green ml-2'>
        {isRegister ? 'Se connecter' : 'S\'inscrire'}
      </button>
    </div>
  );
}

export default AuthForm;