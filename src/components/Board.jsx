import '../App.css'
import React from 'react'
import User from '../components/User'
import Administration from '../components/Administration'
import Rol from '../components/Rol'
import Home from '../components/Home'
import Categories from '../components/Categories'
import Provider from '../components/Provider'
import Product from '../components/Product'
import Stock from '../components/Stock'
import RegisterSale from './RegisterSale'
import { Routes, Route } from 'react-router-dom'
import CompanyInformation from '../components/CompanyInformation'
import EditProfile from './EditProfile'
import Entries from './Entries'
import Sales from './Sales'
import Reports from './reports'

const Board = () => {
    return (
        <div className='contentBoard'>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/home' element={<Home />} />
                <Route path='/administration' element={<Administration />} />
                <Route path='/user' element={<User />} />
                <Route path='/rol' element={<Rol />} />
                <Route path='/categories' element={<Categories />} />
                <Route path='/provider/' element={<Provider />}/>
                <Route path='/product/' element={<Product />}/>
                <Route path='/stock/' element={<Stock />}/>
                <Route path='/registerSale/' element={<RegisterSale />}/>
                <Route path='/companyInformation' element={<CompanyInformation />}/>
                <Route path='/editProfile/:id' element={<EditProfile />}/>
                <Route path='/entries/' element={<Entries />}/>
                <Route path='/sales' element={<Sales />}/>
                <Route path='/reports' element={<Reports />}/>
            </Routes>
        </div>
    )
}

export default Board
