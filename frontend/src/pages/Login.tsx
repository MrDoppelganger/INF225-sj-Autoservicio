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
      {/* Header flotante estilo Glassmorphism */}
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
              <span className="brand-title">UNIVERSIDAD TÉCNICA</span>
              <span className="brand-subtitle">FEDERICO SANTA MARÍA</span>
            </div>
          </div>
          <nav className="header-nav">
            <a href="#">Ayuda</a>
            <a href="#" className="nav-btn">Acceder</a>
          </nav>
        </div>
      </header>

      {/* Split Screen a pantalla completa */}
      <main className="hero-container">
        <div className="hero-content">
          <div className="content-wrapper">
            <span className="pill-badge">AUTOSERVICIO INSTITUCIONAL</span>
            <h1 className="hero-title">
              Portal de <br />
              <span className="text-gradient">autoservicio</span>
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
        </div>

        <div className="hero-image-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Campus USM" 
            className="hero-image"
          />
        </div>
      </main>

      {/* Tarjetas informativas con diseño limpio */}
      <section className="info-cards-section">
        <div className="cards-grid">
          <div className="info-card">
            <h3>Cuenta Institucional</h3>
            <p>Accede con tu correo universitario para gestionar asignaturas y certificados.</p>
          </div>
          <div className="info-card">
            <h3>Alumnos Nuevos</h3>
            <p>Postulantes aceptados en la USM pueden iniciar su proceso de matrícula oficial aquí.</p>
          </div>
          <div className="info-card">
            <h3>Exalumnos e Invitados</h3>
            <p>Ingresa con tu clave de acceso personal para revisar historial e información pública.</p>
          </div>
        </div>
      </section>
    </div>
  );
};