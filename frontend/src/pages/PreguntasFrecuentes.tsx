
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import logoUsm from '../assets/logo_usm.png';
import '../styles/dashboard.css';
import '../styles/preguntasFrecuentes.css';

interface UsuarioSesion {
  id: number;
  rut: string;
  perfil: string;
  nombre: string;
  situacion_academica?: string;
}

interface PreguntaFrecuente {
  id: number;
  pregunta: string;
  respuesta: ReactNode;
}

const preguntas: PreguntaFrecuente[] = [
  {
    id: 1,
    pregunta: '¿Qué puedo hacer si no puedo ingresar al portal?',
    respuesta: (
      <>
        Verifica que estés utilizando tus credenciales institucionales
        correctamente. Si el problema continúa, puedes contactar a
        {' '}
        <a href="mailto:direccion.estudios@usm.cl">
          direccion.estudios@usm.cl
        </a>
        {' '}
        para solicitar orientación.
      </>
    ),
  },
  {
    id: 2,
    pregunta: '¿Cómo puedo consultar mi cuenta institucional?',
    respuesta: (
      <>
        Puedes ingresar a{' '}
        <a
          href="https://pasaporte.usm.cl/id/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Pasaporte USM
        </a>
        {' '}
        y seleccionar la opción «Consultar Cuenta» para revisar la
        información correspondiente a tu cuenta institucional.
      </>
    ),
  },
  {
    id: 3,
    pregunta: '¿Cómo puedo recuperar mi contraseña?',
    respuesta: (
      <>
        Ingresa a{' '}
        <a
          href="https://pasaporte.usm.cl/id/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Pasaporte USM
        </a>
        {' '}
        y selecciona la opción «Recuperar Contraseña». Si no logras
        resolver el problema, puedes escribir a{' '}
        <a href="mailto:mesadeservicios.dti@usm.cl">
          mesadeservicios.dti@usm.cl
        </a>
        {' '}
        para solicitar asistencia.
      </>
    ),
  },
  {
    id: 4,
    pregunta: '¿Cómo puedo consultar mis pagos y deudas?',
    respuesta: (
      <>
        Revisa la sección de pagos y deudas del Portal de Autoservicio
        para consultar la información que esté disponible para tu
        usuario. Si necesitas ayuda con asuntos de caja o pagos,
        puedes contactar a{' '}
        <a href="mailto:cajaweb@usm.cl">cajaweb@usm.cl</a>.
      </>
    ),
  },
  {
    id: 5,
    pregunta: '¿Dónde puedo encontrar el instructivo para realizar pagos?',
    respuesta: (
      <>
        Para obtener orientación sobre el procedimiento de pago,
        puedes consultar con el área de Caja escribiendo a{' '}
        <a href="mailto:cajaweb@usm.cl">cajaweb@usm.cl</a>.
        Allí podrás solicitar el instructivo vigente correspondiente
        a tu trámite.
      </>
    ),
  },
  {
    id: 6,
    pregunta:
      '¿Cómo puedo obtener un certificado de posesión de grado o título?',
    respuesta: (
      <>
        Consulta la sección de certificados del Portal de Autoservicio
        para revisar las opciones disponibles para tu usuario. Si no
        encuentras el certificado que necesitas, contacta a la unidad
        correspondiente para conocer el procedimiento de solicitud.
      </>
    ),
  },
];

export const PreguntasFrecuentes = () => {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [preguntaAbierta, setPreguntaAbierta] = useState<number | null>(
    null
  );

  const navigate = useNavigate();

  useEffect(() => {
    const usuarioAlmacenado = localStorage.getItem('user');

    if (!usuarioAlmacenado) {
      navigate('/');
      return;
    }

    try {
      setUsuario(JSON.parse(usuarioAlmacenado));
    } catch {
      localStorage.removeItem('user');
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('vistaDashboard');

    navigate('/', {
      state: { mensaje: 'Sesión cerrada correctamente' },
    });
  };

  if (!usuario) return null;

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="header-info">
          <img
            src={logoUsm}
            alt="Logo Universidad Técnica Federico Santa María"
            className="logo-img"
          />

          <div>
            <p>
              Bienvenido, <strong>{usuario.nombre}</strong> al Portal de
              Autoservicio
            </p>
            <p>
              Tipo de Usuario: <strong>{usuario.perfil}</strong>
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn-preguntas"
            onClick={() => navigate('/dashboard')}
            aria-label="Volver al portal"
            title="Volver al portal"
          >
            <svg
              viewBox="0 0 24 24"
              width="21"
              height="21"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
              <circle cx="12" cy="12" r="10" />
          </svg>
          </button>

          <button className="btn-logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="faq-main">
        <section className="faq-encabezado">
          <h2 className="faq-titulo">Preguntas frecuentes</h2>
          <p>
            Encuentra respuestas a las consultas más habituales del
            Portal de Autoservicio.
          </p>
          <p className="faq-instruccion">
            Selecciona una pregunta para desplegar su respuesta.
          </p>
        </section>

        <section className="faq-lista" aria-label="Lista de preguntas frecuentes">
          {preguntas.map((item) => {
            const estaAbierta = preguntaAbierta === item.id;

            return (
              <article className="faq-item" key={item.id}>
                <button
                  type="button"
                  className={`faq-pregunta ${
                    estaAbierta ? 'seleccionada' : ''
                  }`}
                  onClick={() =>
                    setPreguntaAbierta(estaAbierta ? null : item.id)
                  }
                  aria-expanded={estaAbierta}
                  aria-controls={`respuesta-${item.id}`}
                >
                  <span className="faq-numero">
                    {String(item.id).padStart(2, '0')}
                  </span>

                  <span className="faq-texto-pregunta">
                    {item.pregunta}
                  </span>

                  <span className="faq-indicador" aria-hidden="true">
                    {estaAbierta ? '−' : '+'}
                  </span>
                </button>

                <div
                  id={`respuesta-${item.id}`}
                  className={`faq-respuesta ${
                    estaAbierta ? 'abierta' : ''
                  }`}
                  aria-hidden={!estaAbierta}
                  inert={!estaAbierta}
                >
                  <div className="faq-respuesta-contenido">
                    <p>{item.respuesta}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
};
