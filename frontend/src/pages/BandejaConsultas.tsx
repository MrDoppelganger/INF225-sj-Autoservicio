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

  // Carga automática de consultas al montar la vista
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/consultas/pendientes')
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

  const formatearFecha = (fechaStr: string) => {
    return new Date(fechaStr).toLocaleString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="layout-principal">
      {/* Reutilizamos tu componente Header indicando perfil Administrador */}
      <Header setVista={() => setVista?.('landing')} perfil="Administrador" />

      <main className="main-content" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <section className="modulo-header" style={{ marginBottom: '20px' }}>
          <h2>Bandeja Centralizada de Gestión</h2>
          <p style={{ color: '#666' }}>Listado de solicitudes de alumnos pendientes de atención administrativa.</p>
        </section>

        {loading ? (
          <p>Cargando consultas pendientes...</p>
        ) : (
          <section className="tabla-contenedor">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr style={{ backgroundColor: '#003B70', color: 'white' }}>
                  <th style={{ padding: '12px' }}>Fecha Entrada</th>
                  <th style={{ padding: '12px' }}>Usuario Solicitante</th>
                  <th style={{ padding: '12px' }}>Correo Institucional</th>
                  <th style={{ padding: '12px' }}>Asunto</th>
                  <th style={{ padding: '12px' }}>Mensaje Académico</th>
                  <th style={{ padding: '12px' }}>Acción</th>
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
                      <button 
                        onClick={() => alert(`Abriendo editor para responder a: ${item.correo_institucional}`)}
                        style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Atender
                      </button>
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
