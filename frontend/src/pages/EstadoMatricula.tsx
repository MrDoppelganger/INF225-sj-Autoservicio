// -------------------Módulo de Estado de Matrícula------------------
// Visualización del cobro y simulación de pago del derecho de matrícula
// Plataforma: Portal de Autoservicio Institucional (UTFSM)
// -------------------------------------------------------------------

import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import '../styles/estadoMatricula.css';

// ---------------------Interfaces-----------------------------------
// Definición de las propiedades recibidas y modelo de matrícula
// -------------------------------------------------------------------
interface EstadoMatriculaProps {
  userId: number;
  setVista: (v: string) => void;
}

interface MatriculaItem {
  id: number;
  id_estudiante: number;
  periodo_academico: string;
  monto_matricula: string | number;
  estado_matricula: string;
  fecha_limite: string;
}

// ------------------Componente React-------------------
//   EstadoMatricula:
//       Despliega el estado de matrícula del estudiante para el
//       periodo académico vigente y permite procesar el pago en línea.
// ---------------------Props---------------------------
//   @param {EstadoMatriculaProps} props - ID de usuario y setVista.
// ------------------Retorno----------------------------
//   @returns {JSX.Element} Vista de gestión y pago de matrícula.
// -----------------------------------------------------
export const EstadoMatricula = ({ userId, setVista }: EstadoMatriculaProps) => {
  const [matriculas, setMatriculas] = useState<MatriculaItem[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [procesandoPago, setProcesandoPago] = useState<boolean>(false);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string>('WebPay');
  const [modalExito, setModalExito] = useState<string>('');

  // -------------------Función----------------------
  //   cargarMatriculas:
  //       Recupera el listado de matrículas del estudiante
  //       desde la API REST institucional.
  // ------------------Parámetros-------------------
  //   Ninguno.
  // ------------------Retorno-----------------------
  //   @returns {void}
  // -----------------------------------------------
  const cargarMatriculas = (): void => {
    fetch(`http://localhost:3000/api/matricula/${userId}`)
      .then((res) => res.json())
      .then((datos) => {
        if (Array.isArray(datos)) {
          setMatriculas(datos);
        }
        setCargando(false);
      })
      .catch(() => setCargando(false));
  };

  useEffect(() => {
    cargarMatriculas();
  }, [userId]);

  const perfilGuardado = localStorage.getItem('user');
  const tipoPerfil = perfilGuardado ? JSON.parse(perfilGuardado).perfil : '';

  // Determinar la matrícula activa / pendiente de cobro
  const matriculaPendiente = matriculas.find((m) => m.estado_matricula === 'Pendiente');
  const matriculaActiva = matriculaPendiente || matriculas[0] || null;

  // -------------------Función----------------------
  //   handlePagarMatricula:
  //       Ejecuta la mímica de pago de la matrícula pendiente
  //       enviando la transacción al backend y actualizando la vista.
  // ------------------Parámetros-------------------
  //   @param {number} idMatricula - Identificador de matrícula.
  //   @param {number} monto - Valor monetario del arancel de matrícula.
  // ------------------Retorno-----------------------
  //   @returns {Promise<void>}
  // -----------------------------------------------
  const handlePagarMatricula = async (idMatricula: number, monto: number): Promise<void> => {
    setProcesandoPago(true);

    try {
      const respuesta = await fetch('http://localhost:3000/api/matricula/pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_estudiante: userId,
          id_matricula: idMatricula,
          metodo_pago: metodoSeleccionado,
        }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok && datos.success) {
        setModalExito(
          `¡Pago Exitoso! Se ha cancelado la matrícula por un monto de ` +
          `$${Number(monto).toLocaleString()} a través de ${metodoSeleccionado}.`
        );
        cargarMatriculas();
      } else {
        alert(datos.error || 'Ocurrió un error al procesar el pago de matrícula.');
      }
    } catch (err) {
      alert('Error de conexión con la pasarela de pago institucional.');
    } finally {
      setProcesandoPago(false);
    }
  };

  // -------------------Función----------------------
  //   formatearFecha:
  //       Convierte una fecha ISO/date a convención estándar chilena.
  // ------------------Parámetros-------------------
  //   @param {string} fechaStr - Cadena de fecha.
  // ------------------Retorno-----------------------
  //   @returns {string} Fecha formateada 'DD/MM/AAAA'.
  // -----------------------------------------------
  const formatearFecha = (fechaStr: string): string => {
    if (!fechaStr) return 'No especificada';
    return new Date(fechaStr).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="loader-spinner"></div>
        <p>Cargando información de matrícula institucional...</p>
      </div>
    );
  }

  return (
    <div className="modulo-contenedor">
      <Header setVista={setVista} perfil={tipoPerfil} />

      <div className="modulo-matricula">
        <header className="matricula-header">
          <h2>Gestión y Pago de Matrícula</h2>
          <p>
            Revisa el estado de tu matrícula académica institucional para el periodo vigente
            y realiza el pago en línea.
          </p>
        </header>

        {matriculaActiva ? (
          <>
            {/* Grilla de Resumen */}
            <div className="matricula-grid">
              <div className="tarjeta-resumen-matricula">
                <span className="tarjeta-label">Periodo Académico</span>
                <span className="tarjeta-valor">{matriculaActiva.periodo_academico}</span>
              </div>

              <div className="tarjeta-resumen-matricula">
                <span className="tarjeta-label">Costo Matrícula</span>
                <span className="tarjeta-valor monto">
                  ${Number(matriculaActiva.monto_matricula).toLocaleString()}
                </span>
              </div>

              <div className="tarjeta-resumen-matricula">
                <span className="tarjeta-label">Estado de Pago</span>
                <span 
                  className={
                    `badge-matricula ` +
                    (matriculaActiva.estado_matricula === 'Pagada' ? 'pagada' : 'pendiente')
                  }
                >
                  {matriculaActiva.estado_matricula === 'Pagada' ? '● Pagada' : '● Pendiente de Pago'}
                </span>
              </div>

              <div className="tarjeta-resumen-matricula">
                <span className="tarjeta-label">Fecha Límite</span>
                <span className="tarjeta-valor" style={{ fontSize: '1.15rem' }}>
                  {formatearFecha(matriculaActiva.fecha_limite)}
                </span>
              </div>
            </div>

            {/* Panel de Pago si está Pendiente */}
            {matriculaPendiente ? (
              <div className="panel-pago-matricula">
                <h3>Pagar Matrícula en Línea</h3>
                <p>
                  Selecciona tu medio de pago preferido para formalizar la matrícula del periodo{' '}
                  <strong>{matriculaPendiente.periodo_academico}</strong> por un total de{' '}
                  <strong>${Number(matriculaPendiente.monto_matricula).toLocaleString()}</strong>.
                </p>

                <div className="metodos-pago-grid">
                  {['WebPay', 'Banco Santander', 'Banco Estado', 'Transferencia'].map((metodo) => (
                    <div
                      key={metodo}
                      className={
                        `opcion-metodo ` +
                        (metodoSeleccionado === metodo ? 'seleccionada' : '')
                      }
                      onClick={() => setMetodoSeleccionado(metodo)}
                    >
                      <input 
                        type="radio" 
                        name="metodoPago" 
                        checked={metodoSeleccionado === metodo}
                        onChange={() => setMetodoSeleccionado(metodo)}
                      />
                      <span>{metodo}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="btn-pagar-matricula"
                  onClick={() => 
                    handlePagarMatricula(
                      matriculaPendiente.id,
                      Number(matriculaPendiente.monto_matricula)
                    )
                  }
                  disabled={procesandoPago}
                >
                  {procesandoPago
                    ? 'Procesando Transacción...'
                    : `Pagar $${Number(matriculaPendiente.monto_matricula).toLocaleString()}` +
                      ` con ${metodoSeleccionado}`
                  }
                </button>
              </div>
            ) : (
              <div className="alerta-al-dia">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div>
                  <strong>¡Matrícula Regularizada!</strong> Te encuentras al día con el pago de matrícula
                  para el periodo vigente. No registras cobros pendientes.
                </div>
              </div>
            )}
          </>
        ) : (
          <p>No se encontraron registros de matrícula asociados a este usuario.</p>
        )}

        {/* Historial de Matrículas */}
        {matriculas.length > 0 && (
          <div className="tabla-matriculas-container">
            <h3 style={{ color: '#003B70', marginBottom: '15px' }}>Historial de Matrículas</h3>
            <table className="tabla-matriculas">
              <thead>
                <tr>
                  <th>Periodo</th>
                  <th>Monto</th>
                  <th>Fecha Límite</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {matriculas.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.periodo_academico}</strong></td>
                    <td>${Number(item.monto_matricula).toLocaleString()}</td>
                    <td>{formatearFecha(item.fecha_limite)}</td>
                    <td>
                      <span 
                        className={
                          `badge-matricula ` +
                          (item.estado_matricula === 'Pagada' ? 'pagada' : 'pendiente')
                        }
                      >
                        {item.estado_matricula}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Éxito de Pago */}
      {modalExito && (
        <div className="modal-overlay">
          <div className="modal-container pop-up-exito">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="exito-icon"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h3>¡Pago Procesado Exitosamente!</h3>
            <p>{modalExito}</p>
            <button className="btn-aceptar-popup" onClick={() => setModalExito('')}>
              Aceptar y Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
