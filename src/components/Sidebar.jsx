import '../App.css'
import React, { useState, useEffect } from 'react'
import '../styles/Sidebar.css'
import Logo from '../assets/Logo.png'
import * as TbIcons from 'react-icons/tb'
import * as FaIcons from 'react-icons/fa'
import * as Fa6Icons from 'react-icons/fa6'
import * as SiIcons from 'react-icons/si'
import * as Io5Icons from 'react-icons/io5'
import * as Hi2Icons from 'react-icons/hi2'
import * as AiIcons from 'react-icons/ai'
// import * as Md2Icons from 'react-icons/md'
import * as LuIcons from 'react-icons/lu'
import { useNavigate, Link } from 'react-router-dom'

const Sidebar = () => {
  const [closedMenu, setClosedMenu] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    if (userInfo && userInfo !== 'undefined') {
      try {
        const parsedUser = JSON.parse(userInfo);
        console.log(parsedUser); // Verifica que los datos del usuario se recuperen correctamente
        setUser(parsedUser);
      } catch (error) {
        console.error('Error al parsear los datos del usuario:', error);
      }
    } else {
      console.log('No se encontró información de usuario en localStorage');
    }
  }, []);

  const toggleSidebar = () => {
    setClosedMenu(!closedMenu);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setUser(null);
    navigate('/');
  };

  if (!user) {
    return <div>Loading...</div>; // Mostrar un mensaje o componente de carga mientras se obtiene el usuario
  }

  return (
    <div className={`sidebar ${closedMenu ? 'closed' : ''}`}>
      <div className='sidebarContent'>
        {closedMenu ? (
          <>
            <div className='menuIcon'>
              <Io5Icons.IoMenu onClick={toggleSidebar} />
            </div>
            <ul className='menuListIcons'>
              <li><Io5Icons.IoHome /></li>
              <li><SiIcons.SiSimpleanalytics /></li>
              <li><Io5Icons.IoAnalyticsSharp /></li>
              <li><AiIcons.AiFillDollarCircle /></li>
              <li><Hi2Icons.HiDocumentChartBar /></li>
              <li><FaIcons.FaUserEdit /></li>
              {user.role === 'Administrador' && (
              <li><Io5Icons.IoSettings /></li>
              )}
              <div className='menuIcon'>
                <img src={user.avatar}
                  alt="Avatar"
                  className='userImg' />
              </div>
            </ul>
          </>

        ) : (
          <div className='content'>
            <div className='contentLogo'>
              <img src={Logo} alt="" className='logo' />
              <div><FaIcons.FaChevronLeft className='closeMenu' onClick={toggleSidebar} /></div>
            </div>
            <ul className='menuList'>
              <li><Link to='/dashboard/home' className='sidebarLink'><Io5Icons.IoHome />Inicio</Link></li>
              <li><Link to='/dashboard/stock' className='sidebarLink'><SiIcons.SiSimpleanalytics />Existencias</Link></li>
              <li><Link to='/dashboard/entries' className='sidebarLink'><Io5Icons.IoAnalyticsSharp  />Registrar entradas</Link></li>
              <li><Link to='/dashboard/registerSale' className='sidebarLink'><AiIcons.AiFillDollarCircle />Registrar venta</Link></li>
              <li><Link to='/dashboard/reports' className='sidebarLink'><Hi2Icons.HiDocumentChartBar />Reportes</Link></li>
              <li><Link to={`/dashboard/editProfile/${user?.id}`} className='sidebarLink'><FaIcons.FaUserEdit />Editar perfil</Link></li>
              {user.role === 'Administrador' && (
              <li>
                <div>
                  <span><Link to='/dashboard/administration' className='sidebarLink'><Io5Icons.IoSettings />Administración</Link></span>
                    <ul className='options'>
                      {/* <li><Link to='/dashboard/user' className='sidebarLink'><Fa6Icons.FaUserGear />Usuarios</Link></li>
                      <li><Link to='/dashboard/provider' className='sidebarLink'><Fa6Icons.FaTruckFast />Proveedores</Link></li>
                      <li><Link to='/dashboard/categories' className='sidebarLink'><TbIcons.TbCategoryFilled />Categorías</Link></li>
                      <li><Link to='/dashboard/product' className='sidebarLink'><Io5Icons.IoCopy />Productos</Link></li> */}
                      <li><Link to='/dashboard/companyInformation' className='sidebarLink'><Hi2Icons.HiBuildingStorefront />Datos de la empresa</Link></li>
                      {/* <li><Link className='sidebarLink'><Md2Icons.MdOutlinePassword />Cambiar contraseña</Link></li> */}
                    </ul>
                </div>
              </li>
              )}
              <div className="user">
                <img
                  src={user.avatar}
                  alt="Avatar"
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
                <div className="userInfo">
                  <h4>{user.names} {user.surnames}</h4>
                  <h6>{user.role}</h6>
                </div>
                <LuIcons.LuLogOut className='logUotIcon' onClick={handleLogout} />
              </div>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

