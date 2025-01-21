import React from 'react';
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="w-full fixed top-0 left-0 flex items-center justify-between bg-white text-black py-1 px-4 z-10">
      <img className='w-[230px]' src={logo} alt="" />
      <ul className="flex space-x-6">
        <li className="list-none text-sm">Home</li>
        <li className="list-none text-sm">Tracker</li>
        <li className="list-none text-sm">About</li>
        <li className="list-none text-sm">Resources</li>
        <li className="list-none text-sm">Support</li>
        <li className="list-none text-sm">Terms & Conditions</li>
        <li className="list-none text-sm">Contact Us</li>
        <li>
          <button className="btn bg-blue-500 text-white py-1 px-3 rounded">Login</button>
        </li>
        <li>
          <button className="btn bg-green-500 text-white py-1 px-3 rounded">Sign Up</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
