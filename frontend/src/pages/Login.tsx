import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoUsm from '../assets/logo_usm.png';

export const Login = () => {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // CA2: Mensaje de "Sesión cerrada correctamente"
    if (location.state && location.state.mensaje) {
      setMensajeExito(location.state.mensaje);
      window.history.replaceState({}, document.title);
    }

    // CA3: Si ya hay sesión, redirigir directo al dashboard
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut, password }),
      });

      const data = await response.json();

      if (data.success) {
        // CA1: Guardar sesión y redirigir al panel
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        // CA4: Denegar acceso y mostrar mensaje
        setError(data.message);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

  return (
    <div>
      <img src={logoUsm} alt="Logo Universidad" className="logo-img" />
      <p>Acceso a Portal de Autoservicio Institucional</p>
      
      {mensajeExito && <div style={{ color: 'green' }}>{mensajeExito}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>RUT: </label>
          <input 
            type="text" 
            value={rut} 
            onChange={(e) => setRut(e.target.value)} 
            required 
          />
        </div>
        <br />
        <div>
          <label>Contraseña: </label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <br />
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};