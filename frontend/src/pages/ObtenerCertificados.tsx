import { useState } from 'react';
import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import '../styles/obtenerCertificados.css';

export const ObtenerCertificados = ({ user, setVista }: { user: any, setVista?: (v: string) => void }) => {
  const navigate = useNavigate();
  const [mensajePopup, setMensajePopup] = useState<string>('');

  const handleBack = (vista: string) => {
    if (setVista) {
      setVista(vista);
    } else {
      navigate('/dashboard'); 
    }
  };

  const obtenerListaCertificados = () => {
    const listaBase = [];

    if (user.perfil === 'Estudiante Regular' || user.perfil === 'Alumno Nuevo') {
      listaBase.push({ id: 1, nombre: 'Certificado de Alumno Regular', costo: 'Gratis' });
      listaBase.push({ id: 2, nombre: 'Certificado de Matrícula', costo: 'Gratis' });
      listaBase.push({ id: 3, nombre: 'Concentración de Notas', costo: '$3.500' });
    } else if (user.perfil === 'Exalumno') {
      listaBase.push({ id: 3, nombre: 'Concentración de Notas', costo: '$3.500' });
      listaBase.push({ id: 5, nombre: 'Certificado de Asignaturas Aprobadas', costo: '$3.500' });

      if (user.situacion_academica === 'Titulado') {
        listaBase.push({ id: 4, nombre: 'Certificado de Título', costo: '$5.000' });
      }
    }

    return listaBase;
  };

  const certificadosDisponibles = obtenerListaCertificados();

  const handleSolicitar = (certId: number) => {
    if (certId === 4) {
      setMensajePopup('Documento solicitado correctamente y listo para descargar.');
    } else {
      alert('Esta función estará disponible próximamente para este certificado.');
    }
  };

  return (
    <div className="layout-principal">
      <Header setVista={handleBack} perfil={user.perfil} />

      <main className="main-content cert-main">
        <section className="cert-header">
          <h2>Módulo: Obtención de Certificados</h2>
          <p>Solicita y descarga tus documentos académicos oficiales.</p>
          
          {user.perfil === 'Exalumno' && user.situacion_academica !== 'Titulado' && (
            <div className="alerta-bloqueo">
              {/* Icono SVG Nativo de Advertencia */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="alerta-icon">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <div>
                <strong>Aviso Importante:</strong> La opción para solicitar el Certificado de Título se encuentra deshabilitada debido a que registra pagos pendientes históricos o no ha finalizado su proceso. Aún puede emitir sus certificados generales.
              </div>
            </div>
          )}
        </section>

        <section className="lista-certificados-container">
          <table className="tabla-certificados">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Costo</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {certificadosDisponibles.map((cert) => (
                <tr key={cert.id}>
                  <td className="cert-nombre">{cert.nombre}</td>
                  <td className="cert-costo">
                    <span className={cert.costo === 'Gratis' ? 'badge-gratis' : 'badge-pago'}>
                      {cert.costo}
                    </span>
                  </td>
                  <td>
                    <button className="btn-solicitar" onClick={() => handleSolicitar(cert.id)}>
                      Solicitar
                    </button>
                  </td>
                </tr>
              ))}
              {certificadosDisponibles.length === 0 && (
                <tr>
                  <td colSpan={3} className="cert-vacio">No hay certificados disponibles para este perfil.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      {/* RENDERIZADO DEL POP-UP (MODAL) */}
      {mensajePopup !== '' && (
        <div className="modal-overlay">
          <div className="modal-container pop-up-exito">
            {/* Icono SVG Nativo de Éxito */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="exito-icon">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h3>¡Trámite Exitoso!</h3>
            <p>{mensajePopup}</p>
            <button className="btn-aceptar-popup" onClick={() => setMensajePopup('')}>
              Aceptar y Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};