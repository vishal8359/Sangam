import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/navbar'
import { Toaster } from 'react-hot-toast';
import MySociety from './pages/MySociety';


const App = () => {

  return(
    
      <div className='text-default min-h-screen text-gray-700 bg-white'>

        <Navbar/>

        <Toaster />

        <div>
          <Routes>
            
          </Routes>
        </div>
      </div>
    
  )
}

export default App;