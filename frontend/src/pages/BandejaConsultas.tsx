import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../config';
import { Header } from '../components/Header';
import '../styles/bandejaConsultas.css';

interface BandejaConsultasProps {
  user: { id: number; nombre: string; perfil: string; soporte_token?: string };
  setVista?: (v: string) => void;
}
interface Consulta {
  id: number;
  fecha: string;
  asunto: string;
  mensaje: string;
  nombre: string;
  correo_institucional: string;
  estado: string;
  respuesta: string | null;
}
const API = `${API_BASE_URL}/api/admin/consultas`;
interface PerfilRemitente {
  nombre: string;
  rut: string;
  email: string;
  carrera: string | null;
  situacion_academica: string | null;
  perfil: string;
}

export const BandejaConsultas = ({ user, setVista }: BandejaConsultasProps) => {
  const dialogoPerfil = useRef<HTMLDialogElement>(null);
  const solicitudPerfil = useRef<AbortController | null>(null);
  const [perfilRemitente, setPerfilRemitente] = useState<PerfilRemitente | null>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState('');
  const [ticketPerfil, setTicketPerfil] = useState<number | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [filtro, setFiltro] = useState('Pendientes');
  const [errorRespuesta, setErrorRespuesta] = useState('');
  const campoRespuesta = useRef<HTMLTextAreaElement>(null);
  const [idAtendiendo, setIdAtendiendo] = useState<number | null>(null);
  const [respuestaAdmin, setRespuestaAdmin] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => () => solicitudPerfil.current?.abort(), []);

  const abrirPerfil = async (ticket: Consulta) => {
    solicitudPerfil.current?.abort();
    const controller = new AbortController();
    solicitudPerfil.current = controller;
    setPerfilRemitente(null);
    setErrorPerfil('');
    setCargandoPerfil(true);
    setTicketPerfil(ticket.id);
    dialogoPerfil.current?.showModal();
    try {
      if (!user.soporte_token) throw new Error('Cierra sesión y vuelve a ingresar para consultar el perfil.');
      const res = await fetch(`${API}/${ticket.id}/remitente`, {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${user.soporte_token}` },
      });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error || 'No se pudo cargar el perfil.');
      if (!controller.signal.aborted) setPerfilRemitente(datos);
    } catch (err) {
      if (!controller.signal.aborted) setErrorPerfil(err instanceof Error ? err.message : 'Error de conexión.');
    } finally {
      if (!controller.signal.aborted) setCargandoPerfil(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetch(API, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('No se pudo cargar la bandeja.');
        return res.json();
      })
      .then(setConsultas)
      .catch((err: Error) => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const enviarRespuesta = async (item: Consulta) => {
    if (enviando) return;
    if (!respuestaAdmin.trim()) {
      setErrorRespuesta('Escribe una respuesta. No se permite enviar solo espacios.');
      campoRespuesta.current?.focus();
      return;
    }
    setEnviando(true);
    setErrorRespuesta('');
    setError('');
    setAviso('');
    try {
      const res = await fetch(`${API}/responder/${item.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuesta: respuestaAdmin.trim(), correo_alumno: item.correo_institucional }),
      });
      if (!res.ok) {
        const datos = await res.json();
        throw new Error(datos.error || 'No se pudo guardar la respuesta.');
      }
      setConsultas((prev) => prev.map((c) => c.id === item.id
        ? { ...c, estado: 'Respondida', respuesta: respuestaAdmin.trim() } : c));
      setIdAtendiendo(null);
      setRespuestaAdmin('');
      setAviso(`Respuesta del ticket #${item.id} guardada. Puedes revisarla en Respondidas y el alumno puede consultarla en su historial.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión.');
    } finally { setEnviando(false); }
  };

  const visibles = consultas.filter((c) => filtro === 'Todas'
    || c.estado === (filtro === 'Pendientes' ? 'Pendiente' : 'Respondida'));
  return (
    <div className="layout-principal">
      <Header setVista={setVista || (() => {})} perfil="Administrador" />
      <main className="main-content bandeja-soporte">
        <h2>Bandeja Centralizada de Soporte</h2>
        <p>Consulta todos los tickets y atiende los pendientes, más antiguos primero.</p>
        <div role="group" aria-label="Filtrar tickets" style={{ display: 'flex', gap: 12, margin: '20px 0' }}>
          {['Todas', 'Pendientes', 'Respondidas'].map((opcion) => (
            <button key={opcion} aria-pressed={filtro === opcion} disabled={enviando}
              onClick={() => { setFiltro(opcion); setIdAtendiendo(null); setRespuestaAdmin(''); setError(''); setErrorRespuesta(''); }}>
              {opcion}
            </button>
          ))}
        </div>
        {error && <p role="alert">{error}</p>}
        {aviso && <p role="status">{aviso}</p>}
        {loading ? <p>Cargando bandeja...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead><tr>
                {['Ticket', 'Fecha', 'Alumno', 'Correo', 'Asunto', 'Mensaje', 'Estado', 'Respuesta / acciones'].map((titulo) => <th key={titulo} style={{ padding: 12 }}>{titulo}</th>)}
              </tr></thead>
              <tbody>{visibles.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td>#{item.id}</td>
                  <td>{new Date(item.fecha).toLocaleString('es-CL')}</td>
                  <td><button className="ticket-ver-perfil" onClick={() => abrirPerfil(item)} aria-haspopup="dialog">{item.nombre}<span className="ticket-sr-only">: ver perfil del remitente del ticket #{item.id}</span></button></td><td>{item.correo_institucional}</td>
                  <td className="ticket-asunto">{item.asunto}</td>
                  <td>
                    <details className="ticket-desplegable">
                      <summary>Ver mensaje<span className="ticket-sr-only"> del ticket #{item.id}</span></summary>
                      <div className="ticket-texto">{item.mensaje}</div>
                    </details>
                  </td>
                  <td className="ticket-estado">{item.estado}</td>
                  <td style={{ padding: 12 }}>
                    {item.estado === 'Respondida' ? (
                      <details className="ticket-desplegable">
                        <summary>Ver respuesta<span className="ticket-sr-only"> del ticket #{item.id}</span></summary>
                        <div className="ticket-texto">{item.respuesta || 'Sin respuesta registrada.'}</div>
                      </details>
                    ) : idAtendiendo === item.id ? (
                      <div>
                        <label htmlFor={`respuesta-${item.id}`}>Respuesta al ticket #{item.id}</label>
                        <textarea ref={campoRespuesta} id={`respuesta-${item.id}`} rows={4} value={respuestaAdmin}
                          aria-invalid={!!errorRespuesta}
                          aria-describedby={errorRespuesta ? `error-respuesta-${item.id}` : undefined}
                          disabled={enviando} onChange={(e) => {
                            setRespuestaAdmin(e.target.value);
                            if (e.target.value.trim()) setErrorRespuesta('');
                          }} />
                        {errorRespuesta && <p className="respuesta-error" role="alert" id={`error-respuesta-${item.id}`}>{errorRespuesta}</p>}
                        <button disabled={enviando} onClick={() => enviarRespuesta(item)}>{enviando ? 'Enviando...' : 'Enviar'}</button>
                        <button disabled={enviando} onClick={() => { setIdAtendiendo(null); setRespuestaAdmin(''); setError(''); setErrorRespuesta(''); }}>Cancelar</button>
                      </div>
                    ) : <button disabled={enviando} onClick={() => { setIdAtendiendo(item.id); setRespuestaAdmin(''); setError(''); setErrorRespuesta(''); setAviso(''); }}>Atender</button>}
                  </td>
                </tr>
              ))}{visibles.length === 0 && <tr><td colSpan={8}>{filtro === 'Pendientes' ? 'No hay consultas pendientes. Puedes revisar el historial en Todas o Respondidas.' : 'No hay tickets para este filtro.'}</td></tr>}</tbody>
            </table>
          </div>
        )}
        <dialog className="ticket-perfil-dialogo" ref={dialogoPerfil} aria-labelledby="titulo-perfil-remitente"
          onClose={() => { solicitudPerfil.current?.abort(); }}>
          <h2 id="titulo-perfil-remitente">Perfil del remitente</h2>
          <p>Ticket #{ticketPerfil}</p>
          {cargandoPerfil && <p role="status">Cargando perfil...</p>}
          {errorPerfil && <p role="alert">{errorPerfil}</p>}
          {perfilRemitente && <dl>
            {[
              ['Nombre', perfilRemitente.nombre], ['RUT', perfilRemitente.rut],
              ['Correo institucional', perfilRemitente.email], ['Carrera', perfilRemitente.carrera],
              ['Situación académica', perfilRemitente.situacion_academica], ['Tipo de usuario', perfilRemitente.perfil],
            ].map(([etiqueta, valor]) => <div key={etiqueta}><dt>{etiqueta}</dt><dd>{valor || 'No registrado'}</dd></div>)}
          </dl>}
          <button autoFocus onClick={() => dialogoPerfil.current?.close()}>Cerrar</button>
        </dialog>
      </main>
    </div>
  );
};
