import { useState } from 'react';
import '../styles/Login.css';

export const Login = () => {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="modern-layout">
      <header className="site-header">
        <div className="header-container">
          <div className="brand-area">
            <div className="logo-box">
              <img 
                src="https://usm.cl/wp-content/uploads/2020/12/logo-usm_blanco.svg" 
                alt="USM" 
              />
            </div>
            <div className="brand-text">
              <span className="brand-title">UNIVERSIDAD TECNICA</span>
              <span className="brand-subtitle">FEDERICO SANTA MARIA</span>
            </div>
          </div>
          <nav className="header-nav">
            <a href="#">Ayuda</a>
            <a href="#" className="nav-btn">Acceder</a>
          </nav>
        </div>
      </header>

      <main className="hero-container">
        <div className="hero-content">
          <span className="pill-badge">AUTOSERVICIO INSTITUCIONAL</span>
          <h1 className="hero-title">
            Portal de <br />
            <span className="text-highlight">autoservicio</span>
          </h1>
          <p className="hero-description">
            Gestiona tu información académica de forma rápida y segura. Ingresa tus credenciales para acceder a la plataforma.
          </p>

          <form onSubmit={handleSubmit} className="clean-form">
            <div className="input-row">
              <label htmlFor="rut">RUT</label>
              <input
                type="text"
                id="rut"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                placeholder="12.345.678-9"
                required
              />
            </div>
            <div className="input-row">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Iniciar Sesión
              </button>
              <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>
          </form>
        </div>

        <div className="hero-image-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Estudiantes" 
            className="hero-image"
          />
        </div>
      </main>

      <section className="info-cards-section">
        <div className="cards-grid">
          <div className="info-card">
            <h3>Acceso con cuenta Institucional</h3>
            <p>Si cuentas con tu correo institucional, puedes acceder a nuestros servicios aquí.</p>
          </div>
          <div className="info-card">
            <h3>Acceso para alumnos nuevos</h3>
            <p>Si eres un postulante aceptado en la USM, puedes iniciar tu proceso de matrícula aquí.</p>
          </div>
          <div className="info-card">
            <h3>Acceso para exalumnos e invitados</h3>
            <p>Si cuentas con una clave de acceso personal puedes ingresar a nuestros servicios aquí.</p>
          </div>
        </div>
      </section>
    </div>
  );
};