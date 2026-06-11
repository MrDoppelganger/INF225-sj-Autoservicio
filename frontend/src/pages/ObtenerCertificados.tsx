import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';

// Cambiamos userId por user completo para tener acceso a su perfil y situación académica
export const ObtenerCertificados = ({ user, setVista }: { user: any, setVista?: (v: string) => void }) => {
  const navigate = useNavigate();

  const handleBack = (vista: string) => {
    if (setVista) {
      setVista(vista);
    } else {
      navigate('/dashboard'); 
    }
  };

  // Lógica de negocio: Distinción según perfil y situación académica
  const obtenerListaCertificados = () => {
    const listaBase = [];

    if (user.perfil === 'Estudiante Regular' || user.perfil === 'Alumno Nuevo') {
      listaBase.push({ id: 1, nombre: 'Certificado de Alumno Regular', costo: 'Gratis' });
      listaBase.push({ id: 2, nombre: 'Certificado de Matrícula', costo: 'Gratis' });
      listaBase.push({ id: 3, nombre: 'Concentración de Notas', costo: '$3.500' });
    } else if (user.perfil === 'Exalumno') {
      // Todos los exalumnos pueden sacar notas y asignaturas
      listaBase.push({ id: 3, nombre: 'Concentración de Notas', costo: '$3.500' });
      listaBase.push({ id: 5, nombre: 'Certificado de Asignaturas Aprobadas', costo: '$3.500' });

      // Solo si el exalumno está titulado (sin deudas de deserción), puede pedir el título
      if (user.situacion_academica === 'Titulado') {
        listaBase.push({ id: 4, nombre: 'Certificado de Título', costo: '$5.000' });
      }
    }

    return listaBase;
  };

  const certificadosDisponibles = obtenerListaCertificados();

  return (
    <div className="layout-principal">
      <Header setVista={handleBack} perfil={user.perfil} />

      <main className="main-content" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <section className="modulo-header">
          <h2>Módulo: Obtención de Certificados</h2>
          
          {/* Mensaje visual si es un Exalumno retirado (Con deudas/No titulado) */}
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
                    <button onClick={() => alert('Próximamente disponible')} style={{ cursor: 'pointer', padding: '5px 10px' }}>
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
    </div>
  );
};