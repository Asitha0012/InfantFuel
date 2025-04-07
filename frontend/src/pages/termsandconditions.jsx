import React from 'react';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Code2,
  Ban,
} from 'lucide-react';
import Footer from '../Components/Footer';
import Navbar from '../Components/Navbar';

const termsData = [
  {
    title: 'Acceptance of Terms',
    description:
      'By accessing or using InfantFuel, users confirm their agreement to these Terms and Conditions. If a user does not agree, they must refrain from using the app.',
    icon: <ShieldCheck className="text-purple-600" size={28} />,
    bg: 'bg-purple-50',
  },
  {
    title: 'User Responsibility',
    description:
      'Users are responsible for the accuracy of data entered including growth and nutritional logs. This app does not replace professional medical advice.',
    icon: <UserCheck className="text-purple-600" size={28} />,
    bg: 'bg-pink-50',
  },
  {
    title: 'Data Usage & Privacy',
    description:
      'User data is securely stored with encryption. It will not be shared without consent. By using the app, you agree to our Privacy Policy.',
    icon: <Lock className="text-purple-600" size={28} />,
    bg: 'bg-orange-50',
  },
  {
    title: 'Medical Disclaimer',
    description:
      'InfantFuel is not a diagnostic tool. It is for informational purposes only. Consult professionals for any medical decisions.',
    icon: <AlertCircle className="text-purple-600" size={28} />,
    bg: 'bg-yellow-50',
  },
  {
    title: 'Security & Access',
    description:
      'Users are responsible for keeping their login credentials secure and must avoid sharing their account information with others.',
    icon: <KeyRound className="text-purple-600" size={28} />,
    bg: 'bg-blue-50',
  },
  {
    title: 'Modifications',
    description:
      'The development team reserves the right to update or discontinue any part of the app with reasonable notice.',
    icon: <RefreshCw className="text-purple-600" size={28} />,
    bg: 'bg-teal-50',
  },
  {
    title: 'Intellectual Property',
    description:
      'All content, design, and code within InfantFuel is owned by the development team and cannot be reused without permission.',
    icon: <Code2 className="text-purple-600" size={28} />,
    bg: 'bg-rose-50',
  },
  {
    title: 'Limitation of Liability',
    description:
      'The team is not liable for any damage or data loss resulting from app usage or health misinterpretation.',
    icon: <Ban className="text-purple-600" size={28} />,
    bg: 'bg-green-50',
  },
];

const Termsandconditions = () => {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="px-6 py-12 md:px-16 lg:px-32">
        <h1 className="text-4xl font-bold text-center text-purple-600 mb-10">
          Terms and Conditions
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {termsData.map((term, index) => (
            <div
              key={index}
              className={`${term.bg} shadow-md rounded-full flex items-center gap-4 px-6 py-6 border border-gray-200 transition hover:shadow-lg`}
            >
              <div className="flex-shrink-0">{term.icon}</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{term.title}</h3>
                <p className="text-sm text-gray-700">{term.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Termsandconditions;
