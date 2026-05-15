import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';

export const ObtenerCertificados = ({ userId, setVista }: { userId?: number, setVista?: (v: string) => void }) => {
  const navigate = useNavigate();

  // Función de navegación de emergencia si se accede por URL directa
  const handleBack = (vista: string) => {
    if (setVista) {
      setVista(vista);
    } else {
      navigate('/dashboard'); // Si entramos directo, el logo nos manda al dashboard
    }
  };

  const certificadosDisponibles = [
    { id: 1, nombre: 'Certificado de Alumno Regular', costo: 'Gratis' },
    { id: 2, nombre: 'Certificado de Matrícula', costo: 'Gratis' },
    { id: 3, nombre: 'Concentración de Notas', costo: '$3.500' },
    { id: 4, nombre: 'Certificado de Titulo', costo: '$5.000' }
  ];

  return (
    <div className="layout-principal">
      {/* Pasamos la función manejadora para que el Header no rompa la navegación */}
      <Header setVista={handleBack} perfil="Estudiante Regular" />

      <main className="main-content" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <section className="modulo-header">
          <h2>Módulo: Obtención de Certificados</h2>
          <p style={{ color: '#666' }}>Esta es una vista previa de la funcionalidad planificada para el Hito 4.</p>
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
                    <button onClick={() => alert('Próximamente disponible')} style={{ cursor: 'pointer' }}>
                      Solicitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};