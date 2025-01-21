import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from './Components/Navbar';
import PageLayout from './pages/proceed';
import Login from './pages/Login';
import ProfileParent from './pages/profileparent';
import Profilehealth from './pages/profilehealth';


const App = () => {
  return (
    <Router>
      {/* <Navbar/> */}
      <Routes>
        <Route path="/" element={<Navbar/>}/>
        <Route path='/signin' element={<PageLayout/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/parentprofile' element={<ProfileParent/>}/>
        <Route path='/Profilehealth' element={<Profilehealth/>}/>
       
       
        {/* <Route path='/proceed' element={<PageLayout/>}/> */}


      </Routes>

    </Router>
  
    
  )
}

export default App
