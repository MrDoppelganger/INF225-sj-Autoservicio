import { Navbar } from '../components/Navbar';
import { ServiceCard } from '../components/ServiceCard';
import '../styles/Home.css';

export const Home = () => {
  const services = [
    { id: 1, title: 'Información Académica', description: 'Notas, historial y avance curricular', icon: '📚' },
    { id: 2, title: 'Inscripción de Asignaturas', description: 'Toma de ramos semestral', icon: '📝' },
    { id: 3, title: 'Finanzas Alumno', description: 'Aranceles, becas y pagos', icon: '💳' },
    { id: 4, title: 'Certificados', description: 'Emisión de documentos oficiales', icon: '📄' }
  ];

  return (
    <div className="home-container">
      <Navbar />
      <main className="main-content">
        <section className="hero-section">
          <h1>Bienvenido al Autoservicio</h1>
          <p>Gestiona tu información académica de forma rápida y segura.</p>
        </section>
        <section className="services-grid">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              icon={service.icon}
            />
          ))}
        </section>
      </main>
    </div>
  );
};