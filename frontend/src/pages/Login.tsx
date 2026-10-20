// -------------------Módulo de Autenticación-------------------------
// Pantalla de inicio de sesión con validación de credenciales
// Plataforma: Portal de Autoservicio Institucional (UTFSM)
// -------------------------------------------------------------------

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoUsm from '../assets/logo_usm.png';
import '../styles/login.css';

// ------------------Componente React-------------------
//   Login:
//       Despliega el formulario de ingreso con credenciales del
//       estudiante y gestiona la redirección al panel principal.
// ---------------------Props---------------------------
//   Ninguna.
// ------------------Retorno----------------------------
//   @returns {JSX.Element} Vista de login institucional renderizada.
// -----------------------------------------------------
export const Login = () => {
  const [rut, setRut] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [mensajeExito, setMensajeExito] = useState<string>('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Captura mensaje de sesión cerrada desde el estado de navegación
    if (location.state && location.state.mensaje) {
      setMensajeExito(location.state.mensaje);
      window.history.replaceState({}, document.title);
    }

    // Redirección inmediata si ya existe sesión activa almacenada
    const usuarioActivo = localStorage.getItem('user');
    if (usuarioActivo) {
      navigate('/dashboard');
    }
  }, [navigate, location]);

  // -------------------Función----------------------
  //   handleSubmit:
  //       Envía las credenciales al endpoint de autenticación,
  //       almacena el perfil en caso de éxito o despliega error.
  // ------------------Parámetros-------------------
  //   @param {React.FormEvent} e - Evento de envío de formulario.
  // ------------------Retorno-----------------------
  //   @returns {Promise<void>}
  // -----------------------------------------------
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    try {
      const respuesta = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut, password }),
      });

      const datos = await respuesta.json();

      if (datos.success) {
        localStorage.setItem('user', JSON.stringify(datos.user));
        navigate('/dashboard');
      } else {
        setError(datos.message || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error al conectar con el servidor institucional');
    }
  };

  return (
    <div className="login-container">
      {/* Sección Izquierda: Branding Institucional */}
      <div className="login-brand">
        <img src={logoUsm} alt="Logo Universidad" className="login-logo-img" />
        <div className="brand-text">
          <h1>Portal de Autoservicio</h1>
          <p>
            Gestiona tu información académica, certificados y aranceles desde una
            plataforma centralizada y segura.
          </p>
        </div>
      </div>

      {/* Sección Derecha: Formulario de Acceso */}
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
