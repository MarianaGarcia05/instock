const db = require('../config/db');

exports.getAllStock = (req, res) => {
    const query = `
    SELECT stock.id, stock.stock, stock.lastUpdated, 
       products.productName, products.presentation, products.image, provider.companyName
    FROM stock
    JOIN products ON stock.product_id = products.id
    JOIN provider ON stock.provider_id = provider.id

  `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar los productos existentes:', err);
            return res.status(500).json({ error: 'Error al consultar los productos existentes' });
        }
        res.json(results);
    });
};


exports.getStock = (req, res) => {
    const { productId, providerId } = req.params;

    db.query(
        `SELECT 
            p.id AS productId, 
            p.productName AS productName,
            COALESCE(s.stock, 0) AS stockActual,
            s.lastUpdated
        FROM products p
        LEFT JOIN stock s ON p.id = s.product_id AND s.provider_id = ?
        WHERE p.id = ?`,
        [providerId, productId],
        (err, results) => {
            if (err) {
                console.error('Error al obtener stock:', err);
                return res.status(500).json({ error: 'Error al obtener stock' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            res.json(results[0]);
        }
    );
};
