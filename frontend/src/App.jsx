import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageLayout from './pages/proceed';
import Login from './pages/Login';
import ProfileParent from './pages/profileparent';
import Profilehealth from './pages/profilehealth';
import Home from './pages/home';
import Tracker from './pages/Tracker'; 
import Contact from './pages/contact';
import About from './pages/About';
import Footer from './Components/Footer';
import Network from './pages/Network';
import Termsandconditions from './pages/termsandconditions';
import Profile from './pages/profile';
import Health from './pages/health';
import Medication from './pages/medication';
import Nutrition from './pages/nutrition';
import Nutrifluid from './pages/nutrifluid';
import Nutrisolid from './pages/nutrisolid';
import Weight from './pages/Tracker/Weight';
import PrivateRoute from './pages/Auth/PrivateRoute';

const App = () => {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<><Home /><Footer /></>} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<PageLayout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/network" element={<Network />} />
        <Route path="/termsandconditions" element={<Termsandconditions />} />
        
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/health-tracking" element={<Health />} />
          <Route path="/nutrition-tracking" element={<Nutrition />} />
          <Route path="/medication-tracking" element={<Medication />} />
          <Route path="/register/parent" element={<ProfileParent />} />
          <Route path="/register/healthcare" element={<Profilehealth />} />
          <Route path="/nutrifluid-tracking" element={<Nutrifluid />} />
          <Route path="/nutrisolid-tracking" element={<Nutrisolid />} />
          <Route path="/weight-tracking" element={<Weight />} />
          <Route path="/growth-tracking" element={<Weight />} />
          <Route path="/parentprofile" element={<ProfileParent />} />
          <Route path="/Profilehealth" element={<Profilehealth />} />
        </Route>
        
   

      </Routes>
    </Router>
  );
};

export default App;