import { useState, useEffect } from 'react';
import { Header } from '../components/Header';

export const PerfilBancario = ({ userId, setVista }: { userId: number, setVista: (v: string) => void }) => {
  const [datos, setDatos] = useState({ banco: '', tipo_cuenta: '', numero_cuenta: '', rut_titular: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [_, setMensaje] = useState({ texto: '', tipo: '' });

  const cargarDatos = () => {
    fetch(`http://localhost:3000/api/perfil/bancario/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.numero_cuenta) {
          setDatos(data);
          setHasData(true);
        }
      });
  };

  useEffect(() => { cargarDatos(); }, [userId]);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:3000/api/perfil/bancario/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (res.ok) {
      setMensaje({ texto: 'Datos actualizados.', tipo: 'exito' });
      setIsModalOpen(false);
      setHasData(true);
      cargarDatos();
    }
  };

  const perfilGuardado = localStorage.getItem('user');
  const tipoPerfil = perfilGuardado ? JSON.parse(perfilGuardado).perfil : '';

  return (
    <div className="modulo-contenedor">
      <Header setVista={setVista} perfil={tipoPerfil} />

      <section className="modulo-perfil">
        <header className="header-seccion">
          <h2>Información Personal Bancaria</h2>
        </header>

        {hasData ? (
          <article className="estado-cuenta-configurada">
            <div className="status-badge success">Cuenta Bancaria Registrada</div>
            <div className="detalles-lectura">
              <p><strong>Banco:</strong> {datos.banco}</p>
              <p><strong>Tipo:</strong> {datos.tipo_cuenta}</p>
              <p><strong>N° Cuenta:</strong> ****{datos.numero_cuenta.slice(-4)}</p>
            </div>
            <button className="edit-trigger" onClick={() => setIsModalOpen(true)}>
              Modificar Datos Bancarios
            </button>
          </article>
        ) : (
          <article className="estado-cuenta-vacia">
            <p>No se han registrado datos para devoluciones.</p>
            <button className="create-trigger" onClick={() => setIsModalOpen(true)}>
              Configurar Cuenta Ahora
            </button>
          </article>
        )}

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container">
              <h3>Actualizar Información Bancaria</h3>
              <form onSubmit={handleGuardar}>
                <div className="form-group">
                  <label>Banco:</label>
                  <input type="text" value={datos.banco} onChange={e => setDatos({...datos, banco: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Tipo de Cuenta:</label>
                  <input type="text" value={datos.tipo_cuenta} onChange={e => setDatos({...datos, tipo_cuenta: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Número de Cuenta:</label>
                  <input type="text" value={datos.numero_cuenta} onChange={e => setDatos({...datos, numero_cuenta: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>RUT Titular:</label>
                  <input type="text" value={datos.rut_titular} onChange={e => setDatos({...datos, rut_titular: e.target.value})} required />
                </div>
                <footer className="modal-actions">
                  <button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit">Guardar Cambios</button>
                </footer>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};