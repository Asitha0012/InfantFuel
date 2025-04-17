import React from 'react';
import { Ruler, Edit, FileText, Target, Heart, BarChart } from 'lucide-react';
import Image from '../assets/InfantFuel logo-01.png';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const featuresData = [
  {
    title: 'Growth Tracking',
    description: "Monitor and track your infant's height, weight, and other growth parameters.",
    icon: <Ruler className="text-purple-600" size={28} />,
    bg: 'bg-purple-50',
  },
  {
    title: 'Nutritional Insights',
    description: 'Get nutrition recommendations based on logged data.',
    icon: <Heart className="text-purple-600" size={28} />,
    bg: 'bg-pink-50',
  },
  {
    title: 'Interactive Dashboard',
    description: 'Easy-to-read charts and vaccination records at your fingertips.',
    icon: <BarChart className="text-purple-600" size={28} />,
    bg: 'bg-orange-50',
  },
  {
    title: 'Professional Guidance',
    description: 'Access expert advice and resources for infant care.',
    icon: <Edit className="text-purple-600" size={28} />,
    bg: 'bg-yellow-50',
  },
  {
    title: 'Report Generation',
    description: 'Customized reports of growth progress, vaccination history, and nutritional analysis.',
    icon: <FileText className="text-purple-600" size={28} />,
    bg: 'bg-blue-50',
  },
  {
    title: 'Personalized Insights',
    description: 'Receive tailored insights to ensure your baby’s healthy development.',
    icon: <Target className="text-purple-600" size={28} />,
    bg: 'bg-teal-50',
  },
];

const About = () => {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      {/* Welcome Section */}
      <div className="px-6 py-12 md:px-16 lg:px-32">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-300 via-purple-300 to-stone-600 bg-clip-text text-transparent">
              Welcome to InfantFuel
            </h1>
            <p className="text-gray-700">
              We empower parents and healthcare providers with tools to monitor and enhance infant growth and nutritional insights.
            </p>
            <p className="text-gray-700">
              Our platform is designed to track key health metrics, provide personalized insights, and ensure your little one&apos;s development stays on the right path.
            </p>
          </div>
          <div className="flex-shrink-0">
            <img
              src={Image}
              alt="InfantFuel Logo"
              className="w-[300px] h-[300px] object-contain rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-12 md:px-16 lg:px-32 bg-gray-50">
        <h2 className="text-3xl font-bold text-center text-purple-600 mb-10">
          Features & Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8">
          {featuresData.map((feature, index) => (
            <div
              key={index}
              className={`${feature.bg} shadow-md rounded-lg flex items-center gap-4 px-6 py-6 border border-gray-200 transition hover:shadow-lg`}
            >
              <div className="flex-shrink-0">{feature.icon}</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-700">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="px-6 py-12 md:px-16 lg:px-32 text-center">
        <h2 className="text-3xl font-bold text-purple-600 mb-6">Our Mission</h2>
        <p className="max-w-4xl mx-auto text-gray-700">
          Our mission is to simplify the tracking of infant growth and nutritional wellness by providing an easy-to-use solution for both parents and healthcare providers, with a focus on digitalizing traditional health record systems.
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default About;