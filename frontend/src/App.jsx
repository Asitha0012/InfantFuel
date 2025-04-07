import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageLayout from './pages/proceed';
import Login from './pages/Login';
import ProfileParent from './pages/profileparent';
import Profilehealth from './pages/profilehealth';
import Home from './pages/home';
import Tracker from './pages/Tracker'; 
import Contact from './pages/contact';
import About from './pages/About';
import Footer from './Components/Footer';
import Support from './pages/support';
import Termsandconditions from './pages/termsandconditions';
import Profile from './pages/profile';
import Notification from './pages/notification';
import GrowthTracking from './pages/growthtracking';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/" element={<><Home /><Footer /></>} /> {/* Default route */}
        <Route path="/contact" element={<Contact />} />
        <Route path='/signin' element={<PageLayout/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/parentprofile' element={<ProfileParent/>}/>
        <Route path='/Profilehealth' element={<Profilehealth/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/support' element={<Support/>}/>
        <Route path='/termsandconditions' element={<Termsandconditions/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/notification' element={<Notification/>}/>
        <Route path="/growth-tracking" element={<GrowthTracking />} />


       
       
        {/* <Route path='/proceed' element={<PageLayout/>}/> */}


      </Routes>
    </Router>
  );
};

export default App;