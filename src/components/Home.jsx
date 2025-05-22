import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Home.css';

const Home = () => {
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const carruselRef = useRef(null);

  const scroll = (direction) => {
  if (carruselRef.current) {
    const carrusel = carruselRef.current;
    const cardWidth = carrusel.querySelector('.cardCarrusel')?.offsetWidth || 0;
    const scrollAmount = cardWidth * 3; // mueve 3 tarjetas

    carrusel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }
};


  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/stock')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const lowStockProducts = data.filter(item => item.stock <= 5);
        setLowStock(lowStockProducts);
      });
  }, []);

  const [categoriasMasVendidas, setCategoriasMasVendidas] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/reports/categorias-mas-vendidas')
      .then(res => res.json())
      .then(data => {
        setCategoriasMasVendidas(data);
      })
      .catch(err => {
        console.error(err);
        setCategoriasMasVendidas([]);
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:3000/api/reports/top-productos-vendidos?year=2025&month=5')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.productos)) {
          setProductosMasVendidos(data.productos);
        } else if (Array.isArray(data)) {
          setProductosMasVendidos(data);
        } else {
          console.error('Formato de respuesta no esperado:', data);
          setProductosMasVendidos([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setProductosMasVendidos([]);
      });
  }, []);

  return (
    <div className='contenedorHome'>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Bienvenido a <span>IN STOCK</span></h1>
            <p>Control total sobre tu inventario en una sola plataforma.</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="titulosHome">Categorías más vendidas</h2>
        <div className="grid-categorias">
          {categoriasMasVendidas.length === 0 ? (
            <p>No hay categorías registradas.</p>
          ) : (
            categoriasMasVendidas.map((categoria) => (
              <div key={categoria.id} className="card-categoria">
                <h3>{categoria.category}</h3>
                <p>Total ventas: {categoria.totalVentas}</p>
              </div>
            ))
          )}
        </div>

        {/* Productos más vendidos */}
        <div>
          <h2 className="titulosHome">Productos más vendidos</h2>

          <div className="carrusel-container">
            <button className="btn-carrusel btn-prev" onClick={() => scroll(-1)}>&lt;</button>
            <div className="carrusel" ref={carruselRef}>
              {Array.isArray(productosMasVendidos) && productosMasVendidos.length > 0 ? (
                productosMasVendidos.map((producto, index) => (
                  <div className="cardCarrusel" key={index}>
                    <img src={producto.image} alt={producto.productName} />
                    <h3>{producto.productName}</h3>
                  </div>
                ))
              ) : (
                <p>No hay productos registrados.</p>
              )}
            </div>
            <button className="btn-carrusel btn-next" onClick={() => scroll(1)}>&gt;</button>
          </div>
        </div>
        <div>
          <h2 className="titulosHome">Productos con stock bajo</h2>
          {lowStock.length === 0 ? (
            <p className="mensaje-sin-stock">No hay productos con stock bajo.</p>
          ) : (
            <div className="grid-stock">
              {lowStock.map((product) => (
                <div key={product.id} className="card-producto">
                  <img
                    src={product.image}
                    // alt={product.productName}
                    className="imagen-producto"
                  />
                  <h3 className="nombre-producto">{product.productName}</h3>
                  <p className="stock-producto">Stock: {product.stock}</p>

                  {product.stock === 0 ? (
                    <span className="sin-stock">Sin stock</span>
                  ) : (
                    <span className="stock-bajo">Stock bajo</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
