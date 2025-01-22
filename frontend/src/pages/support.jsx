import React from 'react';
import { User } from 'lucide-react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const Support = () => {
  return (
    <>
     <Navbar/>
    <div className="max-w-6xl mx-auto px-4 py-12">
      
      <h2 className="text-lg font-semibold text-purple-900 mb-4">Contact your Healthcare Provider</h2>
     
      
      <div className="bg-purple-50 rounded-lg p-6 flex gap-9">
        <div className="flex-shrink-0">
          <div className="w-60 h-16 bg-sky-400 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <div className="flex-grow space-y-2">
          <div className="flex gap-0.5">
            <span className="min-w-60">Name</span>
            <span className="text-gray-700">: Mrs. Jenny Alexy</span>
          </div>
          
          <div className="flex gap-0.5">
            <span className="min-w-60">Designation</span>
            <span className="text-gray-700">: Midwife</span>
          </div>
          
          <div className="flex gap-0.5">
            <span className="min-w-60">Contact info</span>
            <span className="text-gray-700">: 0753563253</span>
          </div>
          
          <div className="flex gap-0.5">
            <span className="min-w-60">Location</span>
            <span className="text-gray-700">: Road 2, medical center</span>
          </div>
          
          <div className="flex gap-0.5">
            <span className="min-w-60">Available</span>
            <span className="text-gray-700">: 8 am - 4:30 pm</span>
          </div>
        </div>
      </div>
      
    </div>
    <Footer/>
    </>
  );
};

export default Support;