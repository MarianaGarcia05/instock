const db = require('../config/db');

//obtener roles
exports.getAllRoles = (req, res) => {
    db.query('SELECT * FROM role', (err, results) => {
        if (err) {
            console.error('Error al consultar los roles:', err);
            return res.status(500).json({ error: 'Error al consultar los roles' });
        }
        res.json(results);
    });
};

// Crear rol
exports.createRole = (req, res) => {
    const { rol, status } = req.body;

    if (!rol || !status) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    db.query('SELECT * FROM role WHERE rol = ?', [rol], (err, results) => {
        if (err) {
            console.error('Error al verificar el rol:', err);
            return res.status(500).json({ error: 'Error al verificar el rol' });
        }
        if (results.length > 0) {
            return req.status(400).json({ error: 'El rol ya existe' });
        }

        db.query(
            'INSERT INTO role (rol, status) VALUES (?, ?)',
            [rol, status],
            (err, results) => {
                if (err) {
                    console.error('Error al crear el rol:', err);
                    return res.status(500).json({ error: 'Error al crear el rol' });
                }
                res.status(201).json({ message: 'Rol creado éxitosamente' });
            }
        );
    });
};

// Editar rol
exports.updateRole = (req, res) => {
    const { id } = req.params;
    const { rol, status } = req.body;

    if (!rol || !status) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    //verificar si el rol existe
    db.query(
        'SELECT * FROM role WHERE rol = ? AND id != ?',
        [rol, id],
        (err, results) => {
            if (err) {
                console.error('Error al verificar el rol:', err);
                return res.status(400).json({ error: 'El rol ya existe.' });
            }
            if (results.length > 0){
                return res.status(400).json({ error: 'El rol ya existe.'});
            }
            //Actualizar
            db.query(
                'UPDATE role SET rol = ?, status = ? WHERE id = ?',
                [rol, status, id],
                (err, results) => {
                    if (err){
                        console.error('Error al actualizar el rol:', err);
                        return res.status(500).json({ error: 'Error al actualizar el rol'});
                    }
                    if (results.affectedRows === 0){
                        return res.status(404).json({ error: 'Rol no encontrado' })
                    }
                    res.json({ message: 'Rol actualizado exitosamente' })
                }
            );
        }
    );
};


//Eliminar rol
exports.deleteRole = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM role WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar el rol:', err);
            return res.status(500).json({ error: 'Error al eliminar el rol ' });
        }
        res.json({ message: 'Rol eliminado éxitosamente' });
    });
};