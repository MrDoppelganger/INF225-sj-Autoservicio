import '../styles/Navbar.css';

export const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h2>Portal USM</h2>
      </div>
      <ul className="navbar-links">
        <li><a href="#inicio">Inicio</a></li>
        <li><a href="#perfil">Mi Perfil</a></li>
        <li><a href="#salir" className="btn-logout">Cerrar Sesión</a></li>
      </ul>
    </nav>
  );
};