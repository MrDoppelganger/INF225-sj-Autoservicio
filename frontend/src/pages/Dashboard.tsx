import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PagoArancel } from './PagoArancel';
import { InformacionPersonal } from './InformacionPersonal';
// 1. IMPORTAR EL COMPONENTE DE CERTIFICADOS
import { ObtenerCertificados } from './ObtenerCertificados'; 
import logoUsm from '../assets/logo_usm.png';

export const Dashboard = () => {
  // Asegúrate de que el tipo del state contenga situacion_academica
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

  // 2. AGREGAR LA CONDICIÓN PARA RENDERIZAR LA VISTA (Nota que le pasamos el "user" completo)
  if (vistaActual === 'info') return <InformacionPersonal userId={user.id} setVista={setVistaActual} />;
  if (vistaActual === 'pagos') return <PagoArancel userId={user.id} setVista={setVistaActual} />;
  if (vistaActual === 'certificados') return <ObtenerCertificados user={user} setVista={setVistaActual} />;

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

        {/* 3. AGREGAR LA TARJETA DE CERTIFICADOS (Visible para todos, pero adentro cambia su contenido) */}
        <div className="card-modulo" onClick={() => setVistaActual('certificados')} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '20px' }}>
          <h3>Obtener Certificados</h3>
          <p>Solicita y descarga tus certificados académicos, de alumno regular o título universitario.</p>
        </div>
      </main>
    </div>
  );
};