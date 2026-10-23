// -------------------Componente de Cabecera-------------------------
// Barra de navegación superior interna con accesos según rol
// Plataforma: Portal de Autoservicio Institucional (UTFSM)
// -------------------------------------------------------------------

import { useState } from 'react';
import logoUsm from '../assets/logo_usm.png';
import '../styles/Header.css';

// ---------------------Interfaces-----------------------------------
// Definición de las propiedades recibidas por el componente Header
// -------------------------------------------------------------------
interface HeaderProps {
  setVista: (vista: string) => void;
  perfil: string;
}

// ------------------Componente React-------------------
//   Header:
//       Barra de navegación principal que despliega la identidad
//       institucional y los enlaces según el perfil del usuario.
// ---------------------Props---------------------------
//   @param {HeaderProps} props - Propiedades de navegación y perfil.
// ------------------Retorno----------------------------
//   @returns {JSX.Element} Barra de navegación renderizada.
// -----------------------------------------------------
export const Header = ({ setVista, perfil }: HeaderProps) => {
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);

  // -------------------Función----------------------
  //   handleNavegacion:
  //       Cambia la vista activa del portal y cierra el menú
  //       desplegable móvil en dispositivos de pantalla reducida.
  // ------------------Parámetros-------------------
  //   @param {string} vista - Identificador de la vista destino.
  // ------------------Retorno-----------------------
  //   @returns {void}
  // -----------------------------------------------
  const handleNavegacion = (vista: string): void => {
    setVista(vista);
    setMenuAbierto(false);
  };

  return (
    <header className="navbar-interna">
      <div 
        className="navbar-logo" 
        onClick={() => handleNavegacion('landing')} 
        style={{ cursor: 'pointer' }}
      >
        <img src={logoUsm} alt="Logo Universidad" className="logo-img" />
      </div>
      
      <button 
        className="menu-toggle" 
        onClick={() => setMenuAbierto(!menuAbierto)} 
        aria-label="Abrir menú"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>
      
      <nav className={`navbar-links ${menuAbierto ? 'abierto' : ''}`}>
        <button onClick={() => handleNavegacion('info')}>Mi Perfil</button>
        {(perfil === 'Estudiante Regular' || perfil === 'Alumno Nuevo') && (
          <button onClick={() => handleNavegacion('pagos')}>Pago de Aranceles</button>
        )}
        {perfil !== 'Administrador' && (
          <button onClick={() => handleNavegacion('soporte')}>Soporte</button>
        )}
      </nav>
    </header>
  );
};
