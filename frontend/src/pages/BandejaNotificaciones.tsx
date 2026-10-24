// -------------------Módulo de Bandeja de Notificaciones-------------
// Centro de avisos, alertas financieras y confirmaciones de pago
// Plataforma: Portal de Autoservicio Institucional (UTFSM)
// -------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import '../styles/bandejaNotificaciones.css';

// ---------------------Interfaces-----------------------------------
// Definición de las propiedades recibidas y modelo de notificación
// -------------------------------------------------------------------
interface BandejaNotificacionesProps {
  userId?: number;
  user?: {
    id: number;
    nombre: string;
    perfil: string;
  };
  setVista?: (v: string) => void;
}

interface NotificacionItem {
  id: number;
  id_usuario: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fecha: string;
}

// ------------------Componente React-------------------
//   BandejaNotificaciones:
//       Despliega el listado estructurado de avisos y alertas
//       del estudiante y permite marcar notificaciones como leídas.
// ---------------------Props---------------------------
//   @param {BandejaNotificacionesProps} props - ID de usuario y callback de vista.
// ------------------Retorno----------------------------
//   @returns {JSX.Element} Vista de la bandeja de notificaciones.
// -----------------------------------------------------
export const BandejaNotificaciones = ({ userId, user, setVista }: BandejaNotificacionesProps) => {
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  // Obtener identificador del usuario activo
  const usuarioSesion = localStorage.getItem('user');
  const usuarioParseado = usuarioSesion ? JSON.parse(usuarioSesion) : null;
  const idEstudiante = userId || user?.id || usuarioParseado?.id || 1;
  const tipoPerfil = usuarioParseado?.perfil || 'Estudiante Regular';

  // -------------------Función----------------------
  //   cargarNotificaciones:
  //       Consulta a la API REST institucional las alertas
  //       asociadas al estudiante actualmente autenticado.
  // ------------------Parámetros-------------------
  //   Ninguno.
  // ------------------Retorno-----------------------
  //   @returns {void}
  // -----------------------------------------------
  const cargarNotificaciones = (): void => {
    fetch(`http://localhost:3000/api/notificaciones/${idEstudiante}`)
      .then((res) => res.json())
      .then((datos) => {
        if (Array.isArray(datos)) {
          setNotificaciones(datos);
        }
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error cargando notificaciones:', err);
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarNotificaciones();
  }, [idEstudiante]);

  // -------------------Función----------------------
  //   handleMarcarLeida:
  //       Actualiza el estado de la notificación a leída
  //       en el servidor y refresca la vista del alumno.
  // ------------------Parámetros-------------------
  //   @param {number} id - Identificador de la notificación.
  // ------------------Retorno-----------------------
  //   @returns {Promise<void>}
  // -----------------------------------------------
  const handleMarcarLeida = async (id: number): Promise<void> => {
    try {
      const respuesta = await fetch(`http://localhost:3000/api/notificaciones/leer/${id}`, {
        method: 'PUT',
      });
      if (respuesta.ok) {
        setNotificaciones((prev) =>
          prev.map((item) => (item.id === id ? { ...item, leida: true } : item))
        );
      }
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err);
    }
  };

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
        <main className="main-content notificaciones-main">
          <div className="loading-container">
            <div className="loader-spinner"></div>
            <p>Cargando notificaciones...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="layout-principal">
      <Header setVista={setVista || (() => {})} perfil={tipoPerfil} />

      <main className="main-content notificaciones-main">
        <section className="notificaciones-header">
          <h2>Bandeja de Notificaciones</h2>
          <p>Revisa tus alertas académicas, confirmaciones de pagos y avisos de beneficios.</p>
        </section>

        {/* Verificación Caso de Prueba CP-9: Mostrar "Bandeja Vacía" cuando no hay registros */}
        {notificaciones.length === 0 ? (
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
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <h3>Bandeja Vacía</h3>
            <p>No tienes notificaciones registradas en tu historial.</p>
          </section>
        ) : (
          /* Verificación Caso de Prueba CP-10: Despliegue de tabla estructurada con alertas */
          <section className="tabla-notificaciones-container">
            <table className="tabla-notificaciones">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Título</th>
                  <th>Mensaje</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {notificaciones.map((notif) => (
                  <tr key={notif.id} className={notif.leida ? 'fila-leida' : 'fila-no-leida'}>
                    <td className="notif-fecha">{formatearFecha(notif.fecha)}</td>
                    <td className="texto-tipo">{notif.tipo}</td>
                    <td className="notif-titulo">{notif.titulo}</td>
                    <td className="notif-mensaje">{notif.mensaje}</td>
                    <td>
                      <span className={`badge-estado ${notif.leida ? 'leida' : 'no-leida'}`}>
                        {notif.leida ? 'Leída' : 'No leída'}
                      </span>
                    </td>
                    <td>
                      {!notif.leida && (
                        <button
                          className="btn-marcar-leida"
                          onClick={() => handleMarcarLeida(notif.id)}
                        >
                          Marcar leída
                        </button>
                      )}
                    </td>
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
