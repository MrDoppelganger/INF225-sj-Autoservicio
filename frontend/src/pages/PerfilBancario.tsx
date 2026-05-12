import { useState, useEffect } from 'react';

export const PerfilBancario = ({ userId }: { userId: number }) => {
  const [datos, setDatos] = useState({ banco: '', tipo_cuenta: '', numero_cuenta: '', rut_titular: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

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
    setMensaje({ texto: '', tipo: '' });

    const res = await fetch(`http://localhost:3000/api/perfil/bancario/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    if (res.ok) {
      setMensaje({ texto: 'Información bancaria actualizada con éxito.', tipo: 'exito' });
      setIsModalOpen(false);
      setHasData(true);
      cargarDatos();
    } else {
      setMensaje({ texto: 'Error al actualizar los datos.', tipo: 'error' });
    }
  };

  return (
    <section className="modulo-perfil-bancario">
      <div className="bancario-header">
        <h3>Información Bancaria</h3>
        <p className="bancario-subtitle">Gestiona tu cuenta para devoluciones institucionales.</p>
      </div>

      {mensaje.texto && (
        <div className={`alerta alerta-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

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
  );
};