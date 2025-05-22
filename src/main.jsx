import './index.css'
import React from 'react'
import ReactDOM from "react-dom/client"
import Dashboard from './pages/Dashboard'
import Administration from './components/Administration'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import User from './components/User'
import Board from './components/Board'
import Rol from './components/Rol'
import Provider from './components/Provider'
import Home from './components/Home'
import Product from './components/Product'
import Categories from './components/Categories'
import Entries from './components/Entries'
import RolModal from './components/modal/rolModal'
import UserModal from './components/modal/userModal'
import CategoryModal from './components/modal/categoryModal'
import ProviderModal from './components/modal/providerModal'
import EditProfile from './components/EditProfile'
import ProductModal from './components/modal/productModal'
import EntriesModal from './components/modal/entriesModal'
import RegisterSale from './components/RegisterSale'
import RegisterSaleModal from './components/modal/registerSaleModal'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CompanyInformation from './components/CompanyInformation'
import Sales from './components/Sales'
import Reports from './components/reports'
import ResertPassword from './pages/ResetPassword'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/dashboard/*",
    element: <Dashboard />,
  },
  {
    path: "/administration",
    element: <Administration />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/navbar",
    element: <Navbar />
  },
  {
    path: "/sidebar",
    element: <Sidebar />
  },
  {
    path: "/editProfile/:id",
    element: <EditProfile />
  },
  {
    path: "/user",
    element: <User />
  },
  {
    path: "/board",
    element: <Board />
  },
  {
    path: "/rol",
    element: <Rol />
  },
  {
    path: "/categories",
    element: <Categories />
  },
  {
    path: "/product",
    element: <Product />
  },
  {
    path: "/provider",
    element: <Provider />
  },
  {
    path: "/rolModal",
    element: <RolModal />
  },
  {
    path: "/userModal",
    element: <UserModal />
  },
  {
    path: "/categoryModal",
    element: <CategoryModal />
  },
  {
    path: "/productModal",
    element: <ProductModal />
  },
  {
    path: "/entries",
    element: <Entries />
  },
  {
    path: "/providerModal",
    element: <ProviderModal />
  },
  {
    path: "/entriesModal",
    element: <EntriesModal />
  },
  {
    path: "/registerSale",
    element: <RegisterSale />
  },
  {
    path: "/registerSaleModal",
    element: <RegisterSaleModal />
  },
  {
    path: "/companyInformation",
    element: <CompanyInformation />
  },
  {
    path: "/sales",
    element: <Sales />
  },
  {
    path: "/reports",
    element: <Reports />
  },
  {
    path: "/resertPassword",
    element: <ResertPassword />
  }
  
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);