import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from './Components/Navbar';
import PageLayout from './pages/proceed';
import Login from './pages/Login';
import ProfileParent from './pages/profileparent';
import Profilehealth from './pages/profilehealth';
import Home from './pages/home';
import Tracker from './pages/Tracker';
import Contact from './pages/contact';
import About from './pages/About';
import Support from './pages/support';



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/" element={<Navbar/>}/>
        <Route path="/contact" element={<Contact />} />
        <Route path='/signin' element={<PageLayout/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/parentprofile' element={<ProfileParent/>}/>
        <Route path='/Profilehealth' element={<Profilehealth/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/support' element={<Support/>}/>

       
       
        {/* <Route path='/proceed' element={<PageLayout/>}/> */}


      </Routes>

    </Router>
  
    
  )
}

export default App
