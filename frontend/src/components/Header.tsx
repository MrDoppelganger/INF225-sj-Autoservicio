import { useState } from 'react';
import logoUsm from '../assets/logo_usm.png';
import '../styles/Header.css';

interface HeaderProps {
  setVista: (vista: string) => void;
  perfil: string;
}

export const Header = ({ setVista, perfil }: HeaderProps) => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleNavegacion = (vista: string) => {
    setVista(vista);
    setMenuAbierto(false);
  };

  return (
    <header className="navbar-interna">
      <div className="navbar-logo" onClick={() => handleNavegacion('landing')} style={{ cursor: 'pointer' }}>
        <img src={logoUsm} alt="Logo Universidad" className="logo-img" />
      </div>
      
      <button className="menu-toggle" onClick={() => setMenuAbierto(!menuAbierto)} aria-label="Abrir menú">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>
      
      <nav className={`navbar-links ${menuAbierto ? 'abierto' : ''}`}>
        <button onClick={() => handleNavegacion('info')}>Mi Perfil</button>
        {(perfil === 'Estudiante Regular' || perfil === 'Alumno Nuevo') && (
          <button onClick={() => handleNavegacion('pagos')}>Pago de Aranceles</button>
        )}
      </nav>
    </header>
  );
};