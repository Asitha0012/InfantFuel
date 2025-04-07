import React from 'react';
import { User } from 'lucide-react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const Support = () => {
  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl w-full px-4 py-6 space-y-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-purple-900 text-center mb-6">
            Contact your Healthcare Provider
          </h2>

          {/* First contact */}
          <div className="bg-purple-50 rounded-lg p-6 flex gap-9 mb-6 w-full max-w-xl mx-auto">
            <div className="flex-shrink-0">
              <div className="w-24 h-16 bg-sky-400 rounded-lg flex items-center justify-center overflow-hidden">
                <User className="w-full h-full object-cover text-white" />
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

          {/* Second contact */}
          <div className="bg-purple-50 rounded-lg p-6 flex gap-9 mb-6 w-full max-w-xl mx-auto">
            <div className="flex-shrink-0">
              <div className="w-24 h-16 bg-sky-400 rounded-lg flex items-center justify-center overflow-hidden">
                <User className="w-full h-full object-cover text-white" />
              </div>
            </div>

            <div className="flex-grow space-y-2">
              <div className="flex gap-0.5">
                <span className="min-w-60">Name</span>
                <span className="text-gray-700">: Mr. John Smith</span>
              </div>

              <div className="flex gap-0.5">
                <span className="min-w-60">Designation</span>
                <span className="text-gray-700">: General Practitioner</span>
              </div>

              <div className="flex gap-0.5">
                <span className="min-w-60">Contact info</span>
                <span className="text-gray-700">: 0734567890</span>
              </div>

              <div className="flex gap-0.5">
                <span className="min-w-60">Location</span>
                <span className="text-gray-700">: Green Valley Clinic</span>
              </div>

              <div className="flex gap-0.5">
                <span className="min-w-60">Available</span>
                <span className="text-gray-700">: 9 am - 5 pm</span>
              </div>
            </div>
          </div>

          {/* Third contact */}
          <div className="bg-purple-50 rounded-lg p-6 flex gap-9 w-full max-w-xl mx-auto">
            <div className="flex-shrink-0">
              <div className="w-24 h-16 bg-sky-400 rounded-lg flex items-center justify-center overflow-hidden">
                <User className="w-full h-full object-cover text-white" />
              </div>
            </div>

            <div className="flex-grow space-y-2">
              <div className="flex gap-0.5">
                <span className="min-w-60">Name</span>
                <span className="text-gray-700">: Dr. Sarah Brown</span>
              </div>

              <div className="flex gap-0.5">
                <span className="min-w-60">Designation</span>
                <span className="text-gray-700">: Pediatrician</span>
              </div>

              <div className="flex gap-0.5">
                <span className="min-w-60">Contact info</span>
                <span className="text-gray-700">: 0789123456</span>
              </div>

              <div className="flex gap-0.5">
                <span className="min-w-60">Location</span>
                <span className="text-gray-700">: Children's Health Clinic</span>
              </div>

              <div className="flex gap-0.5">
                <span className="min-w-60">Available</span>
                <span className="text-gray-700">: 10 am - 6 pm</span>
              </div>
            </div>
          </div>

        </div>
      
      </div>
      <Footer />
    </>
  );
};

export default Support;
