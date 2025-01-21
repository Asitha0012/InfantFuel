import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from './Components/Navbar';
import PageLayout from './pages/login';

const App = () => {
  return (
    <Router>
      <Navbar/>
      <Routes>
        {/* <Route path="/" element={<Home/>}/> */}
        <Route path='/signin' element={<PageLayout/>}/>
        {/* <Route path='/login' element={<PageLayout/>}/> */}


      </Routes>

    </Router>
  
    
  )
}

export default App
