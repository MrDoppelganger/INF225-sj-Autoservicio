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

        {/* Separador Visual (Estilos movidos al CSS) */}
        <hr className="section-divider" />
        
        <PerfilBancario userId={userId} />

      </main>
    </div>
  );
};