const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

// POST /api/ia/predecir
router.post('/predecir', (req, res) => {
    // 1. Recibimos los datos del frontend
    const { horas, actividades } = req.body;

    if (horas === undefined || actividades === undefined) {
        return res.status(400).json({ error: "Faltan datos de horas o actividades." });
    }

    // 2. Buscamos la ruta exacta de tu archivo de Python
    const scriptPath = path.join(__dirname, '../ia/modelo_ia.py');

    // 3. Ejecutamos Python en segundo plano
    const pythonProcess = spawn('python', [scriptPath, horas, actividades]);

    let dataString = '';

    // 4. Capturamos lo que Python imprima (el JSON que acabas de ver)
    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    // 5. Cuando Python termine, se lo mandamos a React
    pythonProcess.stdout.on('end', () => {
        try {
            const resultado = JSON.parse(dataString);
            res.json(resultado);
        } catch (error) {
            console.error("Error al parsear JSON de Python:", dataString);
            res.status(500).json({ error: "Error interno al procesar la IA." });
        }
    });

    // Por si Python arroja algún error en la terminal
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error de Python: ${data}`);
    });
});

module.exports = router;