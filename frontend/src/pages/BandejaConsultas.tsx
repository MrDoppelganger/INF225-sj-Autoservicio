// -------------------Módulo de Bandeja de Consultas------------------
// Panel administrativo para priorizar y responder solicitudes
// Plataforma: Portal de Autoservicio Institucional (UTFSM)
// -------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Header } from '../components/Header';

// ---------------------Interfaces-----------------------------------
// Definición de las propiedades recibidas y modelo de consulta
// -------------------------------------------------------------------
interface BandejaConsultasProps {
  user: {
    id: number;
    nombre: string;
    perfil: string;
  };
  setVista?: (v: string) => void;
}

interface ConsultaPendiente {
  id: number;
  fecha: string;
  asunto: string;
  mensaje: string;
  nombre: string;
  correo_institucional: string;
}

// ------------------Componente React-------------------
//   BandejaConsultas:
//       Despliega la bandeja centralizada de tickets pendientes,
//       permitiendo al administrador responder y notificar al alumno.
// ---------------------Props---------------------------
//   @param {BandejaConsultasProps} props - Usuario activo y setVista.
// ------------------Retorno----------------------------
//   @returns {JSX.Element} Vista del panel de administración.
// -----------------------------------------------------
export const BandejaConsultas = ({ setVista }: BandejaConsultasProps) => {
  const [consultas, setConsultas] = useState<ConsultaPendiente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [idAtendiendo, setIdAtendiendo] = useState<number | null>(null);
  const [respuestaAdmin, setRespuestaAdmin] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:3000/api/admin/consultas/pendientes')
      .then((res) => res.json())
      .then((datos) => {
        setConsultas(datos);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando bandeja:', err);
        setLoading(false);
      });
  }, []);

  // -------------------Función----------------------
  //   enviarRespuesta:
  //       Envía la respuesta redactada a la API, actualiza el
  //       estado de la consulta y la remueve de la bandeja activa.
  // ------------------Parámetros-------------------
  //   @param {number} id - Identificador de la consulta.
  //   @param {string} correo - Correo institucional del alumno.
  // ------------------Retorno-----------------------
  //   @returns {Promise<void>}
  // -----------------------------------------------
  const enviarRespuesta = async (id: number, correo: string): Promise<void> => {
    if (!respuestaAdmin.trim()) return alert('La respuesta no puede estar vacía.');

    const respuesta = await fetch(`http://localhost:3000/api/admin/consultas/responder/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respuesta: respuestaAdmin, correo_alumno: correo }),
    });

    if (respuesta.ok) {
      alert('Respuesta enviada y alumno notificado por correo automático.');
      setConsultas(consultas.filter((c) => c.id !== id));
      setIdAtendiendo(null);
      setRespuestaAdmin('');
    } else {
      alert('Error al intentar responder la consulta.');
    }
  };

  // -------------------Función----------------------
  //   formatearFecha:
  //       Formatea la marca de tiempo a convención chilena.
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

  return (
    <div className="layout-principal">
      <Header setVista={setVista || (() => {})} perfil="Administrador" />
      <main className="main-content">
        <h2>Bandeja Centralizada de Soporte</h2>
        <p>Priorización de solicitudes pendientes (Más antiguas primero).</p>

        {loading ? (
          <div className="loader" style={{ marginTop: '20px' }}>Cargando bandeja centralizada...</div>
        ) : (
          <section className="consultas-container" style={{ marginTop: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#003B70', color: 'white' }}>
                  <th style={{ padding: '12px' }}>Fecha</th>
                  <th style={{ padding: '12px' }}>Alumno</th>
                  <th style={{ padding: '12px' }}>Correo</th>
                  <th style={{ padding: '12px' }}>Asunto</th>
                  <th style={{ padding: '12px' }}>Mensaje</th>
                  <th style={{ padding: '12px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {consultas.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                      {formatearFecha(item.fecha)}
                    </td>
                    <td style={{ padding: '12px' }}>{item.nombre}</td>
                    <td style={{ padding: '12px', color: '#003B70' }}>{item.correo_institucional}</td>
                    <td style={{ padding: '12px', fontStyle: 'italic' }}>{item.asunto}</td>
                    <td style={{ padding: '12px', maxWidth: '300px', wordBreak: 'break-word' }}>
                      {item.mensaje}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {idAtendiendo === item.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <textarea 
                            rows={3} 
                            placeholder="Escribe la solución..."
                            value={respuestaAdmin}
                            onChange={(e) => setRespuestaAdmin(e.target.value)}
                            style={{ padding: '5px', width: '100%' }}
                          />
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
                              style={{
                                flex: 1,
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }} 
                              onClick={() => enviarRespuesta(item.id, item.correo_institucional)}
                            >
                              Enviar
                            </button>
                            <button 
                              style={{
                                flex: 1,
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }} 
                              onClick={() => {
                                setIdAtendiendo(null);
                                setRespuestaAdmin('');
                              }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIdAtendiendo(item.id)}
                          style={{
                            backgroundColor: '#ffc107',
                            color: 'black',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: '100%',
                          }}
                        >
                          Atender
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {consultas.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#777' }}>
                      🎉 ¡Impecable! No registras consultas pendientes en la bandeja central.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
};
