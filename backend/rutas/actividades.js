const express = require('express');
const router = express.Router();
const pool = require('../db');

// ==========================================
// RUTA: Registrar una nueva actividad (POST)
// ==========================================
router.post('/nueva', async (req, res) => {
    try {
        // 1. Extraemos los datos exactamente con los nombres de tu tabla
        const { id_estudiante, id_proyecto, descripcion, horas, fecha_realizacion } = req.body;

        // 2. Validamos que no falte lo indispensable
        if (!id_estudiante || !descripcion || !horas || !fecha_realizacion) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        // 3. Insertamos usando los nombres de columnas de tu imagen
        const result = await pool.query(
            `INSERT INTO actividades (id_estudiante, id_proyecto, descripcion, horas, fecha_realizacion, estado)
             VALUES ($1, $2, $3, $4, $5, 'Pendiente') 
             RETURNING *`,
            [id_estudiante, id_proyecto, descripcion, horas, fecha_realizacion]
        );

        res.status(201).json({
            mensaje: "¡Actividad registrada con éxito y en espera de validación!",
            actividad_registrada: result.rows[0]
        });

    } catch (error) {
        console.error("Error guardando la actividad:", error);
        res.status(500).json({ error: "Error interno del servidor al guardar" });
    }
});

// ==========================================
// RUTA: Ver actividades pendientes (GET)
// ==========================================
router.get('/pendientes', async (req, res) => {
    try {
        // Hacemos un JOIN para que el encargado vea el nombre del alumno, no solo su ID
        const result = await pool.query(`
            SELECT a.id_actividad, u.nombre_completo AS estudiante, a.descripcion, a.horas, a.fecha_realizacion 
            FROM actividades a
            JOIN usuarios u ON a.id_estudiante = u.id_usuario
            WHERE a.estado = 'Pendiente'
            ORDER BY a.fecha_realizacion ASC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener pendientes:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// ==========================================
// RUTA: Aprobar o Rechazar actividad (PUT)
// ==========================================
router.put('/validar/:id', async (req, res) => {
    try {
        const { id } = req.params; // El ID de la actividad que viene en la URL
        const { nuevo_estado } = req.body; // 'Aprobada' o 'Rechazada'

        if (nuevo_estado !== 'Aprobada' && nuevo_estado !== 'Rechazada') {
            return res.status(400).json({ error: "Estado no válido" });
        }

        const result = await pool.query(
            `UPDATE actividades SET estado = $1 WHERE id_actividad = $2 RETURNING *`,
            [nuevo_estado, id]
        );

        res.json({
            mensaje: `¡Actividad ${nuevo_estado.toLowerCase()} con éxito!`,
            actividad: result.rows[0]
        });
    } catch (error) {
        console.error("Error al validar:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

module.exports = router;