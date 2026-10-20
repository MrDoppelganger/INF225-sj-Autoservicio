// -------------------Módulo de Perfil Bancario----------------------
// Gestión y actualización de la cuenta bancaria del estudiante
// Plataforma: Portal de Autoservicio Institucional (UTFSM)
// -------------------------------------------------------------------

import { useState, useEffect } from 'react';
import '../styles/perfilBancario.css';

// ---------------------Interfaces-----------------------------------
// Definición de las propiedades recibidas por el componente bancario
// -------------------------------------------------------------------
interface PerfilBancarioProps {
  userId: number;
}

interface DatosBancarios {
  banco: string;
  tipo_cuenta: string;
  numero_cuenta: string;
  rut_titular: string;
}

interface MensajeEstado {
  texto: string;
  tipo: string;
}

interface ErroresDinamicos {
  numero_cuenta: string;
  rut_titular: string;
}

// ------------------Componente React-------------------
//   PerfilBancario:
//       Despliega el estado de la cuenta bancaria inscrita y
//       permite actualizarla mediante una ventana modal interactiva.
// ---------------------Props---------------------------
//   @param {PerfilBancarioProps} props - ID del estudiante.
// ------------------Retorno----------------------------
//   @returns {JSX.Element} Sección visual de información bancaria.
// -----------------------------------------------------
export const PerfilBancario = ({ userId }: PerfilBancarioProps) => {
  const [datos, setDatos] = useState<DatosBancarios>({
    banco: '',
    tipo_cuenta: '',
    numero_cuenta: '',
    rut_titular: '',
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [hasData, setHasData] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<MensajeEstado>({ texto: '', tipo: '' });
  const [erroresDinamicos, setErroresDinamicos] = useState<ErroresDinamicos>({
    numero_cuenta: '',
    rut_titular: '',
  });

  // -------------------Función----------------------
  //   cargarDatos:
  //       Consulta la API REST para verificar si el estudiante
  //       tiene datos bancarios guardados previamente.
  // ------------------Parámetros-------------------
  //   Ninguno.
  // ------------------Retorno-----------------------
  //   @returns {void}
  // -----------------------------------------------
  const cargarDatos = (): void => {
    fetch(`http://localhost:3000/api/perfil/bancario/${userId}`)
      .then((res) => res.json())
      .then((datosRecibidos) => {
        if (datosRecibidos && datosRecibidos.numero_cuenta) {
          setDatos(datosRecibidos);
          setHasData(true);
        }
      });
  };

  useEffect(() => {
    cargarDatos();
  }, [userId]);

  // -------------------Función----------------------
  //   handleNumeroCuentaChange:
  //       Valida en tiempo real que solo se ingresen números
  //       en el campo de número de cuenta bancaria.
  // ------------------Parámetros-------------------
  //   @param {React.ChangeEvent<HTMLInputElement>} e - Evento input.
  // ------------------Retorno-----------------------
  //   @returns {void}
  // -----------------------------------------------
  const handleNumeroCuentaChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const valor = e.target.value;
    setDatos({ ...datos, numero_cuenta: valor });

    const caracterInvalido = valor.match(/[^0-9]/);
    if (caracterInvalido) {
      setErroresDinamicos((prev) => ({ 
        ...prev, 
        numero_cuenta: `El carácter "${caracterInvalido[0]}" es inválido. Solo se permiten números.`,
      }));
    } else {
      setErroresDinamicos((prev) => ({ ...prev, numero_cuenta: '' }));
    }
  };

  // -------------------Función----------------------
  //   handleRutChange:
  //       Valida el formato del RUT del titular de la cuenta,
  //       impidiendo puntos y permitiendo un único guion.
  // ------------------Parámetros-------------------
  //   @param {React.ChangeEvent<HTMLInputElement>} e - Evento input.
  // ------------------Retorno-----------------------
  //   @returns {void}
  // -----------------------------------------------
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const valor = e.target.value;
    setDatos({ ...datos, rut_titular: valor });
    const caracterInvalido = valor.match(/[^0-9kK\-]/);
    
    if (caracterInvalido) {
      if (caracterInvalido[0] === '.') {
        setErroresDinamicos((prev) => ({ 
          ...prev, 
          rut_titular: 'El carácter "." es inválido. El formato debe ser sin puntos y con guion.',
        }));
      } else {
        setErroresDinamicos((prev) => ({ 
          ...prev, 
          rut_titular: `El carácter "${caracterInvalido[0]}" no está permitido en un RUT.`,
        }));
      }
    } else if ((valor.match(/-/g) || []).length > 1) {
      setErroresDinamicos((prev) => ({ 
        ...prev, 
        rut_titular: 'Solo puedes ingresar un guion.',
      }));
    } else {
      setErroresDinamicos((prev) => ({ ...prev, rut_titular: '' }));
    }
  };

  // -------------------Función----------------------
  //   validarFormularioFinal:
  //       Comprueba la completitud y formato de los datos
  //       antes de ejecutar la petición PUT al backend.
  // ------------------Parámetros-------------------
  //   Ninguno.
  // ------------------Retorno-----------------------
  //   @returns {boolean} True si el formulario es válido.
  // -----------------------------------------------
  const validarFormularioFinal = (): boolean => {
    if (erroresDinamicos.numero_cuenta || erroresDinamicos.rut_titular) {
      setMensaje({
        texto: 'Por favor, corrige los caracteres en rojo antes de guardar.',
        tipo: 'error',
      });
      return false;
    }
    if (datos.numero_cuenta.length < 8) {
      setMensaje({
        texto: 'Error: El número de cuenta debe tener al menos 8 dígitos.',
        tipo: 'error',
      });
      return false;
    }
    if (!datos.rut_titular.includes('-')) {
      setMensaje({
        texto: 'Error: El RUT debe contener un guion separador.',
        tipo: 'error',
      });
      return false;
    }
    if (!datos.banco || !datos.tipo_cuenta) {
      setMensaje({
        texto: 'Error: Debes seleccionar el banco y el tipo de cuenta.',
        tipo: 'error',
      });
      return false;
    }
    return true;
  };

  // -------------------Función----------------------
  //   handleGuardar:
  //       Envía la información actualizada a la base de datos
  //       a través del endpoint de perfil bancario.
  // ------------------Parámetros-------------------
  //   @param {React.FormEvent} e - Evento de envío del form.
  // ------------------Retorno-----------------------
  //   @returns {Promise<void>}
  // -----------------------------------------------
  const handleGuardar = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    if (!validarFormularioFinal()) return; 

    const respuesta = await fetch(`http://localhost:3000/api/perfil/bancario/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });

    if (respuesta.ok) {
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
                  onChange={(e) => setDatos({ ...datos, banco: e.target.value })} 
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
                  onChange={(e) => setDatos({ ...datos, tipo_cuenta: e.target.value })} 
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
                  <span className="error-dinamico">
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
                  <span className="error-dinamico">
                    {erroresDinamicos.rut_titular}
                  </span>
                )}
              </div>

              <footer className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancelar" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">Guardar Cambios</button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
