// -------------------Configuración del Servidor----------------------
// Servidor API REST en Node.js / Express con PostgreSQL
// Plataforma: Portal de Autoservicio Institucional (UTFSM)
// -------------------------------------------------------------------

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// -------------------Conexión a Base de Datos------------------------
// Instancia del pool de conexiones hacia PostgreSQL mediante
// variables de entorno proporcionadas por el contenedor Docker.
// -------------------------------------------------------------------
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// --------------------Endpoint REST--------------------
//   POST /api/login
//   Descripción:
//       Valida las credenciales institucionales de un usuario
//       y retorna la información básica de su perfil.
// -----------------Parámetros Body (JSON)---------------
//       - rut {string}: RUT del usuario con guion y sin puntos.
//       - password {string}: Contraseña institucional.
// ------------------Respuestas HTTP---------------------
//       - 200 OK: Autenticación exitosa con datos de usuario.
//       - 401 Unauthorized: Credenciales incorrectas.
//       - 500 Internal Error: Error de conexión con la base de datos.
// -----------------------------------------------------
app.post('/api/login', async (req, res) => {
  const { rut, password } = req.body;
  try {
    const consultaSql = 
      'SELECT id, rut, perfil, nombre, situacion_academica ' +
      'FROM usuarios WHERE rut = $1 AND password = $2';
    const resultado = await pool.query(consultaSql, [rut, password]);

    if (resultado.rows.length > 0) {
      res.json({ success: true, user: resultado.rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// --------------------Endpoint REST--------------------
//   GET /api/usuario/info/:id
//   Descripción:
//       Obtiene los antecedentes académicos y de contacto
//       asociados a un usuario específico.
// -----------------Parámetros Ruta----------------------
//       - id {number}: Identificador primario del usuario.
// ------------------Respuestas HTTP---------------------
//       - 200 OK: Datos del perfil académico recuperados.
//       - 500 Internal Error: Error al consultar el perfil.
// -----------------------------------------------------
app.get('/api/usuario/info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const consultaSql = 
      'SELECT rut, nombre, perfil, carrera, situacion_academica, ' +
      'email, email_personal, email_apoderado, telefono, direccion ' +
      'FROM usuarios WHERE id = $1';
    const resultado = await pool.query(consultaSql, [id]);
    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// --------------------Endpoint REST--------------------
//   GET /api/perfil/bancario/:idEstudiante
//   Descripción:
//       Obtiene la información de cuenta bancaria registrada por
//       el alumno para devoluciones institucionales.
// -----------------Parámetros Ruta----------------------
//       - idEstudiante {number}: Identificador del estudiante.
// ------------------Respuestas HTTP---------------------
//       - 200 OK: Datos bancarios del alumno.
//       - 500 Internal Error: Error al consultar la cuenta.
// -----------------------------------------------------
app.get('/api/perfil/bancario/:idEstudiante', async (req, res) => {
  try {
    const idEstudiante = req.params.idEstudiante || req.params.id_estudiante;
    const consultaSql = 
      'SELECT banco, tipo_cuenta, numero_cuenta, rut_titular ' +
      'FROM usuarios WHERE id = $1';
    const resultado = await pool.query(consultaSql, [idEstudiante]);
    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener datos bancarios' });
  }
});

// --------------------Endpoint REST--------------------
//   PUT /api/perfil/bancario/:idEstudiante
//   Descripción:
//       Actualiza la información de la cuenta bancaria del
//       estudiante para transferencias de beneficios o saldos.
// -----------------Parámetros Body (JSON)---------------
//       - banco {string}: Nombre de la entidad bancaria.
//       - tipo_cuenta {string}: Tipo de cuenta registrada.
//       - numero_cuenta {string}: Número de cuenta bancaria.
//       - rut_titular {string}: RUT del titular de la cuenta.
// ------------------Respuestas HTTP---------------------
//       - 200 OK: Datos actualizados correctamente.
//       - 500 Internal Error: Error al actualizar datos.
// -----------------------------------------------------
app.put('/api/perfil/bancario/:idEstudiante', async (req, res) => {
  try {
    const idEstudiante = req.params.idEstudiante || req.params.id_estudiante;
    const banco = req.body.banco;
    const tipoCuenta = req.body.tipo_cuenta || req.body.tipoCuenta;
    const numeroCuenta = req.body.numero_cuenta || req.body.numeroCuenta;
    const rutTitular = req.body.rut_titular || req.body.rutTitular;

    const actualizacionSql = 
      'UPDATE usuarios SET banco = $1, tipo_cuenta = $2, ' +
      'numero_cuenta = $3, rut_titular = $4 WHERE id = $5';
    await pool.query(actualizacionSql, [banco, tipoCuenta, numeroCuenta, rutTitular, idEstudiante]);
    res.status(200).json({ success: true, message: 'Datos actualizados.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar.' });
  }
});

// --------------------Endpoint REST--------------------
//   GET /api/finanzas/:idEstudiante
//   Descripción:
//       Consulta el estado de cuenta del estudiante, consolidando
//       arancel bruto, beneficios validados y saldo neto final.
// -----------------Parámetros Ruta----------------------
//       - idEstudiante {number}: Identificador del estudiante.
// ------------------Respuestas HTTP---------------------
//       - 200 OK: Resumen financiero y flag de becas pendientes.
//       - 404 Not Found: Cuenta no encontrada.
//       - 500 Internal Error: Error al consultar estado de cuenta.
// -----------------------------------------------------
app.get('/api/finanzas/:idEstudiante', async (req, res) => {
  try {
    const idEstudiante = req.params.idEstudiante || req.params.id_estudiante;
    const consultaFinanzas = 
      'SELECT arancel_bruto, beneficios_validados, saldo_neto ' +
      'FROM cuenta_estudiante WHERE id_estudiante = $1';
    const resultadoFinanzas = await pool.query(consultaFinanzas, [idEstudiante]);

    if (resultadoFinanzas.rows.length === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    // Validación de beneficios pendientes de aprobación
    const consultaPendientes = 
      "SELECT COUNT(*) AS total_pendientes FROM beneficios_estudiante " +
      "WHERE id_estudiante = $1 AND estado = 'Pendiente'";
    const resultadoPendientes = await pool.query(consultaPendientes, [idEstudiante]);
    const tienePendientes = parseInt(resultadoPendientes.rows[0].total_pendientes, 10) > 0;

    const respuestaFinanzas = {
      ...resultadoFinanzas.rows[0],
      tiene_pendientes: tienePendientes,
    };

    res.json(respuestaFinanzas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener finanzas' });
  }
});

// --------------------Endpoint REST--------------------
//   GET /api/finanzas/historial/:idEstudiante
//   Descripción:
//       Obtiene el historial cronológico de pagos y abonos
//       realizados a la cuenta arancelaria del estudiante.
// -----------------Parámetros Ruta----------------------
//       - idEstudiante {number}: Identificador del estudiante.
// ------------------Respuestas HTTP---------------------
//       - 200 OK: Lista de pagos ordenados descendentemente.
//       - 500 Internal Error: Error al consultar historial.
// -----------------------------------------------------
app.get('/api/finanzas/historial/:idEstudiante', async (req, res) => {
  try {
    const idEstudiante = req.params.idEstudiante || req.params.id_estudiante;
    const consultaSql = 
      'SELECT id, monto, fecha, mes_referencia, emisor ' +
      'FROM pagos WHERE id_estudiante = $1 ORDER BY fecha DESC';
    const resultado = await pool.query(consultaSql, [idEstudiante]);
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// --------------------Endpoint REST--------------------
//   POST /api/finanzas/pago
//   Descripción:
//       Procesa un abono financiero al arancel del estudiante,
//       registrando el pago y descontando de su saldo neto.
// -----------------Parámetros Body (JSON)---------------
//       - id_estudiante {number}: Identificador del alumno.
//       - monto_abono {number}: Monto a descontar de la deuda.
//       - mes_referencia {string}: Periodo o mes cancelado.
// ------------------Respuestas HTTP---------------------
//       - 200 OK: Pago procesado exitosamente.
//       - 500 Internal Error: Error transaccional en el pago.
// -----------------------------------------------------
app.post('/api/finanzas/pago', async (req, res) => {
  const idEstudiante = req.body.id_estudiante || req.body.idEstudiante;
  const montoAbono = req.body.monto_abono || req.body.montoAbono;
  const mesReferencia = req.body.mes_referencia || req.body.mesReferencia || null;

  try {
    await pool.query('BEGIN');
    const insercionPagoSql = 
      'INSERT INTO pagos (id_estudiante, monto, mes_referencia, emisor) ' +
      'VALUES ($1, $2, $3, $4)';
    await pool.query(insercionPagoSql, [idEstudiante, montoAbono, mesReferencia, 'Abono Estudiante']);

    const actualizacionSaldoSql = 
      'UPDATE cuenta_estudiante SET saldo_neto = saldo_neto - $1 ' +
      'WHERE id_estudiante = $2';
    await pool.query(actualizacionSaldoSql, [montoAbono, idEstudiante]);

    await pool.query('COMMIT');
    res.json({ success: true });
  } catch (e) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: 'Error procesando el pago' });
  }
});

// --------------------Endpoint REST--------------------
//   GET /api/beneficios/:idEstudiante
//   Descripción:
//       Obtiene la lista de beneficios y becas asignadas al
//       estudiante con su monto de cobertura, vigencia y estado.
//       (Corregido: consulta tabla beneficios_estudiante)
// -----------------Parámetros Ruta----------------------
//       - idEstudiante {number}: Identificador del estudiante.
// ------------------Respuestas HTTP---------------------
//       - 200 OK: Lista de beneficios obtenida con éxito.
//       - 500 Internal Error: Error al obtener beneficios.
// -----------------------------------------------------
app.get('/api/beneficios/:idEstudiante', async (req, res) => {
  try {
    const idEstudiante = req.params.idEstudiante || req.params.id_estudiante;
    const consultaSql = 
      'SELECT id, id_estudiante, nombre_beca, monto_cobertura, vigencia, estado ' +
      'FROM beneficios_estudiante WHERE id_estudiante = $1';
    const resultado = await pool.query(consultaSql, [idEstudiante]);
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener beneficios' });
  }
});

// -------------------Módulo de Consultas y Soporte-------------------
// Endpoints orientados a la gestión de tickets de ayuda técnica
// y académica tanto para alumnos como para personal administrativo.
// -------------------------------------------------------------------

// --------------------Endpoint REST--------------------
//   POST /api/consultas
//   Descripción:
//       Crea un nuevo ticket de consulta emitido por el alumno.
// -----------------Parámetros Body (JSON)---------------
//       - id_usuario {number}: ID del usuario que consulta.
//       - asunto {string}: Resumen de la solicitud.
//       - mensaje {string}: Descripción detallada del problema.
// ------------------Respuestas HTTP---------------------
//       - 200 OK: Ticket creado con éxito y entrega de ID.
//       - 500 Internal Error: Error al guardar la consulta.
// -----------------------------------------------------
app.post('/api/consultas', async (req, res) => {
  const idUsuario = req.body.id_usuario || req.body.idUsuario;
  const asunto = req.body.asunto;
  const mensaje = req.body.mensaje;

  try {
    const insercionSql = 
      "INSERT INTO consultas (id_usuario, asunto, mensaje, estado) " +
      "VALUES ($1, $2, $3, 'Pendiente') RETURNING id";
    const resultado = await pool.query(insercionSql, [idUsuario, asunto, mensaje]);
    res.status(200).json({ success: true, id_consulta: resultado.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear la consulta' });
  }
});

// --------------------Endpoint REST--------------------
//   GET /api/consultas/:idUsuario
//   Descripción:
//       Lista todas las consultas realizadas por un estudiante
//       ordenadas cronológicamente de forma descendente.
// -----------------Parámetros Ruta----------------------
//       - idUsuario {number}: Identificador del usuario.
// ------------------Respuestas HTTP---------------------
//       - 200 OK: Lista histórica de consultas y respuestas.
//       - 500 Internal Error: Error al consultar tickets.
// -----------------------------------------------------
app.get('/api/consultas/:idUsuario', async (req, res) => {
  try {
    const idUsuario = req.params.idUsuario || req.params.id_usuario;
    const consultaSql = 
      'SELECT id, fecha, asunto, estado, respuesta ' +
      'FROM consultas WHERE id_usuario = $1 ORDER BY fecha DESC';
    const resultado = await pool.query(consultaSql, [idUsuario]);
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo consultas' });
  }
});

// --------------------Endpoint REST--------------------
//   GET /api/admin/consultas/pendientes
//   Descripción:
//       Bandeja centralizada de soporte para el personal admin,
//       obteniendo consultas en estado Pendiente ordenadas por fecha.
// -----------------Parámetros---------------------------
//       Ninguno.
// ------------------Respuestas HTTP---------------------
//       - 200 OK: Lista de tickets pendientes de resolver.
//       - 500 Internal Error: Error al consultar bandeja.
// -----------------------------------------------------
app.get('/api/admin/consultas/pendientes', async (req, res) => {
  try {
    const consultaSql = `
      SELECT 
        c.id, 
        c.fecha, 
        c.asunto, 
        c.mensaje, 
        u.nombre, 
        u.email AS correo_institucional
      FROM consultas c
      JOIN usuarios u ON c.id_usuario = u.id
      WHERE c.estado = 'Pendiente'
      ORDER BY c.fecha ASC;
    `;
    const resultado = await pool.query(consultaSql);
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la bandeja de consultas pendientes' });
  }
});

// --------------------Endpoint REST--------------------
//   PUT /api/admin/consultas/responder/:id
//   Descripción:
//       Actualiza el estado de la consulta a Respondida, guarda
//       la respuesta del admin y simula el despacho de correo.
// -----------------Parámetros Ruta y Body---------------
//       - id {number}: Identificador de la consulta a resolver.
//       - respuesta {string}: Texto de resolución provisto.
//       - correo_alumno {string}: Destinatario para notificación.
// ------------------Respuestas HTTP---------------------
//       - 200 OK: Consulta respondida exitosamente.
//       - 500 Internal Error: Error al guardar resolución.
// -----------------------------------------------------
app.put('/api/admin/consultas/responder/:id', async (req, res) => {
  const { respuesta } = req.body;
  const correoAlumno = req.body.correo_alumno || req.body.correoAlumno;

  try {
    const actualizacionSql = 
      "UPDATE consultas SET estado = 'Respondida', respuesta = $1 WHERE id = $2";
    await pool.query(actualizacionSql, [respuesta, req.params.id]);

    // Simulación de despacho de correo electrónico automático
    console.log(`\n📧 [EMAIL AUTOMÁTICO] Enviado a: ${correoAlumno}`);
    console.log(`Asunto: Tu consulta ha sido Respondida`);
    console.log(`Mensaje: Hemos resuelto tu requerimiento. Respuesta: ${respuesta}\n`);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar respuesta' });
  }
});

// -------------------Inicio del Servidor-----------------------------
// Puesta en marcha de la escucha HTTP en el puerto parametrizado
// -------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en el puerto ${PORT}`);
});
