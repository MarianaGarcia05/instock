const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',     
  user: 'root',          
  password: '',  
  database: 'instock',
});

// Conexión a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.stack);
    return;
  }
  console.log('Conexión exitosa a la base de datos');
});

module.exports = connection;
