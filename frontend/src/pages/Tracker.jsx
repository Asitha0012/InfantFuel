import React from 'react'
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import { 
  Scale,
  Ruler,
  CircleDot,
  Baby,
  Droplet,
  Grape,
  Syringe,
  Pill,
} from 'lucide-react';

const Tracker = () => {
  const navigate = useNavigate();

  const recentActivities = [
    { activity: 'Weight', date: '09/12/2024 at 10.30am', updatedBy: 'Midwife' },
    { activity: 'Height', date: '09/12/2024 at 10:00am', updatedBy: 'Midwife' },
    { activity: 'Vaccination', date: '08/12/2024 at 9:00am', updatedBy: 'Midwife' },
    { activity: 'Breastfeed', date: '08/12/2024 at 10:00am', updatedBy: 'Parent' },
  ];

  const Section = ({ title, children, onClick }) => (
    <div 
      className="bg-purple-50 p-6 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors"
      onClick={onClick}
    >
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );

  const TrackingCard = ({ icon: Icon, label }) => (
    <div className="bg-white p-4 rounded-lg flex flex-col items-center gap-2">
      <Icon className="w-8 h-8 text-purple-500" />
      <span className="text-sm text-center">{label}</span>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 space-y-10 mt-20">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Growth Tracking Section */}
          <Section title="Growth Tracking" onClick={() => navigate('/growth-tracking')}>
            <div className="grid grid-cols-3 gap-4">
              <TrackingCard icon={Scale} label="Weight" />
              <TrackingCard icon={Ruler} label="Height" />
              <TrackingCard icon={CircleDot} label="Head circumference" />
            </div>
          </Section>

          {/* Nutrition Tracking Section */}
          <Section title="Nutrition Tracking" onClick={() => navigate('/nutrition-tracking')}>
            <div className="grid grid-cols-3 gap-4">
              <TrackingCard icon={Baby} label="Breastfeeding" />
              <TrackingCard icon={Droplet} label="Fluids" />
              <TrackingCard icon={Grape} label="Solids" />
            </div>
          </Section>

          {/* Health Section */}
          <Section title="Health" onClick={() => navigate('/health-tracking')}>
            <div className="grid grid-cols-2 gap-4">
              <TrackingCard icon={Syringe} label="Vaccination" />
              <TrackingCard icon={Pill} label="Medication" />
            </div>
          </Section>

          {/* Recent Activities Section */}
          <Section title="Recent Activities" onClick={() => navigate('/recent-activities')}>
            <div className="bg-white rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2">Activity</th>
                    <th className="pb-2">Date and Time</th>
                    <th className="pb-2">Updated by</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-2">{item.activity}</td>
                      <td className="py-2">{item.date}</td>
                      <td className="py-2">{item.updatedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        {/* Upcoming Section */}
        <Section title="Upcoming" onClick={() => console.log('Upcoming clicked')}>
          <div className="bg-white rounded-lg p-4 flex justify-center">
            <div className="w-full max-w-md">
              <Calendar />
            </div>
          </div>
        </Section>

      </div>
      <Footer />
    </>
  );
};

export default Tracker;
