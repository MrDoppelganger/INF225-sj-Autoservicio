import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PagoArancel } from './PagoArancel';
import { InformacionPersonal } from './InformacionPersonal';
import { ObtenerCertificados } from './ObtenerCertificados'; 
import { MisBeneficios } from './MisBeneficios';
import { BandejaConsultas } from './BandejaConsultas';
import logoUsm from '../assets/logo_usm.png';
import '../styles/dashboard.css';

export const Dashboard = () => {
  const [user, setUser] = useState<{ id: number; rut: string; perfil: string; nombre: string; situacion_academica?: string } | null>(null);
  const [vistaActual, setVistaActual] = useState<string>(() => {
    return localStorage.getItem('vistaDashboard') || 'landing';
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('vistaDashboard', vistaActual);
  }, [vistaActual]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('vistaDashboard');
    navigate('/', { state: { mensaje: 'Sesión cerrada correctamente' } });
  };

  if (!user) return null;

  if (vistaActual === 'info') return <InformacionPersonal userId={user.id} setVista={setVistaActual} />;
  if (vistaActual === 'pagos') return <PagoArancel userId={user.id} setVista={setVistaActual} />;
  if (vistaActual === 'certificados') return <ObtenerCertificados user={user} setVista={setVistaActual} />;
  if (vistaActual === 'admin_bandeja') return <BandejaConsultas user={user} setVista={setVistaActual} />;
  if (vistaActual === 'beneficios') return <MisBeneficios userId={user.id} setVista={setVistaActual} />;

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="header-info">
          <img src={logoUsm} alt="Logo Universidad" className="logo-img" />
          <div>
            <p>Bienvenido, <strong>{user.nombre}</strong> al Portal de Autoservicio Institucional</p>
            <p>Tipo de Usuario: <strong>{user.perfil}</strong></p>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </header>

      <main className="landing-grid">
        
        {user.perfil === 'Administrador' ? (
          <div className="card-modulo admin-card" onClick={() => setVistaActual('admin_bandeja')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
              <path d="M22 12h-6l-2 3h-4l-2-3H2"></path>
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
            </svg>
            <h3>Bandeja de Consultas Pendientes</h3>
            <p>Módulo de gestión centralizada. Revisa, prioriza y responde las solicitudes de los alumnos de forma ordenada.</p>
          </div>
        ) : (
          <>
            <div className="card-modulo" onClick={() => setVistaActual('info')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <h3>Información Personal</h3>
              <p>Consulta tus datos académicos y gestiona tus datos bancarios.</p>
            </div>

            {(user.perfil === 'Estudiante Regular' || user.perfil === 'Alumno Nuevo') && (
              <>
                <div className="card-modulo" onClick={() => setVistaActual('pagos')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  <h3>Pago de Arancel</h3>
                  <p>Revisa tu estado de cuenta y realiza abonos.</p>
                </div>

                {/* CA1: Módulo exclusivo de Beneficios para estudiantes regulares/nuevos */}
                <div className="card-modulo" onClick={() => setVistaActual('beneficios')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <h3>Mis Beneficios</h3>
                  <p>Revisa las becas asignadas y sus montos de cobertura aplicados a tu arancel.</p>
                </div>
              </>
            )}

            <div className="card-modulo" onClick={() => setVistaActual('certificados')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <h3>Obtener Certificados</h3>
              <p>Solicita y descarga tus certificados académicos, de alumno regular o título universitario.</p>
            </div>
          </>
        )}

      </main>
    </div>
  );
};