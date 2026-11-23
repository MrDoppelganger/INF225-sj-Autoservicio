// -------------------Módulo de Obtención de Certificados------------
// Emisión digital de documentos académicos y tramitación de títulos
// Plataforma: Portal de Autoservicio Institucional (UTFSM)
// -------------------------------------------------------------------

import { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import '../styles/obtenerCertificados.css';

// ---------------------Interfaces-----------------------------------
// Definición de las propiedades y modelos de datos para certificados
// -------------------------------------------------------------------
interface ObtenerCertificadosProps {
  user?: {
    id: number;
    rut: string;
    perfil: string;
    nombre: string;
    situacion_academica?: string;
    anio_ingreso?: number | null;
    email?: string;
  };
  setVista?: (v: string) => void;
}

interface SolicitudCertificadoItem {
  id: number;
  id_estudiante: number;
  id_certificado?: number;
  codigo_verificacion: string;
  fecha_solicitud: string;
  estado: string;
  periodo?: string;
  proposito?: string;
  institucion_destino?: string;
  tipo_practica?: string;
  empresa_rut?: string;
  empresa_nombre?: string;
  fecha_inicio?: string;
  fecha_termino?: string;
  grado_tipo?: string;
  costo: number | string;
  metodo_pago?: string;
  es_de_pago: boolean;
  nombre_certificado?: string;
  descripcion?: string;
}

interface ModalExitoData {
  titulo: string;
  mensaje: string;
  codigo?: string;
  detalleExtra?: string;
}

// ------------------Componente React-------------------
//   ObtenerCertificados:
//       Despliega el catálogo de certificados institucionales con
//       separación por modalidad gratuita y de pago, formularios
//       de configuración dinámica e historial con mímica de pago.
// ---------------------Props---------------------------
//   @param {ObtenerCertificadosProps} props - Datos del usuario y callback.
// ------------------Retorno----------------------------
//   @returns {JSX.Element | null} Vista modular de certificados.
// -----------------------------------------------------
export const ObtenerCertificados = ({ user: propUser, setVista }: ObtenerCertificadosProps) => {
  const navigate = useNavigate();

  // Gestión del usuario en sesión
  const usuarioAlmacenado = localStorage.getItem('user');
  const user = propUser || (usuarioAlmacenado ? JSON.parse(usuarioAlmacenado) : null);

  // Estados de interfaz y navegación por pestañas
  const [tabActiva, setTabActiva] = useState<'gratis' | 'pago'>('gratis');
  const [solicitudes, setSolicitudes] = useState<SolicitudCertificadoItem[]>([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState<boolean>(true);
  const [anioIngresoReal, setAnioIngresoReal] = useState<number | null>(null);
  const [emailContacto, setEmailContacto] = useState<string>('estudiante.prueba@usm.cl');

  // Estados del formulario para Certificados Gratuitos
  const [tipoCertGratis, setTipoCertGratis] = useState<string>('alumno_regular');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('2026-2');
  const [anioSeleccionado, setAnioSeleccionado] = useState<string>('2026');
  const [propositoSeleccionado, setPropositoSeleccionado] = useState<string>('Fines que se estime conveniente');
  const [institucionDestino, setInstitucionDestino] = useState<string>('');

  // Estados de Seguro de Práctica
  const [tipoPractica, setTipoPractica] = useState<string>('Práctica Profesional');
  const [empresaRut, setEmpresaRut] = useState<string>('');
  const [empresaNombre, setEmpresaNombre] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaTermino, setFechaTermino] = useState<string>('');

  // Estados del formulario para Certificados de Grado (con Pago)
  const [gradoTipo, setGradoTipo] = useState<string>('Licenciatura');

  // Estados de modales interactivos
  const [procesandoSolicitud, setProcesandoSolicitud] = useState<boolean>(false);
  const [modalExito, setModalExito] = useState<ModalExitoData | null>(null);
  const [solicitudAPagar, setSolicitudAPagar] = useState<SolicitudCertificadoItem | null>(null);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<string>('Webpay');
  const [procesandoPago, setProcesandoPago] = useState<boolean>(false);
  const [certificadoVistaPrevia, setCertificadoVistaPrevia] = useState<SolicitudCertificadoItem | null>(null);

  // Precios configurados para grados académicos
  const preciosGrados: Record<string, number> = {
    'Bachiller': 15000,
    'Licenciatura': 25000,
    'Título de Ingeniería': 45000,
  };

  // -------------------Función----------------------
  //   cargarInfoUsuario:
  //       Consulta antecedentes actualizados del alumno
  //       incluyendo año de ingreso y correo institucional.
  // ------------------Parámetros-------------------
  //   Ninguno.
  // ------------------Retorno-----------------------
  //   @returns {void}
  // -----------------------------------------------
  const cargarInfoUsuario = (): void => {
    if (!user?.id) return;
    fetch(`${API_BASE_URL}/api/usuario/info/${user.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((datos) => {
        if (datos) {
          if (datos.anio_ingreso != null) {
            setAnioIngresoReal(Number(datos.anio_ingreso));
          } else {
            setAnioIngresoReal(null);
          }
          if (datos.email) {
            setEmailContacto(datos.email);
          }
        }
      })
      .catch((err) => console.error('Error cargando perfil:', err));
  };

  // -------------------Función----------------------
  //   cargarSolicitudes:
  //       Recupera el historial de certificados solicitados
  //       por el estudiante desde el servidor backend.
  // ------------------Parámetros-------------------
  //   Ninguno.
  // ------------------Retorno-----------------------
  //   @returns {void}
  // -----------------------------------------------
  const cargarSolicitudes = (): void => {
    if (!user?.id) return;
    setCargandoSolicitudes(true);
    fetch(`${API_BASE_URL}/api/certificados/solicitudes/${user.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((datos: SolicitudCertificadoItem[]) => {
        setSolicitudes(Array.isArray(datos) ? datos : []);
        setCargandoSolicitudes(false);
      })
      .catch((err) => {
        console.error('Error al recuperar solicitudes:', err);
        setCargandoSolicitudes(false);
      });
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    cargarInfoUsuario();
    cargarSolicitudes();
  }, [user?.id]);

  // Cálculo plausible de semestres cursados desde el año de ingreso hasta 2026-2
  const listaSemestresDisponibles = useMemo(() => {
    const anioActual = 2026;
    const semestres: string[] = [];
    if (anioIngresoReal === null) return semestres;
    for (let anio = anioActual; anio >= anioIngresoReal; anio--) {
      semestres.push(`${anio}-2`);
      semestres.push(`${anio}-1`);
    }
    return semestres;
  }, [anioIngresoReal]);

  // Cálculo plausible de años académicos disponibles desde el año de ingreso
  const listaAniosDisponibles = useMemo(() => {
    const anioActual = 2026;
    const anios: number[] = [];
    if (anioIngresoReal === null) return anios;
    for (let anio = anioActual; anio >= anioIngresoReal; anio--) {
      anios.push(anio);
    }
    return anios;
  }, [anioIngresoReal]);

  // -------------------Función----------------------
  //   handleBack:
  //       Retorna al panel principal o a la vista configurada.
  // ------------------Parámetros-------------------
  //   @param {string} vista - Destino de la navegación.
  // ------------------Retorno-----------------------
  //   @returns {void}
  // -----------------------------------------------
  const handleBack = (vista: string): void => {
    if (setVista) {
      setVista(vista);
    } else {
      navigate('/dashboard');
    }
  };

  // -------------------Función----------------------
  //   actualizarEstadoBackend:
  //       Actualiza el estado de una solicitud en PostgreSQL.
  // ------------------Parámetros-------------------
  //   @param {number} id - Identificador de solicitud.
  //   @param {string} nuevoEstado - Estado a asignar.
  // ------------------Retorno-----------------------
  //   @returns {Promise<boolean>}
  // -----------------------------------------------
  const actualizarEstadoBackend = async (id: number, nuevoEstado: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/certificados/actualizar-estado/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoEstado }),
      });
      return res.ok;
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      return false;
    }
  };

  // -------------------Función----------------------
  //   iniciarTemporizadorGratuito:
  //       Simula la emisión durante 4 segundos pasando de
  //       'Pendiente' a 'Emitido' y enviando aviso al correo.
  // ------------------Parámetros-------------------
  //   @param {number} idSolicitud - ID del registro recién creado.
  //   @param {string} nombreDoc - Título del documento solicitado.
  //   @param {string} codVerif - Código institucional generado.
  // ------------------Retorno-----------------------
  //   @returns {void}
  // -----------------------------------------------
  const iniciarTemporizadorGratuito = (idSolicitud: number, nombreDoc: string, codVerif: string): void => {
    setTimeout(async () => {
      await actualizarEstadoBackend(idSolicitud, 'Emitido');
      setSolicitudes((prev) =>
        prev.map((item) => (item.id === idSolicitud ? { ...item, estado: 'Emitido' } : item))
      );
      setModalExito({
        titulo: '¡Certificado Emitido con Éxito!',
        mensaje:
          `El documento "${nombreDoc}" ha sido generado satisfactoriamente ` +
          `y se envió una copia digital en formato PDF a su correo ` +
          `institucional (${emailContacto}).`,
        codigo: codVerif,
        detalleExtra: 'Puede verificar su autenticidad o descargarlo desde el historial inferior.',
      });
    }, 4000);
  };

  // -------------------Función----------------------
  //   iniciarTemporizadorPago:
  //       Mantiene la solicitud en 'En revisión' durante
  //       5 segundos y luego la transiciona a 'Por pagar'.
  // ------------------Parámetros-------------------
  //   @param {number} idSolicitud - ID de la solicitud de grado.
  // ------------------Retorno-----------------------
  //   @returns {void}
  // -----------------------------------------------
  const iniciarTemporizadorPago = (idSolicitud: number): void => {
    setTimeout(async () => {
      await actualizarEstadoBackend(idSolicitud, 'Por pagar');
      setSolicitudes((prev) =>
        prev.map((item) => (item.id === idSolicitud ? { ...item, estado: 'Por pagar' } : item))
      );
    }, 5000);
  };

  // -------------------Función----------------------
  //   handleSolicitarGratuito:
  //       Valida y registra la solicitud de un certificado sin costo.
  // ------------------Parámetros-------------------
  //   Ninguno.
  // ------------------Retorno-----------------------
  //   @returns {Promise<void>}
  // -----------------------------------------------
  const handleSolicitarGratuito = async (): Promise<void> => {
    if (!user) return;

    let payload: Record<string, unknown> = {
      idEstudiante: user.id,
      esDePago: false,
      costo: 0,
    };

    let nombreDoc = '';

    if (tipoCertGratis === 'alumno_regular') {
      nombreDoc = 'Certificado de Alumno Regular';
      if (propositoSeleccionado === 'Para ser presentado a una institución' && !institucionDestino.trim()) {
        alert('Por favor ingrese el nombre de la institución de destino.');
        return;
      }
      payload = {
        ...payload,
        idCertificado: 1,
        periodo: periodoSeleccionado,
        proposito: propositoSeleccionado,
        institucionDestino:
          propositoSeleccionado === 'Para ser presentado a una institución'
            ? institucionDestino.trim()
            : null,
      };
    } else if (tipoCertGratis === 'arancel_matricula') {
      nombreDoc = 'Certificado de Arancel y Matrícula';
      if (propositoSeleccionado === 'Para ser presentado a una institución' && !institucionDestino.trim()) {
        alert('Por favor ingrese el nombre de la institución de destino.');
        return;
      }
      payload = {
        ...payload,
        idCertificado: 2,
        periodo: anioSeleccionado,
        proposito: propositoSeleccionado,
        institucionDestino:
          propositoSeleccionado === 'Para ser presentado a una institución'
            ? institucionDestino.trim()
            : null,
      };
    } else if (tipoCertGratis === 'seguro_practica') {
      nombreDoc = 'Seguro de Práctica';
      if (!empresaRut.trim() || !empresaNombre.trim() || !fechaInicio || !fechaTermino) {
        alert('Por favor complete todos los datos requeridos para el seguro de práctica.');
        return;
      }
      if (fechaInicio > fechaTermino) {
        alert('La fecha de inicio no puede ser posterior a la fecha de término.');
        return;
      }
      payload = {
        ...payload,
        idCertificado: 3,
        tipoPractica,
        empresaRut: empresaRut.trim(),
        empresaNombre: empresaNombre.trim(),
        fechaInicio,
        fechaTermino,
      };
    }

    setProcesandoSolicitud(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/certificados/solicitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const datos = await res.json();
      if (res.ok && datos.success) {
        const nuevaSol: SolicitudCertificadoItem = {
          ...datos.solicitud,
          nombre_certificado: nombreDoc,
        };
        setSolicitudes((prev) => [nuevaSol, ...prev]);
        iniciarTemporizadorGratuito(nuevaSol.id, nombreDoc, datos.codigoVerificacion);
      } else {
        alert(datos.error || 'Ocurrió un error al procesar su solicitud.');
      }
    } catch (err) {
      console.error('Error al solicitar certificado gratuito:', err);
      alert('Error de conexión al emitir el certificado. Intente nuevamente.');
    } finally {
      setProcesandoSolicitud(false);
    }
  };

  // -------------------Función----------------------
  //   handleSolicitarGrado:
  //       Registra una solicitud de grado académico (de pago).
  // ------------------Parámetros-------------------
  //   Ninguno.
  // ------------------Retorno-----------------------
  //   @returns {Promise<void>}
  // -----------------------------------------------
  const handleSolicitarGrado = async (): Promise<void> => {
    if (!user) return;
    setProcesandoSolicitud(true);

    const costo = preciosGrados[gradoTipo] || 25000;
    const nombreDoc = `Certificado de Grado - ${gradoTipo}`;

    try {
      const res = await fetch(`${API_BASE_URL}/api/certificados/solicitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idEstudiante: user.id,
          esDePago: true,
          gradoTipo,
          costo,
        }),
      });

      const datos = await res.json();
      if (res.ok && datos.success) {
        const nuevaSol: SolicitudCertificadoItem = {
          ...datos.solicitud,
          nombre_certificado: nombreDoc,
          grado_tipo: gradoTipo,
        };
        setSolicitudes((prev) => [nuevaSol, ...prev]);
        iniciarTemporizadorPago(nuevaSol.id);
        setModalExito({
          titulo: 'Solicitud de Grado Ingresada',
          mensaje:
            `Su trámite para "${nombreDoc}" ha sido recepcionado en estado ` +
            `"En revisión". En breves instantes se validarán sus antecedentes ` +
            `y se habilitará el botón de pago.`,
          codigo: datos.codigoVerificacion,
        });
      } else {
        alert(datos.error || 'Error al ingresar solicitud de grado.');
      }
    } catch (err) {
      console.error('Error al solicitar grado:', err);
      alert('Error de conexión al solicitar el certificado de grado.');
    } finally {
      setProcesandoSolicitud(false);
    }
  };

  // -------------------Función----------------------
  //   handleConfirmarPagoMimica:
  //       Ejecuta la mímica inmediata del pago y transiciona
  //       la solicitud a 'Disponible para retiro'.
  // ------------------Parámetros-------------------
  //   Ninguno.
  // ------------------Retorno-----------------------
  //   @returns {Promise<void>}
  // -----------------------------------------------
  const handleConfirmarPagoMimica = async (): Promise<void> => {
    if (!solicitudAPagar || !user) return;
    setProcesandoPago(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/certificados/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idSolicitud: solicitudAPagar.id,
          idEstudiante: user.id,
          metodoPago: metodoPagoSeleccionado,
          monto: solicitudAPagar.costo,
        }),
      });

      const datos = await res.json();
      if (res.ok && datos.success) {
        setSolicitudes((prev) =>
          prev.map((item) =>
            item.id === solicitudAPagar.id
              ? {
                  ...item,
                  estado: 'Disponible para retiro',
                  metodo_pago: metodoPagoSeleccionado,
                }
              : item
          )
        );
        const docNombre =
          solicitudAPagar.nombre_certificado ||
          `Certificado de Grado (${solicitudAPagar.grado_tipo || ''})`;
        setSolicitudAPagar(null);
        setModalExito({
          titulo: '¡Pago Realizado Exitosamente!',
          mensaje:
            `Se ha recibido conforme el pago de $${Number(solicitudAPagar.costo).toLocaleString('es-CL')} ` +
            `mediante ${metodoPagoSeleccionado} para el trámite "${docNombre}". ` +
            `El certificado físico se encuentra disponible para su retiro presencial.`,
          codigo: solicitudAPagar.codigo_verificacion,
          detalleExtra:
            'Lugar de retiro: Secretaría de Estudios (Campus San Joaquín, ' +
            'Av. Vicuña Mackenna 3939). Horario: Lunes a Viernes de 09:00 a 17:00 hrs.',
        });
      } else {
        alert(datos.error || 'Ocurrió un error al procesar el pago.');
      }
    } catch (err) {
      console.error('Error al procesar pago mimica:', err);
      alert('Error de comunicación con la pasarela de pagos.');
    } finally {
      setProcesandoPago(false);
    }
  };

  // Filtrado de listas de historial
  const solicitudesGratis = solicitudes.filter((s) => !s.es_de_pago);
  const solicitudesPago = solicitudes.filter((s) => s.es_de_pago);

  if (!user) return null;

  return (
    <div className="layout-principal">
      <Header setVista={handleBack} perfil={user.perfil} />

      <main className="main-content cert-main">
        {/* Cabecera del Módulo */}
        <section className="cert-header">
          <h2>Portal de Certificados Académicos</h2>
          <p>
            Emisión digital de certificados sin costo y tramitación oficial de
            certificados de grado académico de la Universidad Técnica Federico Santa María.
          </p>

          {/* Navegación por pestañas institucionales */}
          <div className="cert-tabs-navegacion">
            <button
              className={`tab-btn ${tabActiva === 'gratis' ? 'activa' : ''}`}
              onClick={() => setTabActiva('gratis')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tab-icon">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Certificados sin Costo
            </button>

            <button
              className={`tab-btn ${tabActiva === 'pago' ? 'activa' : ''}`}
              onClick={() => setTabActiva('pago')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tab-icon">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
              Certificados de Grado (Con Pago)
            </button>
          </div>
        </section>

        {/* ------------------- PESTAÑA: CERTIFICADOS SIN COSTO ------------------- */}
        {tabActiva === 'gratis' && (
          <section className="tab-contenido-animado">
            {/* Formulario de Solicitud de Certificados Gratuitos */}
            <div className="cert-card-formulario">
              <div className="card-titulo-seccion">
                <h3>Solicitar Certificado Gratuito</h3>
                <span className="badge-costo-cero">Trámite Gratuito</span>
              </div>
              <p className="card-subtitulo">
                Seleccione el documento que requiere y complete las configuraciones solicitadas.
              </p>

              <div className="grid-formulario">
                {/* Selector de Certificado */}
                <div className="form-grupo">
                  <label htmlFor="select-tipo-cert">Tipo de Certificado:</label>
                  <select
                    id="select-tipo-cert"
                    value={tipoCertGratis}
                    onChange={(e) => setTipoCertGratis(e.target.value)}
                    className="input-select-usm"
                  >
                    <option value="alumno_regular">Certificado de Alumno Regular</option>
                    <option value="arancel_matricula">Certificado de Arancel y Matrícula</option>
                    <option value="seguro_practica">Seguro de Práctica</option>
                  </select>
                </div>

                {/* Configuraciones específicas: Certificado de Alumno Regular */}
                {tipoCertGratis === 'alumno_regular' && (
                  <>
                    <div className="form-grupo">
                      <label htmlFor="select-periodo">Periodo Cursado (Semestre):</label>
                      <select
                        id="select-periodo"
                        value={periodoSeleccionado}
                        onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                        className="input-select-usm"
                      >
                        {listaSemestresDisponibles.map((sem) => (
                          <option key={sem} value={sem}>
                            {sem === '2026-2' ? `${sem} (Semestre Vigente)` : sem}
                          </option>
                        ))}
                      </select>
                      <small className="help-text">
                        {anioIngresoReal === null ? 'Año de ingreso no registrado. Solicita su actualización para seleccionar un período.' : `Habilitado según año de admisión institucional (${anioIngresoReal}).`}
                      </small>
                    </div>

                    <div className="form-grupo">
                      <label htmlFor="select-proposito-ar">Propósito del Certificado:</label>
                      <select
                        id="select-proposito-ar"
                        value={propositoSeleccionado}
                        onChange={(e) => setPropositoSeleccionado(e.target.value)}
                        className="input-select-usm"
                      >
                        <option value="Fines que se estime conveniente">Fines que se estime conveniente</option>
                        <option value="Asignación familiar">Asignación familiar</option>
                        <option value="Pensión de orfandad">Pensión de orfandad</option>
                        <option value="Presentarse a JUNAEB">Presentarse a JUNAEB</option>
                        <option value="Para presentárselo al servicio militar">
                          Para presentárselo al servicio militar
                        </option>
                        <option value="Para ser presentado a una institución">
                          Para ser presentado a una institución
                        </option>
                      </select>
                    </div>

                    {propositoSeleccionado === 'Para ser presentado a una institución' && (
                      <div className="form-grupo span-completo">
                        <label htmlFor="input-institucion-ar">Nombre de la Institución Destinataria:</label>
                        <input
                          id="input-institucion-ar"
                          type="text"
                          className="input-text-usm"
                          placeholder="Ej: Banco de Chile, Municipalidad de Santiago, Ministerio de Educación..."
                          value={institucionDestino}
                          onChange={(e) => setInstitucionDestino(e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Configuraciones específicas: Certificado de Arancel y Matrícula */}
                {tipoCertGratis === 'arancel_matricula' && (
                  <>
                    <div className="form-grupo">
                      <label htmlFor="select-anio-am">Año Académico:</label>
                      <select
                        id="select-anio-am"
                        value={anioSeleccionado}
                        onChange={(e) => setAnioSeleccionado(e.target.value)}
                        className="input-select-usm"
                      >
                        {listaAniosDisponibles.map((a) => (
                          <option key={a} value={a}>
                            {a === 2026 ? `${a} (Año Vigente)` : a}
                          </option>
                        ))}
                      </select>
                      <small className="help-text">
                        {anioIngresoReal === null ? 'Año de ingreso no registrado. Solicita su actualización para seleccionar un año.' : `Opciones válidas desde admisión (${anioIngresoReal}) hasta la fecha.`}
                      </small>
                    </div>

                    <div className="form-grupo">
                      <label htmlFor="select-proposito-am">Propósito del Certificado:</label>
                      <select
                        id="select-proposito-am"
                        value={propositoSeleccionado}
                        onChange={(e) => setPropositoSeleccionado(e.target.value)}
                        className="input-select-usm"
                      >
                        <option value="Fines que se estime conveniente">Fines que se estime conveniente</option>
                        <option value="Asignación familiar">Asignación familiar</option>
                        <option value="Pensión de orfandad">Pensión de orfandad</option>
                        <option value="Para ser presentado a una institución">
                          Para ser presentado a una institución
                        </option>
                      </select>
                    </div>

                    {propositoSeleccionado === 'Para ser presentado a una institución' && (
                      <div className="form-grupo span-completo">
                        <label htmlFor="input-institucion-am">Nombre de la Institución Destinataria:</label>
                        <input
                          id="input-institucion-am"
                          type="text"
                          className="input-text-usm"
                          placeholder="Ej: Servicio de Impuestos Internos, Isapre, Caja de Compensación..."
                          value={institucionDestino}
                          onChange={(e) => setInstitucionDestino(e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Configuraciones específicas: Seguro de Práctica */}
                {tipoCertGratis === 'seguro_practica' && (
                  <>
                    <div className="form-grupo">
                      <label htmlFor="select-tipo-practica">Modalidad de Práctica:</label>
                      <select
                        id="select-tipo-practica"
                        value={tipoPractica}
                        onChange={(e) => setTipoPractica(e.target.value)}
                        className="input-select-usm"
                      >
                        <option value="Práctica Industrial">Práctica Industrial</option>
                        <option value="Práctica Profesional">Práctica Profesional</option>
                      </select>
                    </div>

                    <div className="form-grupo">
                      <label htmlFor="input-empresa-rut">RUT de la Empresa:</label>
                      <input
                        id="input-empresa-rut"
                        type="text"
                        className="input-text-usm"
                        placeholder="Ej: 76.543.210-K"
                        value={empresaRut}
                        onChange={(e) => setEmpresaRut(e.target.value)}
                      />
                    </div>

                    <div className="form-grupo span-completo">
                      <label htmlFor="input-empresa-nombre">Nombre o Razón Social de la Empresa:</label>
                      <input
                        id="input-empresa-nombre"
                        type="text"
                        className="input-text-usm"
                        placeholder="Ej: Codelco Chile, Microsoft SpA, Falabella..."
                        value={empresaNombre}
                        onChange={(e) => setEmpresaNombre(e.target.value)}
                      />
                    </div>

                    <div className="form-grupo">
                      <label htmlFor="input-fecha-inicio">Fecha de Inicio de Práctica:</label>
                      <input
                        id="input-fecha-inicio"
                        type="date"
                        className="input-text-usm"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                      />
                    </div>

                    <div className="form-grupo">
                      <label htmlFor="input-fecha-termino">Fecha de Término de Práctica:</label>
                      <input
                        id="input-fecha-termino"
                        type="date"
                        className="input-text-usm"
                        value={fechaTermino}
                        onChange={(e) => setFechaTermino(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Botón de envío */}
              <div className="form-acciones">
                <button
                  type="button"
                  className="btn-usm-primario"
                  onClick={handleSolicitarGratuito}
                  disabled={procesandoSolicitud}
                >
                  {procesandoSolicitud ? (
                    <>
                      <span className="spinner-micro"></span> Generando...
                    </>
                  ) : (
                    'Solicitar Certificado'
                  )}
                </button>
              </div>
            </div>

            {/* Historial de Solicitudes Gratuitas */}
            <div className="cert-historial-seccion">
              <div className="historial-cabecera">
                <h3>Historial de Certificados Gratuitos Solicitados</h3>
                <span className="contador-solicitudes">{solicitudesGratis.length} registros</span>
              </div>

              <div className="tabla-responsive-container">
                <table className="tabla-certificados-moderna">
                  <thead>
                    <tr>
                      <th>Documento</th>
                      <th>Detalles y Configuración</th>
                      <th>Fecha de Solicitud</th>
                      <th>Código Verificador</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargandoSolicitudes ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <span className="spinner-micro"></span> Cargando historial de certificados...
                        </td>
                      </tr>
                    ) : solicitudesGratis.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="cert-vacio">
                          No tienes solicitudes de certificados gratuitos registradas aún.
                        </td>
                      </tr>
                    ) : (
                      solicitudesGratis.map((sol) => (
                        <tr key={sol.id}>
                          <td className="font-semibold text-usm">
                            {sol.nombre_certificado || 'Certificado Académico'}
                          </td>
                          <td className="detalle-celda">
                            {sol.periodo && <span>Periodo: <strong>{sol.periodo}</strong><br /></span>}
                            {sol.proposito && <span>Propósito: {sol.proposito}<br /></span>}
                            {sol.institucion_destino && (
                              <span>Institución: <em>{sol.institucion_destino}</em><br /></span>
                            )}
                            {sol.tipo_practica && (
                              <span>
                                {sol.tipo_practica} en <strong>{sol.empresa_nombre}</strong>
                              </span>
                            )}
                          </td>
                          <td>{new Date(sol.fecha_solicitud).toLocaleDateString('es-CL')}</td>
                          <td>
                            <code className="codigo-chip">{sol.codigo_verificacion}</code>
                          </td>
                          <td>
                            {sol.estado === 'Pendiente' ? (
                              <span className="badge-estado badge-pendiente">
                                <span className="dot-pulsante"></span> Pendiente
                              </span>
                            ) : (
                              <span className="badge-estado badge-emitido">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  className="mini-check"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Emitido
                              </span>
                            )}
                          </td>
                          <td>
                            {sol.estado === 'Emitido' ? (
                              <button
                                className="btn-accion-ver"
                                onClick={() => setCertificadoVistaPrevia(sol)}
                                title="Ver vista previa del certificado emitido"
                              >
                                Descargar / Ver
                              </button>
                            ) : (
                              <span className="texto-espera">Generando...</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ------------------- PESTAÑA: CERTIFICADOS DE GRADO (CON PAGO) ------------------- */}
        {tabActiva === 'pago' && (
          <section className="tab-contenido-animado">
            {/* Sección Informativa: Retiro Presencial en San Joaquín */}
            <div className="alerta-retiro-presencial">
              <div className="retiro-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="retiro-icon">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className="retiro-info-texto">
                <h4>Información de Retiro Presencial de Certificados de Grado</h4>
                <p>
                  Los certificados de grado académico corresponden a documentos legales oficiales,
                  timbrados con cuño institucional y firma de autoridades universitarias. Por esta razón,
                  <strong> deben ser retirados presencialmente</strong> una vez completado el trámite y cancelado
                  su arancel.
                </p>
                <div className="retiro-detalles-grid">
                  <div>
                    <strong>Lugar de Entrega:</strong> Secretaría de Estudios / Secretaría Docente
                  </div>
                  <div>
                    <strong>Campus:</strong> San Joaquín — Universidad Técnica Federico Santa María
                  </div>
                  <div>
                    <strong>Dirección:</strong> Av. Vicuña Mackenna 3939, San Joaquín,
                    Santiago, Región Metropolitana
                  </div>
                  <div>
                    <strong>Horario de Atención:</strong> Lunes a Viernes de 09:00 a 13:00 y de 14:00 a 17:00 hrs.
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de Solicitud de Certificados de Grado */}
            <div className="cert-card-formulario">
              <div className="card-titulo-seccion">
                <h3>Solicitar Certificado de Grado Académico</h3>
                <span className="badge-tramite-pago">Trámite Arancelado</span>
              </div>
              <p className="card-subtitulo">
                Seleccione el grado universitario a certificar. El trámite entrará en revisión inicial
                y no requerirá pago inmediato.
              </p>

              <div className="grid-formulario">
                <div className="form-grupo">
                  <label htmlFor="select-tipo-grado">Grado Académico:</label>
                  <select
                    id="select-tipo-grado"
                    value={gradoTipo}
                    onChange={(e) => setGradoTipo(e.target.value)}
                    className="input-select-usm"
                  >
                    <option value="Bachiller">Bachiller en Ciencias de la Ingeniería</option>
                    <option value="Licenciatura">Licenciatura en Ciencias de la Ingeniería</option>
                    <option value="Título de Ingeniería">Título Profesional de Ingeniero Civil</option>
                  </select>
                </div>

                {/* Tarjeta de Resumen de Arancel */}
                <div className="tarjeta-precio-grado">
                  <div className="precio-rotulo">Arancel Oficial del Documento</div>
                  <div className="precio-valor">
                    ${(preciosGrados[gradoTipo] || 25000).toLocaleString('es-CL')} CLP
                  </div>
                  <div className="precio-aclaracion">
                    Valores fijados por la Dirección de Finanzas para el año académico 2026.
                  </div>
                </div>
              </div>

              {/* Botón para solicitar sin pago inmediato */}
              <div className="form-acciones">
                <button
                  type="button"
                  className="btn-usm-primario"
                  onClick={handleSolicitarGrado}
                  disabled={procesandoSolicitud}
                >
                  {procesandoSolicitud ? (
                    <>
                      <span className="spinner-micro"></span> Procesando Solicitud...
                    </>
                  ) : (
                    'Solicitar Certificado de Grado'
                  )}
                </button>
              </div>
            </div>

            {/* Historial de Certificados de Grado y Pago */}
            <div className="cert-historial-seccion">
              <div className="historial-cabecera">
                <h3>Historial de Certificados de Grado y Trámites de Pago</h3>
                <span className="contador-solicitudes">{solicitudesPago.length} trámites</span>
              </div>

              <div className="tabla-responsive-container">
                <table className="tabla-certificados-moderna">
                  <thead>
                    <tr>
                      <th>Documento / Grado</th>
                      <th>Arancel</th>
                      <th>Fecha de Solicitud</th>
                      <th>Código Verificador</th>
                      <th>Estado</th>
                      <th>Acción / Gestión de Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargandoSolicitudes ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <span className="spinner-micro"></span> Cargando trámites arancelados...
                        </td>
                      </tr>
                    ) : solicitudesPago.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="cert-vacio">
                          No registras solicitudes de certificados de grado en el sistema.
                        </td>
                      </tr>
                    ) : (
                      solicitudesPago.map((sol) => (
                        <tr key={sol.id}>
                          <td className="font-semibold text-usm">
                            {sol.nombre_certificado || `Certificado de Grado (${sol.grado_tipo})`}
                          </td>
                          <td className="font-semibold">
                            ${Number(sol.costo).toLocaleString('es-CL')}
                          </td>
                          <td>{new Date(sol.fecha_solicitud).toLocaleDateString('es-CL')}</td>
                          <td>
                            <code className="codigo-chip">{sol.codigo_verificacion}</code>
                          </td>
                          <td>
                            {sol.estado === 'En revisión' && (
                              <span className="badge-estado badge-revision">
                                <span className="dot-pulsante dot-naranja"></span> En revisión
                              </span>
                            )}
                            {sol.estado === 'Por pagar' && (
                              <span className="badge-estado badge-por-pagar">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="mini-icon"
                                >
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="12" y1="8" x2="12" y2="12"></line>
                                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                Por pagar
                              </span>
                            )}
                            {sol.estado === 'Disponible para retiro' && (
                              <span className="badge-estado badge-retiro">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="mini-icon"
                                >
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                  <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                Disponible para retiro
                              </span>
                            )}
                            {sol.estado !== 'En revisión' &&
                              sol.estado !== 'Por pagar' &&
                              sol.estado !== 'Disponible para retiro' && (
                                <span className="badge-estado badge-emitido">{sol.estado}</span>
                              )}
                          </td>
                          <td>
                            {sol.estado === 'Por pagar' && (
                              <button
                                className="btn-pagar-ahora"
                                onClick={() => setSolicitudAPagar(sol)}
                                title="Pagar arancel del certificado"
                              >
                                Pagar (${Number(sol.costo).toLocaleString('es-CL')})
                              </button>
                            )}
                            {sol.estado === 'En revisión' && (
                              <span className="texto-espera">Evaluando antecedentes...</span>
                            )}
                            {sol.estado === 'Disponible para retiro' && (
                              <div className="accion-retiro-box">
                                <span className="retiro-label">Retirar en San Joaquín</span>
                                <button
                                  className="btn-ver-comprobante"
                                  onClick={() => setCertificadoVistaPrevia(sol)}
                                >
                                  Ver Comprobante
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ------------------- MODAL: MÍMICA DE PASARELA DE PAGO ------------------- */}
      {solicitudAPagar && (
        <div className="modal-overlay">
          <div className="modal-container modal-pasarela-pago">
            <div className="modal-cabecera-pago">
              <div className="titulo-con-logo">
                <div className="escudo-usm-mini">USM</div>
                <div>
                  <h3>Pasarela Institucional de Pagos</h3>
                  <p>Trámites Arancelados y Certificados de Grado</p>
                </div>
              </div>
              <button
                className="btn-cerrar-modal"
                onClick={() => setSolicitudAPagar(null)}
                disabled={procesandoPago}
              >
                ✕
              </button>
            </div>

            <div className="resumen-cobro-box">
              <div className="resumen-item">
                <span className="resumen-label">Documento:</span>
                <span className="resumen-valor font-semibold">
                  {solicitudAPagar.nombre_certificado || `Certificado (${solicitudAPagar.grado_tipo})`}
                </span>
              </div>
              <div className="resumen-item">
                <span className="resumen-label">Código de Trámite:</span>
                <span className="resumen-valor">
                  <code>{solicitudAPagar.codigo_verificacion}</code>
                </span>
              </div>
              <div className="resumen-item total-item">
                <span className="resumen-label">Monto a Cancelar:</span>
                <span className="resumen-monto">
                  ${Number(solicitudAPagar.costo).toLocaleString('es-CL')} CLP
                </span>
              </div>
            </div>

            <div className="metodos-pago-selector">
              <label className="metodos-titulo">Seleccione el Medio de Pago:</label>

              {/* Opción 1: Webpay */}
              <label
                className={`opcion-medio-pago ${
                  metodoPagoSeleccionado === 'Webpay' ? 'seleccionado' : ''
                }`}
              >
                <input
                  type="radio"
                  name="metodo_pago"
                  value="Webpay"
                  checked={metodoPagoSeleccionado === 'Webpay'}
                  onChange={() => setMetodoPagoSeleccionado('Webpay')}
                />
                <div className="metodo-info">
                  <div className="metodo-nombre">Webpay Plus (Redcompra / Crédito / Débito)</div>
                  <div className="metodo-desc">
                    Pago electrónico seguro con tarjetas nacionales e internacionales.
                  </div>
                </div>
              </label>

              {/* Opción 2: Tarjeta asociada */}
              <label
                className={`opcion-medio-pago ${
                  metodoPagoSeleccionado === 'Tarjeta asociada a la cuenta' ? 'seleccionado' : ''
                }`}
              >
                <input
                  type="radio"
                  name="metodo_pago"
                  value="Tarjeta asociada a la cuenta"
                  checked={metodoPagoSeleccionado === 'Tarjeta asociada a la cuenta'}
                  onChange={() => setMetodoPagoSeleccionado('Tarjeta asociada a la cuenta')}
                />
                <div className="metodo-info">
                  <div className="metodo-nombre">Tarjeta Asociada a la Cuenta Institucional</div>
                  <div className="metodo-desc">Cargo directo a tu medio bancario registrado en el perfil.</div>
                </div>
              </label>

              {/* Opción 3: Transferencia */}
              <label
                className={`opcion-medio-pago ${
                  metodoPagoSeleccionado === 'Transferencia' ? 'seleccionado' : ''
                }`}
              >
                <input
                  type="radio"
                  name="metodo_pago"
                  value="Transferencia"
                  checked={metodoPagoSeleccionado === 'Transferencia'}
                  onChange={() => setMetodoPagoSeleccionado('Transferencia')}
                />
                <div className="metodo-info">
                  <div className="metodo-nombre">Transferencia Bancaria Inmediata</div>
                  <div className="metodo-desc">Traspaso directo a la cuenta corriente central de la UTFSM.</div>
                </div>
              </label>
            </div>

            <div className="modal-acciones-pago">
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => setSolicitudAPagar(null)}
                disabled={procesandoPago}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-confirmar-pago"
                onClick={handleConfirmarPagoMimica}
                disabled={procesandoPago}
              >
                {procesandoPago ? (
                  <>
                    <span className="spinner-micro"></span> Procesando Pago...
                  </>
                ) : (
                  `Confirmar Pago de $${Number(solicitudAPagar.costo).toLocaleString('es-CL')}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- MODAL: ALERTA Y MENSAJE DE ÉXITO ------------------- */}
      {modalExito && (
        <div className="modal-overlay">
          <div className="modal-container pop-up-exito">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="exito-icon">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h3>{modalExito.titulo}</h3>
            <p className="mensaje-principal">{modalExito.mensaje}</p>

            {modalExito.codigo && (
              <div className="chip-codigo-box">
                <span className="label-cod">Código de Verificación Oficial:</span>
                <strong className="valor-cod">{modalExito.codigo}</strong>
              </div>
            )}

            {modalExito.detalleExtra && (
              <div className="aviso-retiro-destacado">
                {modalExito.detalleExtra}
              </div>
            )}

            <button className="btn-aceptar-popup" onClick={() => setModalExito(null)}>
              Entendido y Aceptar
            </button>
          </div>
        </div>
      )}

      {/* ------------------- MODAL: VISTA PREVIA DEL DOCUMENTO OFICIAL ------------------- */}
      {certificadoVistaPrevia && (
        <div className="modal-overlay">
          <div className="modal-container modal-vista-certificado">
            <div className="doc-preview-encabezado">
              <div className="doc-logo-box">
                <div className="doc-escudo-usm">UTFSM</div>
                <div className="doc-institucion-text">
                  <strong>UNIVERSIDAD TÉCNICA FEDERICO SANTA MARÍA</strong>
                  <span>Secretaría General • Dirección General de Docencia</span>
                </div>
              </div>
              <button className="btn-cerrar-preview" onClick={() => setCertificadoVistaPrevia(null)}>
                ✕
              </button>
            </div>

            <div className="doc-preview-cuerpo">
              <h2 className="doc-titulo-principal">
                {certificadoVistaPrevia.nombre_certificado ||
                  `CERTIFICADO ACADÉMICO OFICIAL (${certificadoVistaPrevia.grado_tipo || ''})`}
              </h2>

              <p className="doc-parrafo-cuerpo">
                La Dirección de Registro y Secretaría General de la Universidad Técnica Federico
                Santa María certifica que don/doña <strong>{user.nombre}</strong>, Cédula de Identidad{' '}
                <strong>{user.rut}</strong>:
              </p>

              {certificadoVistaPrevia.periodo && (
                <div className="doc-clausula">
                  • Se encuentra registrado(a) académica y arancelariamente durante el periodo lectivo{' '}
                  <strong>{certificadoVistaPrevia.periodo}</strong>.
                </div>
              )}

              {certificadoVistaPrevia.proposito && (
                <div className="doc-clausula">
                  • El presente documento es emitido para ser presentado con fines de:{' '}
                  <strong>{certificadoVistaPrevia.proposito}</strong>
                  {certificadoVistaPrevia.institucion_destino
                    ? ` ante la entidad: ${certificadoVistaPrevia.institucion_destino}`
                    : ''}
                  .
                </div>
              )}

              {certificadoVistaPrevia.tipo_practica && (
                <div className="doc-clausula">
                  • Cuenta con la cobertura legal del Seguro Escolar (Ley N° 16.744) para su{' '}
                  <strong>{certificadoVistaPrevia.tipo_practica}</strong> en la entidad{' '}
                  <strong>{certificadoVistaPrevia.empresa_nombre}</strong> (RUT:{' '}
                  {certificadoVistaPrevia.empresa_rut}), desde {certificadoVistaPrevia.fecha_inicio} hasta{' '}
                  {certificadoVistaPrevia.fecha_termino}.
                </div>
              )}

              {certificadoVistaPrevia.grado_tipo && (
                <div className="doc-clausula">
                  • Ha cumplido satisfactoriamente las exigencias académicas para la obtención del grado de:{' '}
                  <strong>{certificadoVistaPrevia.grado_tipo}</strong>.
                  <br />
                  <span className="text-sm text-gray-500">
                    Trámite arancelado cancelado mediante{' '}
                    {certificadoVistaPrevia.metodo_pago || 'Pasarela USM'}. Retiro en Secretaría de
                    Estudios de Campus San Joaquín.
                  </span>
                </div>
              )}

              <div className="doc-sello-verificacion">
                <div>
                  <strong>Código de Validación Pública:</strong>
                  <code>{certificadoVistaPrevia.codigo_verificacion}</code>
                </div>
                <div>
                  <strong>Fecha de Emisión:</strong>{' '}
                  {new Date(certificadoVistaPrevia.fecha_solicitud).toLocaleString('es-CL')}
                </div>
              </div>
            </div>

            <div className="doc-preview-footer">
              <button
                className="btn-descargar-simulado"
                onClick={() => {
                  alert(
                    `El certificado ${certificadoVistaPrevia.codigo_verificacion} ` +
                    `ha sido descargado en su dispositivo.`
                  );
                  setCertificadoVistaPrevia(null);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mini-icon">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Descargar Documento PDF Timbrado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
