const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/api/mensaje', (req, res) => {
    res.json({ mensaje: '¡Hola desde el Backend en Node.js! 🚀' });
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});