// -------------------Módulo de Mis Beneficios-----------------------
// Visualización de becas ministeriales, coberturas y vigencias
// Plataforma: Portal de Autoservicio Institucional (UTFSM)
// -------------------------------------------------------------------

import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import '../styles/misBeneficios.css';

// ---------------------Interfaces-----------------------------------
// Definición de las propiedades recibidas y modelo de beneficio
// -------------------------------------------------------------------
interface MisBeneficiosProps {
  userId: number;
  setVista: (v: string) => void;
}

interface Beneficio {
  id: number;
  nombre_beca: string;
  monto_cobertura: string | number;
  vigencia: string;
  estado: string;
}

// ------------------Componente React-------------------
//   MisBeneficios:
//       Despliega la cuadrícula de becas asociadas al estudiante,
//       indicando su estado de validación y modal de detalle.
// ---------------------Props---------------------------
//   @param {MisBeneficiosProps} props - ID del estudiante y setVista.
// ------------------Retorno----------------------------
//   @returns {JSX.Element} Vista del catálogo de becas del alumno.
// -----------------------------------------------------
export const MisBeneficios = ({ userId, setVista }: MisBeneficiosProps) => {
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [beneficioSeleccionado, setBeneficioSeleccionado] = useState<Beneficio | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    fetch(`http://localhost:3000/api/beneficios/${userId}`)
      .then((res) => res.json())
      .then((datos) => {
        if (Array.isArray(datos)) setBeneficios(datos);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, [userId]);

  const perfilGuardado = localStorage.getItem('user');
  const tipoPerfil = perfilGuardado ? JSON.parse(perfilGuardado).perfil : '';

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="loader-spinner"></div>
        <p>Cargando beneficios asignados...</p>
      </div>
    );
  }

  return (
    <div className="layout-principal">
      <Header setVista={setVista} perfil={tipoPerfil} />

      <main className="main-content beneficios-main">
        <section className="beneficios-header">
          <h2>Mis Beneficios y Becas</h2>
          <p>Visualiza el detalle y cobertura de las becas aplicadas a tu cuenta.</p>
        </section>

        {/* Lista de beneficios asignados */}
        <section className="grid-beneficios">
          {beneficios.length === 0 ? (
            <div className="tarjeta-vacia">
              <p>No tienes beneficios o becas registradas en este momento.</p>
            </div>
          ) : (
            beneficios.map((beneficio) => (
              <div 
                key={beneficio.id} 
                className="tarjeta-beneficio"
                onClick={() => setBeneficioSeleccionado(beneficio)}
              >
                <div className="tarjeta-icono">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polygon 
                      points={
                        "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 " +
                        "12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      }
                    />
                  </svg>
                </div>
                <h3>{beneficio.nombre_beca}</h3>
                {beneficio.estado === 'Pendiente' ? (
                  <span 
                    className="badge-pago" 
                    style={{
                      backgroundColor: '#fef08a',
                      color: '#92400e',
                      border: '1px solid #fde68a',
                    }}
                  >
                    Pendiente de validación
                  </span>
                ) : (
                  <span className="badge-activo">Beneficio Validado</span>
                )}
                <p className="clic-detalle">Ver detalles de cobertura &rarr;</p>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Modal con vigencia y monto de cobertura */}
      {beneficioSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-container pop-up-beneficio">
            <header className="modal-header">
              <h3>Detalle del Beneficio</h3>
              <button 
                className="btn-cerrar-icono" 
                onClick={() => setBeneficioSeleccionado(null)}
              >
                ×
              </button>
            </header>
            <div className="modal-body detalle-cobertura">
              <h4>{beneficioSeleccionado.nombre_beca}</h4>
              
              <div className="dato-cobertura">
                <span className="label-cobertura">Monto de Cobertura Anual</span>
                <span className="valor-cobertura monto-verde">
                  ${Number(beneficioSeleccionado.monto_cobertura).toLocaleString()}
                </span>
              </div>
              
              <div className="dato-cobertura">
                <span className="label-cobertura">Período de Vigencia</span>
                <span className="valor-cobertura">{beneficioSeleccionado.vigencia}</span>
              </div>

              <div className="alerta-info">
                Este monto se aplica automáticamente a tu saldo neto. Revisa tu "Historial de Transacciones"
                en el módulo de pagos para ver las rebajas mensuales aplicadas por este emisor.
              </div>
            </div>
            <footer className="modal-actions">
              <button 
                className="btn-aceptar-beneficio" 
                onClick={() => setBeneficioSeleccionado(null)}
              >
                Entendido
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
