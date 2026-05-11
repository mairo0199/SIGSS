const express = require('express');
const router = express.Router();
const pool = require('../db');

// ==========================================
// RUTA: Progreso de los estudiantes (Para el Encargado)
// ==========================================
router.get('/estudiantes', async (req, res) => {
    try {
        // Unimos la tabla de usuarios con la de estudiantes_progreso
        const result = await pool.query(`
            SELECT u.id_usuario, u.nombre_completo, ep.codigo_udg, ep.horas_acumuladas, ep.nivel_riesgo
            FROM usuarios u
            JOIN estudiantes_progreso ep ON u.id_usuario = ep.id_estudiante
            WHERE u.rol = 'Alumno'
            ORDER BY ep.horas_acumuladas DESC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener estudiantes:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// ==========================================
// RUTA: Todos los usuarios del sistema (Para el Admin)
// ==========================================
router.get('/todos', async (req, res) => {
    try {
        // Traemos a todos: Alumnos, Encargados y Admins
        const result = await pool.query(`
            SELECT id_usuario, nombre_completo, correo, rol, fecha_creacion
            FROM usuarios
            ORDER BY rol ASC, nombre_completo ASC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

module.exports = router;