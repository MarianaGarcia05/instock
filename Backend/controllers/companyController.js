const db = require('../config/db')

//Obtener los datos de la empresa
exports.getCompany = (req, res) => {
    db.query ('SELECT * FROM company LIMIT 1', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
};

// Actualizar o crear los datos de la empresa
exports.updateCompany = (req, res) => {
    const { documentType, documentNumber, name, address, phone, email } = req.body;
  
    // Verificar si ya existe un registro en la base de datos
    db.query('SELECT * FROM company LIMIT 1', (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
  
      if (results.length > 0) {
        // Si ya existe un registro, actualizarlo
        const query = `UPDATE company SET documentType = ?, documentNumber = ?, name = ?, address = ?, phone = ?, email = ? WHERE id = 1`;
        db.query(query, [documentType, documentNumber, name, address, phone, email], (err, updateResults) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Datos de la empresa actualizados exitosamente.' });
        });
      } else {
        // Si no existe un registro, crear uno nuevo
        const query = `INSERT INTO company (documentType, documentNumber, name, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)`;
        db.query(query, [documentType, documentNumber, name, address, phone, email], (err, insertResults) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Datos de la empresa creados exitosamente.' });
        });
      }
    });
  };