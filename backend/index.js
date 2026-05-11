require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Importamos tu conexión del archivo anterior

const rutasActividades = require('./rutas/actividades');
const rutasUsuarios = require('./rutas/usuarios');
const iaRutas = require('./rutas/ia');
const app = express();

// Middlewares (Reglas de seguridad y formato de datos)
app.use(cors());
app.use(express.json());

// ==========================================
// 🔔 EL CHISMOSO: Monitorea todas las peticiones
// ==========================================
app.use((req, res, next) => {
  console.log(`🔔 [${new Date().toLocaleTimeString()}] Petición recibida: ${req.method} ${req.url}`);
  next(); // Deja que la petición siga su camino
});

// Ruta de prueba rápida para ver si la base de datos responde
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
        mensaje: "¡Conexión exitosa al SIGSS!", 
        hora_servidor: result.rows[0] 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error conectando a la Base de Datos" });
  }
});

const PORT = process.env.PORT || 3000;

// ==========================================
// RUTA DE LOGIN OFICIAL DEL SIGSS
// ==========================================
app.post('/api/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Buscamos al usuario en la base de datos
    const result = await pool.query(
        'SELECT id_usuario, nombre_completo, correo, password_hash, rol FROM usuarios WHERE correo = $1',
        [correo]
    );

    const usuario = result.rows[0];

    // Validamos si existe el correo
    if (!usuario) {
        return res.status(401).json({ error: "El correo no está registrado." });
    }

    // Validamos la contraseña (recuerda que ahorita es texto plano: '123456')
    if (password !== usuario.password_hash) {
        return res.status(401).json({ error: "Contraseña incorrecta." });
    }

    // Si todo está bien, respondemos con los datos del usuario (sin la contraseña)
    res.json({
        mensaje: "¡Login exitoso!",
        usuario: {
            id: usuario.id_usuario,
            nombre: usuario.nombre_completo,
            correo: usuario.correo,
            rol: usuario.rol
        }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Activamos la carpeta de rutas de actividades
app.use('/api/actividades', rutasActividades);
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/ia', iaRutas);

app.listen(PORT, () => {
  console.log(`🚀 Servidor del SIGSS corriendo en el puerto ${PORT}`);
});