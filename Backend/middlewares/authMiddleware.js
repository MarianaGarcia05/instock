const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, 'clave_secreta');

        // 📌 Validar si el token está cerca de expirar (faltan menos de 5 minutos)
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp - now < 300) {  // 300 segundos = 5 minutos
            // 🔄 Generar un nuevo token con la misma información del usuario
            const newToken = jwt.sign({ id: decoded.id }, 'clave_secreta', { expiresIn: '1h' });

            // 📌 Mandamos el nuevo token en la respuesta para que el frontend lo guarde
            res.setHeader('Authorization', `Bearer ${newToken}`);
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = verifyToken;