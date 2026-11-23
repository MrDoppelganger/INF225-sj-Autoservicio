// -------------------Módulo de Mis Consultas (Estudiante)-----------
// Historial y estado de las consultas enviadas al soporte
// Plataforma: Portal de Autoservicio Institucional (UTFSM)
// -------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { Header } from '../components/Header';
import '../styles/misConsultas.css';

// ---------------------Interfaces-----------------------------------
// Definición de las propiedades recibidas y modelo de consulta
// -------------------------------------------------------------------
interface MisConsultasProps {
  userId?: number;
  user?: {
    id: number;
    nombre: string;
    perfil: string;
  };
  setVista?: (v: string) => void;
}

interface ConsultaItem {
  id: number;
  asunto: string;
  mensaje?: string;
  respuesta?: string | null;
  estado: string;
  fecha: string;
}

// ------------------Componente React-------------------
//   MisConsultas:
//       Despliega el historial de consultas de soporte realizadas
//       por el estudiante, detallando asunto, mensaje, respuesta,
//       estado y fecha de registro.
// ---------------------Props---------------------------
//   @param {MisConsultasProps} props - ID de usuario y callback de vista.
// ------------------Retorno----------------------------
//   @returns {JSX.Element} Vista del historial de consultas.
// -----------------------------------------------------
export const MisConsultas = ({ userId, user, setVista }: MisConsultasProps) => {
  const [consultas, setConsultas] = useState<ConsultaItem[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  // Obtener identificador del usuario activo
  const usuarioSesion = localStorage.getItem('user');
  const usuarioParseado = usuarioSesion ? JSON.parse(usuarioSesion) : null;
  const idEstudiante = userId || user?.id || usuarioParseado?.id || 1;
  const tipoPerfil = usuarioParseado?.perfil || 'Estudiante Regular';

  // -------------------Función----------------------
  //   cargarConsultas:
  //       Consulta a la API REST institucional las solicitudes
  //       de soporte asociadas al estudiante autenticado.
  // ------------------Parámetros-------------------
  //   Ninguno.
  // ------------------Retorno-----------------------
  //   @returns {void}
  // -----------------------------------------------
  const cargarConsultas = (): void => {
    fetch(`${API_BASE_URL}/api/consultas/${idEstudiante}`)
      .then((res) => res.json())
      .then((datos) => {
        if (Array.isArray(datos)) {
          setConsultas(datos);
        }
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error cargando consultas del estudiante:', err);
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarConsultas();
  }, [idEstudiante]);

  // -------------------Función----------------------
  //   formatearFecha:
  //       Formatea la marca temporal a formato convencional chileno.
  // ------------------Parámetros-------------------
  //   @param {string} fechaStr - Marca temporal en formato ISO.
  // ------------------Retorno-----------------------
  //   @returns {string} Fecha formateada 'DD/MM/AAAA, HH:MM'.
  // -----------------------------------------------
  const formatearFecha = (fechaStr: string): string => {
    return new Date(fechaStr).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (cargando) {
    return (
      <div className="layout-principal">
        <Header setVista={setVista || (() => {})} perfil={tipoPerfil} />
        <main className="main-content consultas-main">
          <div className="loading-container">
            <div className="loader-spinner"></div>
            <p>Cargando historial de consultas...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="layout-principal">
      <Header setVista={setVista || (() => {})} perfil={tipoPerfil} />

      <main className="main-content consultas-main">
        <section className="consultas-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              className="btn-regreso-dashboard"
              onClick={() => (setVista ? setVista('landing') : null)}
              aria-label="Volver al menú principal"
              title="Volver al menú principal"
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <h2>Mis Consultas</h2>
          </div>
          <p>Revisa el historial y estado de tus consultas realizadas al equipo de soporte.</p>
        </section>

        {consultas.length === 0 ? (
          <section className="bandeja-vacia-contenedor">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="bandeja-vacia-icono"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <h3>Sin Consultas</h3>
            <p>No tienes consultas registradas en tu historial de soporte.</p>
          </section>
        ) : (
          <section className="tabla-consultas-container">
            <table className="tabla-consultas">
              <thead>
                <tr>
                  <th>Asunto</th>
                  <th>Mensaje</th>
                  <th>Respuesta</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {consultas.map((item) => (
                  <tr key={item.id} className={item.estado === 'Respondida' ? 'fila-respondida' : 'fila-pendiente'}>
                    <td className="consulta-asunto">{item.asunto}</td>
                    <td className="consulta-mensaje">{item.mensaje || '—'}</td>
                    <td className="consulta-respuesta">
                      {item.respuesta ? (
                        item.respuesta
                      ) : (
                        <span className="sin-respuesta">En espera de respuesta</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-estado-consulta ${item.estado === 'Respondida' ? 'respondida' : 'pendiente'}`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="consulta-fecha">{formatearFecha(item.fecha)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
};
