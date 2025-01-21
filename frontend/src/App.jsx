import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from './Components/Navbar';
import PageLayout from './pages/proceed';

const App = () => {
  return (
    <Router>
      {/* <Navbar/> */}
      <Routes>
        <Route path="/" element={<Navbar/>}/>
        <Route path='/signin' element={<PageLayout/>}/>
        {/* <Route path='/proceed' element={<PageLayout/>}/> */}


      </Routes>

    </Router>
  
    
  )
}

export default App
