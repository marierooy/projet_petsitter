import { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchCsrfToken } from '../utils/csrf';

function StarSelector({ rating, setRating }) {
  // rating : note actuelle (1 à 5)
  // setRating : fonction pour changer la note

  return (
    <div style={{ display: 'flex', cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setRating(star)}
          onKeyDown={(e) => { if (e.key === 'Enter') setRating(star); }}
          role="button"
          tabIndex={0}
          style={{
            fontSize: '2rem',
            color: star <= rating ? '#ffc107' : '#e4e5e9',
            userSelect: 'none',
          }}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function EvaluateForm({ contractId, onSuccess }) {
  const [rate, setRate] = useState(0);
  const [comment, setComment] = useState('');

  const [csrfToken, setCsrfToken] = useState(null);

  // 🔑 Récupération CSRF token au montage
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const token = await fetchCsrfToken();
        setCsrfToken(token);
      } catch (err) {
        console.error("Erreur récupération CSRF token", err);
      }
    };
    fetchCsrf();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE}/api/evaluate`,
        { contractId, rate, comment },
        {
          withCredentials: true, // 🔑 envoie le cookie JWT HttpOnly
          headers: {
            "X-CSRF-Token": csrfToken, // 🔑 protection CSRF
          },
        }
      );
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-5 ">
      <label className="labelForm">Note :</label>
      <StarSelector rating={rate} setRating={setRate} />

      <label className="labelForm">Commentaire :</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="border w-full p-2 rounded"
        rows={3}
      />

      <button type="submit" className="btn-blue w-24">
        Envoyer
      </button>
    </form>
  );
}