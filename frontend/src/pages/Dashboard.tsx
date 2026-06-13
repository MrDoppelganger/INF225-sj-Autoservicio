import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PagoArancel } from './PagoArancel';
import { InformacionPersonal } from './InformacionPersonal';
import { ObtenerCertificados } from './ObtenerCertificados'; 
// 1. IMPORTAR EL COMPONENTE DE LA BANDEJA DE ADMINISTRADOR
import { BandejaConsultas } from './BandejaConsultas';
import logoUsm from '../assets/logo_usm.png';

export const Dashboard = () => {
  // Se extiende el tipado del state para incluir situacion_academica
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

  // 2. ENRUTAMIENTO CONDICIONAL DE LAS VISTAS DEL COMPONENTE
  if (vistaActual === 'info') return <InformacionPersonal userId={user.id} setVista={setVistaActual} />;
  if (vistaActual === 'pagos') return <PagoArancel userId={user.id} setVista={setVistaActual} />;
  if (vistaActual === 'certificados') return <ObtenerCertificados user={user} setVista={setVistaActual} />;
  // Vista exclusiva para el Administrador:
  if (vistaActual === 'admin_bandeja') return <BandejaConsultas user={user} setVista={setVistaActual} />;

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="header-info">
          <img src={logoUsm} alt="Logo Universidad" className="logo-img" />
          <p>Bienvenido, <strong>{user.nombre}</strong> al Portal de Autoservicio Institucional</p>
          <p>Tipo de Usuario: <strong>{user.perfil}</strong></p>
        </div>
        <button className="btn-logout" style={{ cursor: 'pointer' }} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </header>

      <main className="landing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
        
        {/* 3. CONTROL DE RENDERIZADO DE MÓDULOS DE ACUERDO AL ROL */}
        {user.perfil === 'Administrador' ? (
          /* Vista única para cuentas con Perfil Administrativo */
          <div 
            className="card-modulo" 
            onClick={() => setVistaActual('admin_bandeja')} 
            style={{ cursor: 'pointer', border: '2px solid #003B70', padding: '20px', backgroundColor: '#e6f0fa', gridColumn: '1 / -1' }}
          >
            <h3>Bandeja de Consultas Pendientes</h3>
            <p>Módulo de gestión centralizada. Revisa, prioriza y responde las solicitudes de los alumnos de forma ordenada.</p>
          </div>
        ) : (
          /* Vista regular para perfiles de Estudiante o Exalumno */
          <>
            <div className="card-modulo" onClick={() => setVistaActual('info')} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '20px' }}>
              <h3>Información Personal</h3>
              <p>Consulta tus datos académicos y gestiona tus datos bancarios.</p>
            </div>

            {(user.perfil === 'Estudiante Regular' || user.perfil === 'Alumno Nuevo') && (
              <div className="card-modulo" onClick={() => setVistaActual('pagos')} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '20px' }}>
                <h3>Pago de Arancel</h3>
                <p>Revisa tu estado de cuenta y realiza abonos.</p>
              </div>
            )}

            <div className="card-modulo" onClick={() => setVistaActual('certificados')} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '20px' }}>
              <h3>Obtener Certificados</h3>
              <p>Solicita y descarga tus certificados académicos, de alumno regular o título universitario.</p>
            </div>
          </>
        )}

      </main>
    </div>
  );
};