import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <p className="footer-text">
          &copy; {new Date().getFullYear()} Mon site de petsitting
        </p>
        <ul className="footer-list">
          <li>
            <Link to="/mentions-legales" className="footer-link">
              Mentions légales
            </Link>
          </li>
          <li>
            <Link to="/politique-confidentialite" className="footer-link">
              Politique de confidentialité
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}