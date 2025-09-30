import axios from 'axios';

export const fetchCsrfToken = async () => {
  const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/csrf-token`, { withCredentials: true });
  return res.data.csrfToken;
};