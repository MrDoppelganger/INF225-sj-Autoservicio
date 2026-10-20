// -------------------Módulo de Información Personal-----------------
// Visualización del perfil institucional y centro de soporte
// Plataforma: Portal de Autoservicio Institucional (UTFSM)
// -------------------------------------------------------------------

import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { PerfilBancario } from './PerfilBancario';
import '../styles/informacionPersonal.css';

// ---------------------Interfaces-----------------------------------
// Definición de las propiedades recibidas por Información Personal
// -------------------------------------------------------------------
interface InformacionPersonalProps {
  userId: number;
  setVista: (v: string) => void;
}

interface UsuarioDetalle {
  rut: string;
  nombre: string;
  perfil: string;
  carrera: string;
  situacion_academica: string;
  email: string;
  email_personal?: string;
  email_apoderado?: string;
  telefono?: string;
  direccion?: string;
}

interface ConsultaTicket {
  id: number;
  fecha: string;
  asunto: string;
  estado: string;
  respuesta?: string;
}

// ------------------Componente React-------------------
//   InformacionPersonal:
//       Despliega los antecedentes académicos del alumno,
//       el módulo de datos bancarios y el canal de ayuda.
// ---------------------Props---------------------------
//   @param {InformacionPersonalProps} props - Props del componente.
// ------------------Retorno----------------------------
//   @returns {JSX.Element} Vista del perfil del estudiante.
// -----------------------------------------------------
export const InformacionPersonal = ({ userId, setVista }: InformacionPersonalProps) => {
  const [usuario, setUsuario] = useState<UsuarioDetalle | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/usuario/info/${userId}`)
      .then((res) => res.json())
      .then((datos) => setUsuario(datos))
      .catch((err) => console.error('Error al cargar perfil:', err));
  }, [userId]);

  // -------------------Función----------------------
  //   handleCrearConsulta:
  //       Solicita el asunto y mensaje para abrir un nuevo ticket
  //       de soporte administrativo desde la interfaz del alumno.
  // ------------------Parámetros-------------------
  //   Ninguno.
  // ------------------Retorno-----------------------
  //   @returns {void}
  // -----------------------------------------------
  const handleCrearConsulta = (): void => {
    const asunto = prompt('Ingresa el Asunto de tu consulta:');
    const mensaje = prompt('Describe detalladamente tu inconveniente:');
    
    if (asunto && mensaje) {
      fetch('http://localhost:3000/api/consultas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: userId, asunto, mensaje }),
      })
      .then((res) => res.json())
      .then((datos) => {
        alert(
          `Solicitud Ticket #${datos.id_consulta} recibida con éxito.\n\n` +
          'Tiempo estimado de respuesta: Máximo 7 días hábiles.'
        );
      });
    }
  };

  // -------------------Función----------------------
  //   handleVerConsultas:
  //       Consulta y despliega el historial de tickets registrados
  //       por el estudiante junto a las respuestas del admin.
  // ------------------Parámetros-------------------
  //   Ninguno.
  // ------------------Retorno-----------------------
  //   @returns {void}
  // -----------------------------------------------
  const handleVerConsultas = (): void => {
    fetch(`http://localhost:3000/api/consultas/${userId}`)
      .then((res) => res.json())
      .then((datos: ConsultaTicket[]) => {
        let textoHistorial = 'TUS CONSULTAS REALIZADAS:\n\n';
        datos.forEach((consulta) => {
          textoHistorial += `ID: #${consulta.id} | Fecha: ${new Date(consulta.fecha).toLocaleDateString()}\n`;
          textoHistorial += `Asunto: ${consulta.asunto}\n`;
          textoHistorial += `Estado: ${consulta.estado}\n`;
          if (consulta.respuesta) {
            textoHistorial += `Respuesta: ${consulta.respuesta}\n`;
          }
          textoHistorial += '--------------------------\n';
        });
        alert(datos.length > 0 ? textoHistorial : 'No tienes consultas registradas.');
      });
  };

  if (!usuario) {
    return (
      <div className="loading-container">
        <div className="loader-spinner"></div>
        <p>Cargando información institucional...</p>
      </div>
    );
  }

  return (
    <div className="layout-principal">
      <Header setVista={setVista} perfil={usuario.perfil} />
      
      <main className="main-content">
        <section className="profile-header">
          <h2>Mi Perfil Académico</h2>
          <p>Consulta tus datos de contacto y situación académica actual.</p>
        </section>

        <section className="profile-data-grid">
          {/* Bloque Académico */}
          <div className="data-field">
            <span className="label">Nombre Completo</span>
            <p className="value">{usuario.nombre}</p>
          </div>
          <div className="data-field">
            <span className="label">RUT</span>
            <p className="value">{usuario.rut}</p>
          </div>
          <div className="data-field">
            <span className="label">Carrera</span>
            <p className="value highlight">{usuario.carrera}</p>
          </div>
          <div className="data-field">
            <span className="label">Situación Académica</span>
            <p className="value">
              <span className="status-tag">{usuario.situacion_academica}</span>
            </p>
          </div>

          {/* Bloque Contacto */}
          <div className="data-field">
            <span className="label">Correo Institucional</span>
            <p className="value">{usuario.email}</p>
          </div>
          <div className="data-field">
            <span className="label">Correo Personal</span>
            <p className="value">{usuario.email_personal || 'No registrado'}</p>
          </div>
          <div className="data-field">
            <span className="label">Correo Apoderado</span>
            <p className="value">{usuario.email_apoderado || 'No registrado'}</p>
          </div>
          <div className="data-field">
            <span className="label">Teléfono</span>
            <p className="value">{usuario.telefono}</p>
          </div>
          <div className="data-field full-width">
            <span className="label">Dirección Particular</span>
            <p className="value">{usuario.direccion}</p>
          </div>
        </section>

        <hr className="section-divider" />
        
        <PerfilBancario userId={userId} />

        {/* Sección: Centro de Soporte */}
        <hr className="section-divider" />
        <section 
          className="profile-support" 
          style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginTop: '20px' }}
        >
          <h3>Centro de Soporte y Ayuda</h3>
          <p>¿Tienes problemas con tus pagos, beneficios académicos o certificados?</p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
            <button 
              onClick={handleCrearConsulta}
              style={{
                background: '#003B70',
                color: '#fff',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              + Nueva Consulta
            </button>

            <button 
              onClick={handleVerConsultas}
              style={{
                background: '#6c757d',
                color: '#fff',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Ver Mis Consultas
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
