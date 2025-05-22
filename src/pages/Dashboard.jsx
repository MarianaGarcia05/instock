import '../App.css'
import React from 'react'
import '../styles/Dashboard.css'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Board from '../components/Board'

const Dashboard = () => {
  return (
    <div className='contentDashboard'>
      <Navbar />
      <div className='wrapperContent'>
        <Sidebar />
        <div className="boardWrapper">
          <Board />
        </div>
      </div>
    </div>
  )
}

export default Dashboard;
