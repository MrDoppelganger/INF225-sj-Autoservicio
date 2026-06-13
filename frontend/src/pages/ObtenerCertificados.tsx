import { useState } from 'react';
import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';

export const ObtenerCertificados = ({ user, setVista }: { user: any, setVista?: (v: string) => void }) => {
  const navigate = useNavigate();
  // 1. CREAMOS EL ESTADO PARA CONTROLAR EL POP-UP
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

  // 2. FUNCIÓN PARA MANEJAR EL CLIC EN SOLICITAR
  const handleSolicitar = (certId: number) => {
    if (certId === 4) {
      // Si es el certificado de título, abrimos el Pop-up
      setMensajePopup('Documento solicitado correctamente y listo para descargar.');
    } else {
      // Para los demás, mantenemos un mensaje temporal
      alert('Esta función estará disponible próximamente para este certificado.');
    }
  };

  return (
    <div className="layout-principal">
      <Header setVista={handleBack} perfil={user.perfil} />

      <main className="main-content" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <section className="modulo-header">
          <h2>Módulo: Obtención de Certificados</h2>
          
          {user.perfil === 'Exalumno' && user.situacion_academica !== 'Titulado' && (
            <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '5px', marginTop: '15px', border: '1px solid #ffeeba' }}>
              <strong>Aviso:</strong> La opción para solicitar el Certificado de Título se encuentra deshabilitada debido a que registra pagos pendientes históricos o no ha finalizado su proceso. Aún puede emitir sus certificados generales.
            </div>
          )}
        </section>

        <section className="lista-certificados" style={{ marginTop: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #003B70' }}>
                <th style={{ padding: '12px' }}>Documento</th>
                <th style={{ padding: '12px' }}>Costo</th>
                <th style={{ padding: '12px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {certificadosDisponibles.map((cert) => (
                <tr key={cert.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{cert.nombre}</td>
                  <td style={{ padding: '12px' }}>{cert.costo}</td>
                  <td style={{ padding: '12px' }}>
                    {/* 3. CONECTAMOS EL BOTÓN CON LA FUNCIÓN */}
                    <button 
                      onClick={() => handleSolicitar(cert.id)} 
                      style={{ cursor: 'pointer', padding: '5px 10px', backgroundColor: '#003B70', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      Solicitar
                    </button>
                  </td>
                </tr>
              ))}
              {certificadosDisponibles.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '12px', textAlign: 'center' }}>No hay certificados disponibles para este perfil.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      {/* 4. RENDERIZADO CONDICIONAL DEL POP-UP (MODAL) */}
      {mensajePopup !== '' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '8px',
            textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            maxWidth: '400px'
          }}>
            <h3 style={{ color: '#28a745', marginTop: 0 }}>¡Éxito!</h3>
            <p style={{ fontSize: '16px', lineHeight: '1.5' }}>{mensajePopup}</p>
            <button 
              onClick={() => setMensajePopup('')} 
              style={{
                marginTop: '20px', padding: '10px 20px', cursor: 'pointer',
                backgroundColor: '#003B70', color: 'white', border: 'none', borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};