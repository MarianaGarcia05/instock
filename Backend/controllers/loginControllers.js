const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.login = (req, res) => {
    const { documentNumber, password } = req.body;

    // Log de inicio de login
    console.log('Iniciando sesión para el documento:', documentNumber);

    // Consultar usuario en la base de datos
    db.query('SELECT * FROM users WHERE documentNumber = ?', [documentNumber], async (err, results) => {
        if (err) {
            console.error('Error al consultar el usuario:', err);
            return res.status(500).json({ error: 'Error al consultar el usuario' });
        }

        // Verificar si el usuario existe
        if (results.length === 0) {
            console.log('Usuario no encontrado');
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const user = results[0];

        // Verificar si el usuario está inactivo
        if (user.status === 'inactive') {
            return res.status(403).json({ error: 'Tu cuenta está inactiva. Contacta al administrador.' });
        }

        // **Comparar la contraseña ingresada con la encriptada**
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.log('Contraseña incorrecta');
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        // Obtener el nombre del rol (en lugar del role_id)
        db.query('SELECT rol FROM role WHERE id = ?', [user.role_id], (err, roleResults) => {
            if (err) {
                console.error('Error al obtener el rol:', err);
                return res.status(500).json({ error: 'Error al obtener el rol del usuario' });
            }

            // Verificar si el rol fue encontrado
            const role = roleResults.length > 0 ? roleResults[0].rol : 'Unknown';

            // Crear el token JWT
            const token = jwt.sign(
                { id: user.id, documentNumber: user.documentNumber },
                'clave_secreta',
                { expiresIn: '1h' }
            );

            // Log de éxito
            console.log('Inicio de sesión exitoso para el usuario:', user.documentNumber);

            // Enviar el token y los datos del usuario como respuesta
            res.json({
                message: 'Inicio de sesión exitoso',
                token,
                user: {
                    id: user.id,
                    documentType: user.documentType,
                    documentNumber: user.documentNumber,
                    names: user.names,
                    surnames: user.surnames,
                    email: user.email,
                    role: role,
                    status: user.status,
                    avatar: user.avatar,
                }
            });
        });
    });
};