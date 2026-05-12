import { useState, useEffect } from 'react';

export const PerfilBancario = ({ userId }: { userId: number }) => {
  const [datos, setDatos] = useState({ banco: '', tipo_cuenta: '', numero_cuenta: '', rut_titular: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [erroresDinamicos, setErroresDinamicos] = useState({ numero_cuenta: '', rut_titular: '' });

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

  const handleNumeroCuentaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setDatos({ ...datos, numero_cuenta: valor });

    // Busca cualquier carácter que NO sea un número del 0 al 9
    const caracterInvalido = valor.match(/[^0-9]/);
    
    if (caracterInvalido) {
      setErroresDinamicos(prev => ({ 
        ...prev, 
        numero_cuenta: `El carácter "${caracterInvalido[0]}" es inválido. Solo se permiten números.` 
      }));
    } else {
      setErroresDinamicos(prev => ({ ...prev, numero_cuenta: '' }));
    }
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setDatos({ ...datos, rut_titular: valor });
    const caracterInvalido = valor.match(/[^0-9kK\-]/);
    
    if (caracterInvalido) {
      if (caracterInvalido[0] === '.') {
        setErroresDinamicos(prev => ({ 
          ...prev, 
          rut_titular: `El carácter "." es inválido. El formato debe ser sin puntos y con guion.` 
        }));
      } else {
        setErroresDinamicos(prev => ({ 
          ...prev, 
          rut_titular: `El carácter "${caracterInvalido[0]}" no está permitido en un RUT.` 
        }));
      }
    } else if ((valor.match(/-/g) || []).length > 1) {
      setErroresDinamicos(prev => ({ 
        ...prev, 
        rut_titular: `Solo puedes ingresar un guion.` 
      }));
    } else {
      setErroresDinamicos(prev => ({ ...prev, rut_titular: '' }));
    }
  };

  const validarFormularioFinal = () => {
    if (erroresDinamicos.numero_cuenta || erroresDinamicos.rut_titular) {
      setMensaje({ texto: 'Por favor, corrige los caracteres en rojo antes de guardar.', tipo: 'error' });
      return false;
    }
    if (datos.numero_cuenta.length < 8) {
      setMensaje({ texto: 'Error: El número de cuenta debe tener al menos 8 dígitos.', tipo: 'error' });
      return false;
    }
    if (!datos.rut_titular.includes('-')) {
      setMensaje({ texto: 'Error: El RUT debe contener un guion separador.', tipo: 'error' });
      return false;
    }
    if (!datos.banco || !datos.tipo_cuenta) {
      setMensaje({ texto: 'Error: Debes seleccionar el banco y el tipo de cuenta.', tipo: 'error' });
      return false;
    }
    return true;
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    if (!validarFormularioFinal()) return; 

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
      setMensaje({ texto: 'Error de servidor al actualizar los datos.', tipo: 'error' });
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
            <form onSubmit={handleGuardar} className="bancario-form">
              
              <div className="form-group">
                <label>Banco Institucional:</label>
                <select 
                  value={datos.banco} 
                  onChange={e => setDatos({...datos, banco: e.target.value})} 
                  required
                >
                  <option value="" disabled>Seleccione un Banco...</option>
                  <option value="Banco Santander">Banco Santander</option>
                  <option value="Banco de Chile">Banco de Chile</option>
                  <option value="Banco Estado">Banco Estado</option>
                  <option value="BCI">BCI</option>
                  <option value="Itaú">Itaú</option>
                  <option value="Scotiabank">Scotiabank</option>
                  <option value="Banco Falabella">Banco Falabella</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tipo de Cuenta:</label>
                <select 
                  value={datos.tipo_cuenta} 
                  onChange={e => setDatos({...datos, tipo_cuenta: e.target.value})} 
                  required
                >
                  <option value="" disabled>Seleccione tipo de cuenta...</option>
                  <option value="Cuenta Corriente">Cuenta Corriente</option>
                  <option value="Cuenta Vista">Cuenta Vista</option>
                  <option value="Cuenta RUT">Cuenta RUT</option>
                  <option value="Cuenta de Ahorro">Cuenta de Ahorro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Número de Cuenta:</label>
                <input 
                  type="text" 
                  value={datos.numero_cuenta} 
                  onChange={handleNumeroCuentaChange} 
                  required 
                />
               
                {erroresDinamicos.numero_cuenta && (
                  <span className="error-dinamico" style={{ color: 'red', fontSize: '0.85rem' }}>
                    {erroresDinamicos.numero_cuenta}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>RUT Titular (Sin puntos y con guion):</label>
                <input 
                  type="text" 
                  value={datos.rut_titular} 
                  onChange={handleRutChange} 
                  placeholder="Ej: 12345678-9"
                  required 
                />
                
                {erroresDinamicos.rut_titular && (
                  <span className="error-dinamico" style={{ color: 'red', fontSize: '0.85rem' }}>
                    {erroresDinamicos.rut_titular}
                  </span>
                )}
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