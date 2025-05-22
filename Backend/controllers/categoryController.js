const db = require('../config/db');

exports.getAllCategories = (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
        if (err) {
            console.error('Error al consultar las categorias:', err);
            return res.status(500).json({ error: 'Error al consultar las categorias' });
        }
        res.json(results);
    });
};

exports.createCategory = (req, res) => {
    const { category, status } = req.body

    if (!category || !status) {
        return res.status(400).json({ error: 'Todos los campos deben ser requeridos.' });
    }

    //Verificar si la categoria ya existe
    db.query('SELECT * FROM categories WHERE category = ?', [category], (err, results) => {
        if (err) {
            console.error('Error al verificar la categoría:', err);
            return res.status(500).json({ error: 'Error al verificar la categoría' });
        }
        if (results.length > 0) {
            return res.status(400).json({ error: 'La categoría ya existe' });
        }

        db.query(
            'INSERT INTO categories (category, status) VALUES (?, ?)',
            [category, status],
            (err, results) => {
                if (err) {
                    console.error('Error al crear la categoria:', err);
                    return res.status(500).json({ error: 'Error al crear la categoría.' });
                }
                res.status(201).json({ message: 'Categoría creada exitosamente' });
            }
        );
    });
};

exports.updateCategories = (req, res) => {
    const { id } = req.params;
    const { category, status } = req.body;

    if (!category || !status) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    //Verificar la exitencia de la categoría
    db.query(
        'SELECT * FROM categories WHERE category = ? AND id != ?',
        [category, id],
        (err, results) => {
            if (err) {
                console.error('Error al verificar la categoría:', err);
                return res.status(400).json({ error: 'la categoría ya existe' });
            }
            if (results.length > 0){
                return res.status(400).json({ error: 'La categoría ya existe.'});
            }
            //Actualizar
            db.query(
                'UPDATE categories SET category = ?, status = ? WHERE id = ?',
                [category, status, id],
                (err, results) => {
                    if (err) {
                        console.error('Error al actualizar la categoria:', err);
                        return res.status(500).json({ error: 'Error al actualizar la categoria' });
                    }
                    if (results.affectedRows === 0) {
                        return res.status(404).json({ error: 'Categoria no encontrada' })
                    }
                    res.json({ message: 'Categoria actualizada éxitosamente' })
                }
            );
        }
    );
}

exports.deleteCategories = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM categories WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar la categoria:', err);
            return res.status(500).json({ error: 'Error al eliminar la categoría' });
        }
        res.json({ message: 'Categoría eliminada exitosamente' });
    });
};