const db = require('../config/db');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Define la complejidad del hash
const verifyToken = require('../middlewares/authMiddleware');

// Obtener usuario por id
exports.getUser = (req, res) => {
    const userId = req.user.id; // Usamos el id del usuario desde el token

    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error al consultar el usuario:', err);
            return res.status(500).json({ error: 'Error al consultar el usuario' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(results[0]);
    });
};

// Obtener todos los usuarios
exports.getAllUsers = (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Error al consultar los usuarios:', err);
            return res.status(500).json({ error: 'Error al consultar los usuarios' });
        }
        res.json(results);
    });
};

// Crear usuario con contraseña encriptada
exports.createUser = async (req, res) => {
    const { documentType, documentNumber, names, surnames, email, password, role_id, status, avatar } = req.body;

    if (!documentType || !documentNumber || !names || !surnames || !email || !password || !role_id || !status || !avatar) {
        return res.status(400).json({ error: 'Todos los campos son requeridos, incluido el avatar.' });
    }

    db.query('SELECT * FROM users WHERE documentNumber = ?', [documentNumber], async (err, results) => {
        if (err) {
            console.error('Error al verificar el n° de documento:', err);
            return res.status(500).json({ error: 'Error al verificar el n° de documento' });
        }
        if (results.length > 0) {
            return res.status(400).json({ error: 'El N° de documento ya está registrado' });
        }

        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        db.query(
            'INSERT INTO users (documentType, documentNumber, names, surnames, email, password, role_id, status, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [documentType, documentNumber, names, surnames, email, hashedPassword, role_id, status, avatar],
            (err, results) => {
                if (err) {
                    console.error('Error al crear el usuario:', err);
                    return res.status(500).json({ error: 'Error al crear el usuario' });
                }
                res.status(201).json({ message: 'Usuario creado exitosamente' });
            }
        );
    });
};

// Editar usuario y encriptar nueva contraseña si es actualizada
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { documentType, documentNumber, names, surnames, email, password, role_id, status, avatar } = req.body;

    if (!documentType || !documentNumber || !names || !surnames || !email || !password || !role_id || !status || !avatar) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    db.query(
        'SELECT * FROM users WHERE documentNumber = ? AND id != ?',
        [documentNumber, id],
        async (err, results) => {
            if (err) {
                console.error('Error al verificar el número de documento:', err);
                return res.status(500).json({ error: 'Error al verificar el número de documento' });
            }
            if (results.length > 0) {
                return res.status(400).json({ error: 'El N° de documento ya está registrado en otro usuario' });
            }

            // Encriptar la nueva contraseña antes de guardarla
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            db.query(
                'UPDATE users SET documentType = ?, documentNumber = ?, names = ?, surnames = ?, email = ?, password = ?, role_id = ?, status = ?, avatar = ? WHERE id = ?',
                [documentType, documentNumber, names, surnames, email, hashedPassword, role_id, status, avatar, id],
                (err, results) => {
                    if (err) {
                        console.error('Error al actualizar el usuario:', err);
                        return res.status(500).json({ error: 'Error al actualizar el usuario' });
                    }
                    if (results.affectedRows === 0) {
                        return res.status(404).json({ error: 'Usuario no encontrado' });
                    }
                    return res.status(200).json({ success: true, message: 'Usuario actualizado exitosamente' });
                }
            );
        }
    );
};

// Eliminar usuario
exports.deleteUser = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar el usuario:', err);
            return res.status(500).json({ error: 'Error al eliminar el usuario' });
        }
        res.json({ message: 'Usuario eliminado exitosamente' });
    });
};

// Validar usuario en el login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Error al consultar el usuario:', err);
            return res.status(500).json({ error: 'Error al consultar el usuario' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = results[0];

        // Comparar la contraseña encriptada
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        res.json({ message: 'Inicio de sesión exitoso', user });
    });
};

// const crypto = require('crypto');
// const nodemailer = require('nodemailer');

// exports.forgotPassword = (req, res) => {
//     const { documentNumber, email } = req.body;

//     db.query('SELECT * FROM users WHERE documentNumber = ? AND email = ?', [documentNumber, email], async (err, results) => {
//         if (err) {
//             console.error('Error al buscar usuario:', err);
//             return res.status(500).json({ error: 'Error al buscar usuario' });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ error: 'Usuario no encontrado' });
//         }

//         const token = crypto.randomBytes(20).toString('hex'); // Genera un token único
//         const expires = Date.now() + 3600000; // Expira en 1 hora

//         db.query('UPDATE users SET resetToken = ?, resetExpires = ? WHERE documentNumber = ?', [token, expires, documentNumber]);

//         // Configurar el servicio de correo (SMTP)
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: { user: 'cardosoyuly86@gmail.com', pass: 'uejk upsz mgjl ggzv' }
//         });

//         const mailOptions = {
//             from: 'cardosoyuly86@gmail.com',
//             to: email,
//             subject: 'Recuperación de contraseña',
//             text: `Para restablecer tu contraseña, haz clic en este enlace: http://localhost:3000/reset-password/${token}`
//         };

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.error('Error enviando correo:', error);
//                 return res.status(500).json({ error: 'Error enviando correo' });
//             }
//             res.json({ message: 'Correo de recuperación enviado' });
//         });
//     });
// };