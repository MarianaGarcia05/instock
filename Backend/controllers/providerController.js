const db = require('../config/db');

// Obtener proveedores
exports.getAllProvider = (req, res) => {
    db.query('SELECT * FROM provider', (err, results) => {
        if (err) {
            console.error('Error al consultar los proveedores:', err);
            return res.status(500).json({ error: 'Error al consultar los proveedores' });
        }
        res.json(results);
    });
};

// Crear proveedor
exports.createProvider = (req, res) => {
    const { companyName, supplier, phone, email, status } = req.body;

    if (!companyName || !supplier || !phone || !status) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    // Verificar si el companyName existe
    db.query('SELECT * FROM provider WHERE companyName = ?', [companyName], (err, results) => {
        if (err) {
            console.error('Error al verificar el nombre de la empresa', err);
            return res.status(500).json({ error: 'Error al verificar el nombre de la empresa' });
        }
        if (results.length > 0) {
            return res.status(400).json({ error: 'El nombre de la empresa ya está registrado' });
        }

        db.query(
            'INSERT INTO provider (companyName, supplier, phone, email, status) VALUES (?, ?, ?, ?, ?)',
            [companyName, supplier, phone, email || null, status],
            (err, results) => {
                if (err) {
                    console.error('Error al crear el proveedor:', err);
                    return res.status(500).json({ error: 'Error al crear el proveedor' });
                }
                res.status(201).json({ message: 'Proveedor creado éxitosamente' });
            }
        );
    });
};

// Editar proveedor
exports.updateProvider = (req, res) => {
    const { id } = req.params;
    const { companyName, supplier, phone, email, status } = req.body;

    if (!companyName || !supplier || !phone || !status) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el nombre de la empresa
    db.query(
        'SELECT * FROM provider WHERE companyName = ? AND id != ?',
        [companyName, id],
        (err, results) => {
            if (err) {
                console.error('Error al verificar el nombre de la empresa:', err);
                return res.status(500).json({ error: 'Error al verificar el nombre de la empresa' });
            }
            if (results.length > 0) {
                return res.status(400).json({ error: 'El nombre de la empresa ya está registrado en otro proveedor' });
            }

            // Actualizar el proveedor si pasa las validaciones
            db.query(
                'UPDATE provider SET companyName = ?, supplier = ?, phone = ?, email = ?, status = ? WHERE id = ?',
                [companyName, supplier, phone, email || null, status, id],
                (err, results) => {
                    if (err) {
                        console.error('Error al actualizar el proveedor:', err);
                        return res.status(500).json({ error: 'Error al actualizar el proveedor' });
                    }
                    if (results.affectedRows === 0) {
                        return res.status(404).json({ error: 'proveedor no encontrado' });
                    }
                    return res.status(200).json({ success: true, message: 'proveedor actualizado exitosamente' });
                }
            );
        }
    );
};

// Eliminar proveedor
exports.deleteProvider = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM provider WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar el proveedor:', err);
            return res.status(500).json({ error: 'Error al eliminar el proveedor ' });
        }
        res.json({ message: 'Proveedor eliminado éxitosamente' });
    });
};
