import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Reports.css'
import * as FaIcons from 'react-icons/fa'
import * as MdIcons from 'react-icons/md'
import * as Hi2Icons from 'react-icons/hi2'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [entradasVsSalidas, setEntradasVsSalidas] = useState({ totalEntradas: 0, totalSalidas: 0 });
  const [topProductos, setTopProductos] = useState([]);
  const [cardsResumen, setCardsResumen] = useState({
    totalVentas: 0,
    gananciaNeta: 0,
    totalProductosVendidos: 0,
    valorInvertido: 0
  });

  const cargarDatos = () => {
    axios.get(`http://localhost:3000/api/reports/entradas-vs-salidas?year=${year}&month=${month}`)
      .then(res => setEntradasVsSalidas(res.data))
      .catch(err => console.error('Error Entradas vs Salidas:', err));

    axios.get(`http://localhost:3000/api/reports/top-productos-vendidos?year=${year}&month=${month}`)
      .then(res => setTopProductos(res.data))
      .catch(err => console.error('Error Top Productos:', err));

    axios.get(`http://localhost:3000/api/reports/cards-resumen?year=${year}&month=${month}`)
      .then(res => setCardsResumen(res.data))
      .catch(err => console.error('Error Cards Resumen:', err));
  };

  useEffect(() => {
    cargarDatos();
  }, [year, month]);

  const exportarExcel = () => {
    const url = `http://localhost:3000/api/reports/export-excel?year=${year}&month=${month}`;
    window.open(url, '_blank');
  };

  return (
    <div className='reportsContent'>
      <div className='headerReports'>
        <h1 className="title">
          <Hi2Icons.HiDocumentChartBar className="iconTitle" /> Reportes Mensuales
        </h1>
        <button className='btnDownload' onClick={exportarExcel}><FaIcons.FaFileDownload /></button>
      </div>
      <br /><h3>En este apartado se presentarán pequeños reportes con resúmenes de información relevante, podrás seleccionar la
        fecha que desees para generar el reporte y descargar un archivo en formato Excel con los datos correspondientes.
      </h3><br />
      <div className='filtros'>
        <label>Mes:</label>
        <select value={month} onChange={e => setMonth(Number(e.target.value))}>
          {[
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ].map((mes, index) => (
            <option key={index + 1} value={index + 1}>{mes}</option>
          ))}
        </select>


        <label>Año:</label>
        <input
          type="number"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          min="2000"
          max="2100"
        />

        {/* <button onClick={cargarDatos}>Actualizar</button> */}

      </div>

      <div className='contentCardsReports'>

        <div className='cardReports'>
          <div>
            <div className="numbersReports">
              {new Intl.NumberFormat('es-CO').format(cardsResumen.totalVentas)}
              <i><MdIcons.MdAttachMoney /></i>
            </div>
          </div>
          <div className='cardReportsFooter'>
            Total Ventas
          </div>
        </div>

        {/* <div className='cardReports'>
          <div>
            <div className="numbersReports">
              {new Intl.NumberFormat('es-CO').format(cardsResumen.gananciaNeta)}
              <i><MdIcons.MdAttachMoney /></i>
            </div>
          </div>
          <div className='cardReportsFooter'>
            Ganancia Neta
          </div>
        </div> */}

        <div className='cardReports'>
          <div>
            <div className="numbersReports">
              {cardsResumen.totalProductosVendidos}
              <i><FaIcons.FaBoxOpen /></i>
            </div>
          </div>
          <div className='cardReportsFooter'>
            Productos Vendidos
          </div>
        </div>

        <div className='cardReports'>
          <div>
            <div className="numbersReports">
              {new Intl.NumberFormat('es-CO').format(cardsResumen.valorInvertido)}
              <i><FaIcons.FaFileInvoiceDollar /></i>
            </div>
          </div>
          <div className='cardReportsFooter'>
            valor Invertido
          </div>
        </div>

      </div>

      <div className="graficas">

        <div>
          <h3>Entradas vs Salidas</h3><br />
          <BarChart
            width={400}
            height={300}
            data={[
              { name: 'Entradas', cantidad: entradasVsSalidas.totalEntradas },
              { name: 'Salidas', cantidad: entradasVsSalidas.totalSalidas }
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="cantidad" fill="#004173" />
          </BarChart>
        </div>

        <div>
          <h3>Top 5 Productos Más Vendidos</h3><br />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductos} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cantidadVendida" fill="#ABCA7E" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
};

export default Reports;
