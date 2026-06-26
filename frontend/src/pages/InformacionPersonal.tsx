import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { PerfilBancario } from './PerfilBancario';
import '../styles/informacionPersonal.css';

export const InformacionPersonal = ({ userId, setVista }: { userId: number, setVista: (v: string) => void }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/usuario/info/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error("Error al cargar perfil:", err));
  }, [userId]);

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loader-spinner"></div>
        <p>Cargando información institucional...</p>
      </div>
    );
  }

  return (
    <div className="layout-principal">
      <Header setVista={setVista} perfil={user.perfil} />
      
      <main className="main-content">
        <section className="profile-header">
          <h2>Mi Perfil Académico</h2>
          <p>Consulta tus datos de contacto y situación académica actual.</p>
        </section>

        <section className="profile-data-grid">
          {/* Bloque Académico */}
          <div className="data-field"><span className="label">Nombre Completo</span><p className="value">{user.nombre}</p></div>
          <div className="data-field"><span className="label">RUT</span><p className="value">{user.rut}</p></div>
          <div className="data-field"><span className="label">Carrera</span><p className="value highlight">{user.carrera}</p></div>
          <div className="data-field"><span className="label">Situación Académica</span><p className="value"><span className="status-tag">{user.situacion_academica}</span></p></div>

          {/* Bloque Contacto */}
          <div className="data-field"><span className="label">Correo Institucional</span><p className="value">{user.email}</p></div>
          <div className="data-field"><span className="label">Correo Personal</span><p className="value">{user.email_personal || 'No registrado'}</p></div>
          <div className="data-field"><span className="label">Correo Apoderado</span><p className="value">{user.email_apoderado || 'No registrado'}</p></div>
          <div className="data-field"><span className="label">Teléfono</span><p className="value">{user.telefono}</p></div>
          <div className="data-field full-width"><span className="label">Dirección Particular</span><p className="value">{user.direccion}</p></div>
        </section>

        <hr className="section-divider" />
        
        <PerfilBancario userId={userId} />

        {/* --- NUEVA SECCIÓN: CENTRO DE SOPORTE (Alumno) --- */}
        <hr className="section-divider" />
        <section className="profile-support" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <h3>Centro de Soporte y Ayuda</h3>
          <p>¿Tienes problemas con tus pagos, beneficios académicos o certificados?</p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
            <button 
              onClick={() => {
                const asunto = prompt("Ingresa el Asunto de tu consulta:");
                const mensaje = prompt("Describe detalladamente tu inconveniente:");
                
                if (asunto && mensaje) {
                  fetch('http://localhost:3000/api/consultas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_usuario: userId, asunto, mensaje })
                  })
                  .then(res => res.json())
                  .then(data => {
                    alert(` Solicitud Ticket #${data.id_consulta} recibida con éxito.\n\nTiempo estimado de respuesta: Máximo 7 días hábiles.`);
                  });
                }
              }}
              style={{ background: '#003B70', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              + Nueva Consulta
            </button>

            <button 
              onClick={() => {
                fetch(`http://localhost:3000/api/consultas/${userId}`)
                .then(res => res.json())
                .then(data => {
                  let textoHistorial = "TUS CONSULTAS REALIZADAS:\n\n";
                  data.forEach((c: any) => {
                    textoHistorial += `ID: #${c.id} | Fecha: ${new Date(c.fecha).toLocaleDateString()}\n`;
                    textoHistorial += `Asunto: ${c.asunto}\n`;
                    textoHistorial += `Estado: ${c.estado}\n`;
                    if(c.respuesta) textoHistorial += `Respuesta: ${c.respuesta}\n`;
                    textoHistorial += `--------------------------\n`;
                  });
                  alert(data.length > 0 ? textoHistorial : "No tienes consultas registradas.");
                });
              }}
              style={{ background: '#6c757d', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Ver Mis Consultas
            </button>
          </div>
        </section>

      </main>
    </div>
  );
};