const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la base de datos usando las variables del docker-compose
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
      'SELECT rut, perfil FROM usuarios WHERE rut = $1 AND password = $2',
      [rut, password]
    );

    if (result.rows.length > 0) {
      // CA1: Identifica tipo de perfil
      res.json({ success: true, user: result.rows[0] });
    } else {
      // CA4: Credenciales inválidas
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en el puerto ${PORT}`);
});