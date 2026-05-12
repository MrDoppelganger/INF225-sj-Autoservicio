import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PagoArancel } from './PagoArancel';
import { PerfilBancario } from './PerfilBancario';
import { InformacionPersonal } from './InformacionPersonal';
import logoUsm from '../assets/logo_usm.png';

export const Dashboard = () => {
const [user, setUser] = useState<{ id: number; rut: string; perfil: string; nombre: string } | null>(null);
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
  if (vistaActual === 'bancario') return <PerfilBancario userId={user.id} setVista={setVistaActual} />;
  if (vistaActual === 'pagos') return <PagoArancel userId={user.id} setVista={setVistaActual} />;

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="header-info">
          <img src={logoUsm} alt="Logo Universidad" className="logo-img" />
          <p>Bienvenido, <strong>{user.nombre}</strong> | Perfil: <strong>{user.perfil} </strong>al Portal de Autoservicio Institucional</p>
        </div>
        <button className="btn-logout" style={{ cursor: 'pointer' }} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </header>

      <main className="landing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', padding: '20px' }}>
        <div className="card-modulo" onClick={() => setVistaActual('info')} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '20px' }}>
          <h3>Información Personal</h3>
          <p>Consulta tus datos de contacto y situación académica.</p>
        </div>

        <div className="card-modulo" onClick={() => setVistaActual('bancario')} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '20px' }}>
          <h3>Datos Bancarios</h3>
          <p>Gestiona tu cuenta para devoluciones y pagos.</p>
        </div>

        {(user.perfil === 'Estudiante Regular' || user.perfil === 'Alumno Nuevo') && (
          <div className="card-modulo" onClick={() => setVistaActual('pagos')} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '20px' }}>
            <h3>Pagos y Aranceles</h3>
            <p>Estado de cuenta, beneficios y abonos en línea.</p>
          </div>
        )}
      </main>
    </div>
  );
};