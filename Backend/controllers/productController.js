const db = require('../config/db');

// Obtener todos los productos
exports.getAllProducts = (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error('Error al consultar los productos:', err);
            return res.status(500).json({ error: 'Error al consultar los productos' });
        }
        res.json(results);
    });
};

exports.getProductsWithStock = (req, res) => {
  db.query(`
      SELECT 
          p.id,
          p.productName,
          p.salePrice,
          p.image,
          p.presentation,
          p.provider_id,
          pr.companyName,
          c.category,
          IFNULL(SUM(s.stock), 0) AS stock
      FROM products p
      LEFT JOIN stock s ON p.id = s.product_id
      LEFT JOIN provider pr ON p.provider_id = pr.id
      LEFT JOIN categories c ON p.category_id = c.id
      GROUP BY 
          p.id, p.productName, p.salePrice, p.image, p.provider_id, pr.companyName, c.category
  `, (err, results) => {
      if (err) {
          console.error('Error al consultar los productos con stock:', err);
          return res.status(500).json({ error: 'Error al consultar los productos' });
      }
      res.json(results);
  });
};



// Crear un producto
exports.createProduct = (req, res) => {
    const { barCode, productName, salePrice, presentation, provider_id, category_id, status, image } = req.body;

    if (!productName || !salePrice  || !presentation || !provider_id || !category_id || !status || !image) {
        return res.status(400).json({ error: 'Todos los campos excepto el código de barras son requeridos.' });
    }

    // Verificar si el código de barras ya existe (solo si se proporciona uno)
    if (barCode) {
        db.query('SELECT * FROM products WHERE barCode = ?', [barCode], (err, results) => {
            if (err) {
                console.error('Error al verificar el código de barras:', err);
                return res.status(500).json({ error: 'Error al verificar el código de barras' });
            }
            if (results.length > 0) {
                return res.status(400).json({ error: 'El código de barras ya está registrado' });
            }

            insertarProducto(barCode);
        });
    } else {
        insertarProducto(null);
    }

    function insertarProducto(barCodeValue) {
        db.query(
            'INSERT INTO products (barCode, productName, salePrice, presentation, provider_id, category_id, status, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [barCodeValue, productName, salePrice, presentation, provider_id, category_id, status, image],
            (err, results) => {
                if (err) {
                    console.error('Error al crear el producto:', err);
                    return res.status(500).json({ error: 'Error al crear el producto' });
                }
                res.status(201).json({ message: 'Producto creado exitosamente' });
            }
        );
    }
};

// Editar un producto
exports.updateProduct = (req, res) => {
    const { id } = req.params;
    const { barCode, productName, salePrice, presentation, provider_id, category_id, status, image } = req.body;

    if (!productName || !salePrice  || !presentation || !provider_id || !category_id || !status || !image) {
        return res.status(400).json({ error: 'Todos los campos excepto el código de barras son requeridos.' });
    }

    // Verificar si el código de barras ya existe en otro producto (solo si se proporciona uno)
    if (barCode) {
        db.query(
            'SELECT * FROM products WHERE barCode = ? AND id != ?',
            [barCode, id],
            (err, results) => {
                if (err) {
                    console.error('Error al verificar el código de barras:', err);
                    return res.status(500).json({ error: 'Error al verificar el código de barras' });
                }
                if (results.length > 0) {
                    return res.status(400).json({ error: 'El código de barras ya está registrado en otro producto' });
                }

                actualizarProducto(barCode);
            }
        );
    } else {
        actualizarProducto(null);
    }

    function actualizarProducto(barCodeValue) {
        db.query(
            'UPDATE products SET barCode = ?, productName = ?, salePrice = ?, presentation = ?, provider_id = ?, category_id = ?, status = ?, image = ? WHERE id = ?',
            [barCodeValue, productName, salePrice, presentation, provider_id, category_id, status, image, id],
            (err, results) => {
                if (err) {
                    console.error('Error al actualizar el producto:', err);
                    return res.status(500).json({ error: 'Error al actualizar el producto' });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ error: 'Producto no encontrado' });
                }
                return res.status(200).json({ success: true, message: 'Producto actualizado exitosamente' });
            }
        );
    }
};

// Eliminar un producto
exports.deleteProduct = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM products WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar el producto:', err);
            return res.status(500).json({ error: 'Error al eliminar el producto' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado exitosamente' });
    });
};  