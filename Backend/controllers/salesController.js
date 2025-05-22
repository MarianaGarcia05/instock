const db = require('../config/db');

// Obtener todas las ventas
exports.getAllSales = (req, res) => {
    db.query(`
        SELECT 
            s.id,
            s.product_id,
            p.productName,
            s.provider_id,
            pr.companyName,
            s.amount,
            s.unitCost,
            s.totalCost,
            s.saleDate,
            s.user_id,
            u.names,
            u.surnames 
        FROM sales s
        JOIN products p ON s.product_id = p.id
        JOIN provider pr ON s.provider_id = pr.id
        JOIN users u ON s.user_id = u.id
        ORDER BY s.saleDate DESC
    `, (err, results) => {
        if (err) {
            console.error('Error al consultar las ventas:', err);
            return res.status(500).json({ error: 'Error al consultar las ventas' });
        }
        res.json(results);
    });
};

// Registrar una nueva venta y actualizar stock
exports.createSale = (req, res) => {
    const { product_id, provider_id, amount, saleDate, user_id } = req.body;

    if (!product_id || !provider_id || !amount || !saleDate || !user_id) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Obtener el precio unitario del producto
    db.query(
        `SELECT salePrice FROM products WHERE id = ?`,
        [product_id],
        (err, results) => {
            if (err) {
                console.error('Error al obtener el precio unitario del producto:', err);
                return res.status(500).json({ error: 'Error al obtener el precio unitario del producto' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            const unitCost = results[0].salePrice;
            const totalCost = unitCost * amount;

            // Registrar la venta
            db.query(
                `INSERT INTO sales (product_id, provider_id, amount, unitCost, totalCost, saleDate, user_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [product_id, provider_id, amount, unitCost, totalCost, saleDate, user_id],
                (err, saleResults) => {
                    if (err) {
                        console.error('Error al registrar la venta:', err);
                        return res.status(500).json({ error: 'Error al registrar la venta' });
                    }

                    // Actualizar stock después de la venta
                    db.query(
                        `UPDATE stock SET stock = GREATEST(stock - ?, 0), lastUpdated = NOW()
                         WHERE product_id = ? AND provider_id = ?`,
                        [amount, product_id, provider_id],
                        (err, stockResults) => {
                            if (err) {
                                console.error('Error al actualizar stock tras la venta:', err);
                                return res.status(500).json({ error: 'Error al actualizar stock tras la venta' });
                            }

                            res.status(201).json({ message: 'Venta registrada y stock actualizado', id: saleResults.insertId });
                        }
                    );
                }
            );
        }
    );
};

// Eliminar una venta y ajustar el stock
exports.deleteSale = (req, res) => {
    const { id } = req.params;

    // Obtener detalles de la venta antes de eliminarla
    db.query('SELECT product_id, provider_id, amount FROM sales WHERE id = ?', [id], (err, saleData) => {
        if (err || saleData.length === 0) {
            console.error('Error al obtener venta:', err);
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        const { product_id, provider_id, amount } = saleData[0];

        // Eliminar la venta
        db.query('DELETE FROM sales WHERE id = ?', [id], (err, results) => {
            if (err) {
                console.error('Error al eliminar la venta:', err);
                return res.status(500).json({ error: 'Error al eliminar la venta' });
            }

            // Revertir el stock después de eliminar la venta
            db.query(
                'UPDATE stock SET stock = stock + ?, lastUpdated = NOW() WHERE product_id = ? AND provider_id = ?',
                [amount, product_id, provider_id],
                (err, stockResults) => {
                    if (err) {
                        console.error('Error al actualizar stock tras eliminación de venta:', err);
                        return res.status(500).json({ error: 'Error al actualizar stock tras eliminación de venta' });
                    }
                    res.json({ message: 'Venta eliminada y stock restaurado correctamente' });
                }
            );
        });
    });
};