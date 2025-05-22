const db = require('../config/db');
const ExcelJS = require('exceljs');

const getEntradasVsSalidas = (req, res) => {
  const { year, month } = req.query;

  const entradasQuery = `
    SELECT SUM(quantity) AS totalEntradas
    FROM entries
    WHERE YEAR(entryDate) = ? AND MONTH(entryDate) = ?
  `;

  const salidasQuery = `
    SELECT SUM(amount) AS totalSalidas
    FROM sales
    WHERE YEAR(saleDate) = ? AND MONTH(saleDate) = ?
  `;

  db.query(entradasQuery, [year, month], (err, entradasResult) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(salidasQuery, [year, month], (err2, salidasResult) => {
      if (err2) return res.status(500).json({ error: err2.message });

      res.json({
        totalEntradas: entradasResult[0].totalEntradas || 0,
        totalSalidas: salidasResult[0].totalSalidas || 0
      });
    });
  });
};

const getTopProductosVendidos = (req, res) => {
  const { year, month } = req.query;

  const query = `
    SELECT p.productName, p.image, SUM(s.amount) AS cantidadVendida
    FROM sales s
    JOIN products p ON s.product_id = p.id
    WHERE YEAR(s.saleDate) = ? AND MONTH(s.saleDate) = ?
    GROUP BY p.productName, p.image
    ORDER BY cantidadVendida DESC
    LIMIT 5
  `;

  db.query(query, [year, month], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const getCategoriasMasVendidas = (req, res) => {
  const query = `
    SELECT c.id, c.category, COUNT(d.product_id) AS totalVentas
    FROM sales d
    JOIN products p ON d.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    GROUP BY c.id, c.category
    ORDER BY totalVentas DESC
    LIMIT 5;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener categorías más vendidas:', err);
      return res.status(500).json({ error: 'Error al consultar categorías más vendidas' });
    }
    res.json(results);
  });
};


const getCardsResumen = (req, res) => {
  const { year, month } = req.query;

  const totalVentasQuery = `
    SELECT IFNULL(SUM(totalCost), 0) AS totalVentas
    FROM sales
    WHERE YEAR(saleDate) = ? AND MONTH(saleDate) = ?
  `;

  const totalProductosVendidosQuery = `
    SELECT IFNULL(SUM(amount), 0) AS totalProductosVendidos
    FROM sales
    WHERE YEAR(saleDate) = ? AND MONTH(saleDate) = ?
  `;

  const valorInvertidoQuery = `
    SELECT IFNULL(SUM(totalCost), 0) AS valorInvertido
    FROM entries
    WHERE YEAR(entryDate) = ? AND MONTH(entryDate) = ?
  `;

  // Primero total ventas
  db.query(totalVentasQuery, [year, month], (err, ventasResult) => {
    if (err) return res.status(500).json({ error: err.message });

    // total productos vendidos
    db.query(totalProductosVendidosQuery, [year, month], (err2, productosResult) => {
      if (err2) return res.status(500).json({ error: err2.message });

      // valor invertido
      db.query(valorInvertidoQuery, [year, month], (err3, invertidoResult) => {
        if (err3) return res.status(500).json({ error: err3.message });

        // ganancia neta = totalVentas - valorInvertido
        const gananciaNeta = ventasResult[0].totalVentas - invertidoResult[0].valorInvertido;

        res.json({
          totalVentas: ventasResult[0].totalVentas,
          gananciaNeta,
          totalProductosVendidos: productosResult[0].totalProductosVendidos,
          valorInvertido: invertidoResult[0].valorInvertido
        });
      });
    });
  });
};

const exportExcel = (req, res) => {
  const { year, month } = req.query;

  const detalleQuery = `
    SELECT 
      p.productName,
      pr.companyName AS proveedor,
      SUM(s.amount) AS cantidadVendida,
      (SELECT e.unitCost FROM entries e WHERE e.product_id = s.product_id ORDER BY e.entryDate DESC LIMIT 1) AS costoUnitario,
      s.unitCost AS precioVentaUnitario,
      SUM(s.totalCost) AS totalVenta,
      SUM((s.unitCost - (SELECT e.unitCost FROM entries e WHERE e.product_id = s.product_id ORDER BY e.entryDate DESC LIMIT 1)) * s.amount) AS gananciaNeta,
      st.stock AS productosDisponibles,
      s.saleDate AS fecha
    FROM sales s
    JOIN products p ON s.product_id = p.id
    JOIN provider pr ON p.provider_id = pr.id
    LEFT JOIN stock st ON st.product_id = p.id
    WHERE YEAR(s.saleDate) = ? AND MONTH(s.saleDate) = ?
    GROUP BY s.product_id, s.unitCost
    ORDER BY cantidadVendida DESC
  `;

  const valorInvertidoQuery = `
    SELECT IFNULL(SUM(totalCost), 0) AS valorInvertido
    FROM entries
    WHERE YEAR(entryDate) = ? AND MONTH(entryDate) = ?
  `;

  db.query(detalleQuery, [year, month], (err, detalleResults) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(valorInvertidoQuery, [year, month], async (err2, valorInvertidoResults) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const valorInvertido = valorInvertidoResults[0].valorInvertido;

      // Crear workbook y hoja detalle
      const workbook = new ExcelJS.Workbook();
      const detalleSheet = workbook.addWorksheet(`Reporte_${year}_${month}`);

      // Columnas detalle
      detalleSheet.columns = [
        { header: 'Producto', key: 'productName', width: 30 },
        { header: 'Proveedor', key: 'proveedor', width: 30 },
        { header: 'Valor Unitario', key: 'costoUnitario', width: 20 },
        { header: 'Cantidad Vendida', key: 'cantidadVendida', width: 20 },
        { header: 'Precio Venta Unitario', key: 'precioVentaUnitario', width: 20 },
        { header: 'Total Ventas', key: 'totalVenta', width: 20 },
        { header: 'Ganancia Neta', key: 'gananciaNeta', width: 20 },
        { header: 'Fecha', key: 'fecha', width: 15 }
      ];

      // Estilo encabezado detalle
      detalleSheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF386641' }
        };
        cell.alignment = { horizontal: 'center' };
      });

      // Variables para totales que acumularemos
      let totalCantidadVendida = 0;
      let totalVentas = 0;
      let totalGananciaNeta = 0;

      // Agregar filas detalle y acumular totales
      detalleResults.forEach(row => {
        totalCantidadVendida += Number(row.cantidadVendida) || 0;
        totalVentas += Number(row.totalVenta) || 0;
        totalGananciaNeta += Number(row.gananciaNeta) || 0;

        detalleSheet.addRow({
          productName: row.productName,
          proveedor: row.proveedor,
          costoUnitario: row.costoUnitario,
          cantidadVendida: row.cantidadVendida,
          precioVentaUnitario: row.precioVentaUnitario,
          totalVenta: row.totalVenta,
          gananciaNeta: row.gananciaNeta,
          fecha: row.fecha ? new Date(row.fecha).toISOString().slice(0,10) : ''
        });
      });

      // Ajustar bordes y alineación en detalle
      detalleSheet.eachRow((row) => {
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      });

      // Crear segunda hoja para totales globales
      const totalesSheet = workbook.addWorksheet('Totales');

      totalesSheet.columns = [
        { header: 'Concepto', key: 'concepto', width: 30 },
        { header: 'Valor', key: 'valor', width: 20 }
      ];

      // Estilo encabezado totales
      totalesSheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF386641' }
        };
        cell.alignment = { horizontal: 'center' };
      });

      // Agregar filas con totales
      totalesSheet.addRow({ concepto: 'Total Cantidad Vendida', valor: totalCantidadVendida });
      totalesSheet.addRow({ concepto: 'Total Ventas', valor: totalVentas });
      totalesSheet.addRow({ concepto: 'Total Ganancia Neta', valor: totalGananciaNeta });
      totalesSheet.addRow({ concepto: 'Total Valor Invertido', valor: valorInvertido });

      // Estilo para las filas de totales
      totalesSheet.eachRow((row, rowNumber) => {
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          if (rowNumber > 1) {
            cell.font = { bold: true };
          }
        });
      });

      // Exportar archivo
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_${year}_${month}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
    });
  });
};


module.exports = {
  getEntradasVsSalidas,
  getTopProductosVendidos,
  getCardsResumen,
  getCategoriasMasVendidas,
  exportExcel
};
