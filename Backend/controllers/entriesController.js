const db = require('../config/db');

exports.getAllEntries = (req, res) => {
    db.query(`
        SELECT 
            e.id, 
            e.product_id,
            p.productName, 
            e.provider_id,
            pr.companyName, 
            e.quantity, 
            e.unitCost, 
            e.totalCost, 
            e.entryDate, 
            e.expirationDate, 
            e.user_id,
            u.names,
            u.surnames 
        FROM entries e
        JOIN products p ON e.product_id = p.id
        JOIN provider pr ON e.provider_id = pr.id
        JOIN users u ON e.user_id = u.id
        ORDER BY e.entryDate DESC
    `, (err, results) => {
        if (err) {
            console.error('Error al consultar las entradas:', err);
            return res.status(500).json({ error: 'Error al consultar las entradas' });
        }
        res.json(results);
    });
};

// Crear una nueva entrada y actualizar stock
exports.createEntry = (req, res) => {
    const { product_id, provider_id, quantity, unitCost, expirationDate, user_id } = req.body;

    if (!product_id || !provider_id || !quantity || !unitCost || !user_id) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const totalCost = quantity * unitCost;

    db.query(
        'INSERT INTO entries (product_id, provider_id, quantity, unitCost, totalCost, entryDate, expirationDate, user_id) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)',
        [product_id, provider_id, quantity, unitCost, totalCost, expirationDate, user_id],
        (err, results) => {
            if (err) {
                console.error('Error al registrar la entrada:', err);
                return res.status(500).json({ error: 'Error al registrar la entrada.' });
            }

            // Actualizar stock después de registrar la entrada
            db.query(
                `INSERT INTO stock (product_id, provider_id, stock, lastUpdated)
                 VALUES (?, ?, ?, NOW())
                 ON DUPLICATE KEY UPDATE stock = stock + VALUES(stock), lastUpdated = NOW();`,
                [product_id, provider_id, quantity],
                (err, stockResults) => {
                    if (err) {
                        console.error('Error al actualizar stock:', err);
                        return res.status(500).json({ error: 'Error al actualizar stock' });
                    }
                    res.status(201).json({ message: 'Entrada registrada y stock actualizado', id: results.insertId });
                }
            );
        }
    );
};

// Eliminar una entrada y ajustar el stock
exports.deleteEntry = (req, res) => {
    const { id } = req.params;

    // Obtener información de la entrada antes de eliminarla
    db.query('SELECT product_id, provider_id, quantity FROM entries WHERE id = ?', [id], (err, entryData) => {
        if (err || entryData.length === 0) {
            console.error('Error al obtener la entrada:', err);
            return res.status(404).json({ error: 'Entrada no encontrada' });
        }

        const { product_id, provider_id, quantity } = entryData[0];

        // Eliminar la entrada
        db.query('DELETE FROM entries WHERE id = ?', [id], (err, results) => {
            if (err) {
                console.error('Error al eliminar la entrada:', err);
                return res.status(500).json({ error: 'Error al eliminar la entrada' });
            }

            // Ajustar stock después de eliminar la entrada
            db.query(
                'UPDATE stock SET stock = GREATEST(stock - ?, 0), lastUpdated = NOW() WHERE product_id = ? AND provider_id = ?',
                [quantity, product_id, provider_id],
                (err, stockResults) => {
                    if (err) {
                        console.error('Error al actualizar stock tras eliminar entrada:', err);
                        return res.status(500).json({ error: 'Error al actualizar stock tras eliminar entrada' });
                    }
                    res.json({ message: 'Entrada eliminada y stock actualizado correctamente' });
                }
            );
        });
    });
};