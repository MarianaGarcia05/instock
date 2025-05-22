// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/db');
const loginRoutes = require ('./routes/loginRoutes');
const cardCountRoutes = require('./routes/cardCountRoutes');
const roleRouter = require ('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const providerRoutes = require('./routes/providerRouter');
const productRoutes = require('./routes/productRoutes');
const registerSaleRoutes = require('./routes/salesRoutes');
const entriesRoutes = require('./routes/entriesRoutes');
const stockRoutes = require('./routes/stockRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
// Aumenta el límite para parsing JSON y URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
//rutas
app.use('/api/login', loginRoutes);
app.use('/api/users', userRoutes);
app.use('/api/counter', cardCountRoutes);
app.use('/api/roles', roleRouter);
app.use('/api/company', companyRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/product', productRoutes);
app.use('/api/sales', registerSaleRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/reports', reportsRoutes);


// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
