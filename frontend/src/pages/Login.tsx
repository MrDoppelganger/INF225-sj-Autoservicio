import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoUsm from '../assets/logo_usm.png';
import '../styles/login.css';

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
    <div className="login-container">
      {/* Mitad Izquierda: Branding Institucional */}
      <div className="login-brand">
        <img src={logoUsm} alt="Logo Universidad" className="login-logo-img" />
        <div className="brand-text">
          <h1>Portal de Autoservicio</h1>
          <p>Gestiona tu información académica, certificados y aranceles desde una plataforma centralizada y segura.</p>
        </div>
      </div>

      {/* Mitad Derecha: Formulario */}
      <div className="login-form-wrapper">
        <div className="login-form-content">
          <h2>Iniciar Sesión</h2>
          <p className="login-subtitle">Ingresa tus credenciales institucionales</p>
          
          {mensajeExito && <div className="alerta-login alerta-exito">{mensajeExito}</div>}
          {error && <div className="alerta-login alerta-error">{error}</div>}

          <form onSubmit={handleSubmit} className="form-login">
            <div className="form-group">
              <label>RUT Institucional</label>
              <input 
                type="text" 
                value={rut} 
                onChange={(e) => setRut(e.target.value)} 
                placeholder="Ej: 12345678-9"
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Ingresa tu contraseña"
                required 
              />
            </div>
            
            <button type="submit" className="btn-login">Ingresar al Portal</button>
          </form>
        </div>
      </div>
    </div>
  );
};