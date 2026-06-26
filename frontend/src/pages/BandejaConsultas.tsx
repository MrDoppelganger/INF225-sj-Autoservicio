import { useEffect, useState } from 'react';
import { Header } from '../components/Header';

interface ConsultaPendiente {
  id: number;
  fecha: string;
  asunto: string;
  mensaje: string;
  nombre: string;
  correo_institucional: string;
}

export const BandejaConsultas = ({ user, setVista }: { user: any; setVista?: (v: string) => void }) => {
  const [consultas, setConsultas] = useState<ConsultaPendiente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [idAtendiendo, setIdAtendiendo] = useState<number | null>(null);
  const [respuestaAdmin, setRespuestaAdmin] = useState<string>('');

  // Carga automática de consultas al montar la vista
  useEffect(() => {
    fetch('http://localhost:3000/api/admin/consultas/pendientes')
      .then((res) => res.json())
      .then((data) => {
        setConsultas(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando bandeja:", err);
        setLoading(false);
      });
  }, []);

  const enviarRespuesta = async (id: number, correo: string) => {
    if (!respuestaAdmin.trim()) return alert("La respuesta no puede estar vacía.");

    const res = await fetch(`http://localhost:3000/api/admin/consultas/responder/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respuesta: respuestaAdmin, correo_alumno: correo })
    });

    if (res.ok) {
      alert("Respuesta enviada y alumno notificado por correo automático.");
      // Filtramos la consulta para que desaparezca de la bandeja inmediatamente (CA3)
      setConsultas(consultas.filter(c => c.id !== id));
      setIdAtendiendo(null);
      setRespuestaAdmin('');
    } else {
      alert("Error al intentar responder la consulta.");
    }
  };

  const formatearFecha = (fechaStr: string) => {
    return new Date(fechaStr).toLocaleString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
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
                    <td style={{ padding: '12px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{formatearFecha(item.fecha)}</td>
                    <td style={{ padding: '12px' }}>{item.nombre}</td>
                    <td style={{ padding: '12px', color: '#003B70' }}>{item.correo_institucional}</td>
                    <td style={{ padding: '12px', fontStyle: 'italic' }}>{item.asunto}</td>
                    <td style={{ padding: '12px', maxWidth: '300px', wordBreak: 'break-word' }}>{item.mensaje}</td>
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
                            <button style={{ flex: 1, backgroundColor: '#28a745', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => enviarRespuesta(item.id, item.correo_institucional)}>Enviar</button>
                            <button style={{ flex: 1, backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => { setIdAtendiendo(null); setRespuestaAdmin(''); }}>Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIdAtendiendo(item.id)}
                          style={{ backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
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