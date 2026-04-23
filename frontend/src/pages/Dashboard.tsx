import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const [user, setUser] = useState<{ rut: string; perfil: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // CA3: Detectar si no hay sesión activa y mantener en login
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    // CA2: Invalidar sesión y redirigir al inicio con mensaje
    localStorage.removeItem('user');
    navigate('/', { state: { mensaje: 'Sesión cerrada correctamente' } });
  };

  if (!user) return null;
  return (
    <div>
      <h1>Panel </h1>
      <p>Bienvenido, RUT: {user.rut}</p>
      
      {/* CA1: Habilitar módulos según situación académica */}
      <p>Tu perfil actual es: <strong>{user.perfil}</strong></p>
      
      <hr />
      <h2>Módulos Disponibles:</h2>
      <ul>
        <li>Información Personal</li>
        <p>en desarrollo</p>
      </ul>
      <hr />

      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};