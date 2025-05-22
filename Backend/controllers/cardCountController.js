const db = require ('../config/db');

//obtener el conteo de registros por tabla
const getCounts = (req, res) => {
    const queries = {
        Usuarios: 'SELECT COUNT (*) AS count FROM users',
        Roles: 'SELECT COUNT (*) AS count FROM role',
        Categorias: 'SELECT COUNT (*) AS count FROM categories',
        Proveedores: 'SELECT COUNT (*) AS count FROM provider',
        Productos: 'SELECT COUNT (*) AS count FROM products',
        Ventas: 'SELECT COUNT (*) AS count FROM sales',
    };

    const counts = {};

    //ejecutar las consultas en paralelo
    const promises = Object.keys(queries).map((key) => {
        return new Promise ((resolve, reject) => {
            db.query(queries[key], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    counts[key] = results[0].count;
                    resolve();
                }
            });
        });
    });

    Promise.all(promises)
        .then(() => {
            res.json(counts);
    })
    .catch((err) =>{
        console.error('Error al obtener los conteos:', err);
        res.status(500).json({ error: 'Error al obtener los conteos'})
    });
};

module.exports = { getCounts };