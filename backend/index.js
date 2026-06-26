const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

app.post('/api/login', async (req, res) => {
  const { rut, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, rut, perfil, nombre, situacion_academica FROM usuarios WHERE rut = $1 AND password = $2',
      [rut, password]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

app.get('/api/usuario/info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT rut, nombre, perfil, carrera, situacion_academica, email, email_personal, email_apoderado, telefono, direccion FROM usuarios WHERE id = $1',
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener perfil" });
  }
});

app.get('/api/perfil/bancario/:id_estudiante', async (req, res) => {
  try {
    const { id_estudiante } = req.params;
    const result = await pool.query(
      'SELECT banco, tipo_cuenta, numero_cuenta, rut_titular FROM usuarios WHERE id = $1',
      [id_estudiante]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener datos bancarios" });
  }
});

app.put('/api/perfil/bancario/:id_estudiante', async (req, res) => {
  try {
    const { id_estudiante } = req.params;
    const { banco, tipo_cuenta, numero_cuenta, rut_titular } = req.body;
    await pool.query(
      'UPDATE usuarios SET banco = $1, tipo_cuenta = $2, numero_cuenta = $3, rut_titular = $4 WHERE id = $5',
      [banco, tipo_cuenta, numero_cuenta, rut_titular, id_estudiante]
    );
    res.status(200).json({ success: true, message: "Datos actualizados." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error al actualizar." });
  }
});

app.get('/api/finanzas/:id_estudiante', async (req, res) => {
  try {
    const { id_estudiante } = req.params;
    const result = await pool.query(
      'SELECT arancel_bruto, beneficios_validados, saldo_neto FROM cuenta_estudiante WHERE id_estudiante = $1',
      [id_estudiante]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Cuenta no encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener finanzas" });
  }
});

app.get('/api/finanzas/historial/:id_estudiante', async (req, res) => {
  try {
    const { id_estudiante } = req.params;
    const result = await pool.query(
      'SELECT monto, fecha, mes_referencia FROM pagos WHERE id_estudiante = $1 ORDER BY fecha DESC',
      [id_estudiante]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

app.post('/api/finanzas/pago', async (req, res) => {
  const { id_estudiante, monto_abono, mes_referencia } = req.body;
  try {
    await pool.query('BEGIN');
    await pool.query(
      'INSERT INTO pagos (id_estudiante, monto, mes_referencia) VALUES ($1, $2, $3)', 
      [id_estudiante, monto_abono, mes_referencia || null]
    );
    await pool.query('UPDATE cuenta_estudiante SET saldo_neto = saldo_neto - $1 WHERE id_estudiante = $2', [monto_abono, id_estudiante]);
    await pool.query('COMMIT');
    res.json({ success: true });
  } catch (e) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: "Error procesando el pago" });
  }
});

// Endpoint para obtener la lista de beneficios del estudiante
app.get('/api/beneficios/:id_estudiante', async (req, res) => {
  try {
    const { id_estudiante } = req.params;
    const result = await pool.query(
      'SELECT nombre_beneficio, monto, periodo_cobertura, estado FROM beneficios WHERE id_estudiante = $1',
      [id_estudiante]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener beneficios" });
  }
});

// ==========================================
// RUTAS DE CONSULTAS / SOPORTE (NUEVO)
// ==========================================

// 1. Alumno: Crear Nueva Consulta
app.post('/api/consultas', async (req, res) => {
  const { id_usuario, asunto, mensaje } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO consultas (id_usuario, asunto, mensaje, estado) VALUES ($1, $2, $3, 'Pendiente') RETURNING id",
      [id_usuario, asunto, mensaje]
    );
    res.status(200).json({ success: true, id_consulta: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: "Error al crear la consulta" });
  }
});

// 2. Alumno: Ver sus consultas
app.get('/api/consultas/:id_usuario', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, fecha, asunto, estado, respuesta FROM consultas WHERE id_usuario = $1 ORDER BY fecha DESC",
      [req.params.id_usuario]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo consultas" });
  }
});

// 3. Admin: Bandeja centralizada
app.get('/api/admin/consultas/pendientes', async (req, res) => {
  try {
    const queryText = `
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
    const result = await pool.query(queryText);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener la bandeja de consultas pendientes" });
  }
});

// 4. Admin: Responder Consulta
app.put('/api/admin/consultas/responder/:id', async (req, res) => {
  const { respuesta, correo_alumno } = req.body;
  try {
    await pool.query(
      "UPDATE consultas SET estado = 'Respondida', respuesta = $1 WHERE id = $2",
      [respuesta, req.params.id]
    );
    
    // Simulación de correo automático
    console.log(`\n📧 [EMAIL AUTOMÁTICO] Enviado a: ${correo_alumno}`);
    console.log(`Asunto: Tu consulta ha sido Respondida`);
    console.log(`Mensaje: Hemos resuelto tu requerimiento. Respuesta: ${respuesta}\n`);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al guardar respuesta" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en el puerto ${PORT}`);
});