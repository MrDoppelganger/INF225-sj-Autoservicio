import { useState, useEffect } from 'react';
import { Header } from '../components/Header';

export const InformacionPersonal = ({ userId, setVista }: { userId: number, setVista: (v: string) => void }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/usuario/info/${userId}`)
      .then(res => res.json())
      .then(setUser);
  }, [userId]);

  if (!user) return <p>Cargando información...</p>;

  return (
    <div className="modulo-contenedor">
      <Header setVista={setVista} perfil={user.perfil} />
      
      <main className="contenido-central">
        <h2>Desglose de Información Personal</h2>
        <section className="ficha-usuario">
          <div className="dato-item"><span>Nombre Completo:</span> <p>{user.nombre || 'Cargando...'}</p></div>
          <div className="dato-item"><span>RUT:</span> <p>{user.rut}</p></div>
          <div className="dato-item"><span>Situación Académica:</span> <p>{user.perfil}</p></div>
          <div className="dato-item"><span>Correo Institucional:</span> <p>{user.email}</p></div>
          <div className="dato-item"><span>Teléfono:</span> <p>{user.telefono}</p></div>
          <div className="dato-item"><span>Dirección Particular:</span> <p>{user.direccion}</p></div>
        </section>
      </main>
    </div>
  );
};