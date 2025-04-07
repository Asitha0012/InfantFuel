import React from 'react';
import { Ruler, Layout, Share2, Edit, FileText } from 'lucide-react';
import Image from '../assets/InfantFuel logo-01.png';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const WelcomeSection = () => {
    return (
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-300 via-purple-300 to-stone-600 bg-clip-text text-transparent pt-10">
              Welcome<br />to InfantFuel
            </h1>
            <div className="max-w-lg space-y-4 text-black">
              <p>
                We empower parents and healthcare providers with tools to monitor and enhance infant growth and nutritional insights.
              </p>
              <p>
                Our platform is designed to track key health metrics, provide personalized insights, and ensure your little one&apos;s development stays on the right path.
              </p>
            </div>
          </div>
          <div className="w-48 h-48 flex items-center justify-center rounded-full bg-transparent">
            <img 
             src={Image}  
             alt="InfantFuel Logo" 
             className="w-[300px] h-[300px] object-contain rounded-full"
            />
          </div>
        </div>
      </div>
    );
};

const FeatureCard = ({ title, description, icons, iconPosition }) => (
    <div className="relative bg-white rounded-full py-4 px-6 shadow-sm max-w-md flex items-center gap-4">
      {iconPosition === 'left' && (
        <div className="absolute left-0 transform -translate-x-8 flex gap-2">
          {icons.map((Icon, index) => (
            <Icon key={index} className="w-6 h-6 text-gray-400" />
          ))}
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-medium text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {iconPosition === 'right' && (
        <div className="absolute right-0 transform translate-x-8 flex gap-2">
          {icons.map((Icon, index) => (
            <Icon key={index} className="w-6 h-6 text-gray-400" />
          ))}
        </div>
      )}
    </div>
  );
  
  const FeaturesSectionPart1 = () => (
    <div className="bg-[#db7e6c] py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="space-y-8 ">
          <FeatureCard
            title="Growth Tracking"
            description="Monitor and track your infant's height, weight, and other growth parameters."
            icons={[Ruler, Layout]}
            iconPosition="right"
          />
          <div className="flex justify-end">
            <FeatureCard
              title="Nutritional Insights"
              description="Get nutrition recommendations based on logged data."
              icons={[Share2]}
              iconPosition="left"
            />
          </div>
        </div>
      </div>
    </div>
  );
  
  const FeaturesSectionPart2 = () => (
    <div className="bg-orange-200 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="space-y-8">
          <FeatureCard 
            title="Interactive Dashboard"
            description="Easy-to-read charts and vaccination records at your fingertips."
            icons={[Share2]}
            iconPosition="right"
          />
          <div className="flex justify-end">
            <FeatureCard
              title="Professional Guidance"
              description="Access expert advice and resources for infant care."
              icons={[Edit]}
              iconPosition="left"
            />
          </div>
          <FeatureCard
            title="Report Generation"
            description="Customized reports of growth progress over a specific time, vaccination history, nutritional analysis etc."
            icons={[FileText]}
            iconPosition="right"
          />
        </div>
      </div>
    </div>
  );
const MissionSection = () => (
  <div className="max-w-5xl mx-auto px-6 py-12 text-center">
    <h2 className="text-2xl font-medium text-[#55498f] mb-6">Our Mission</h2>
    <p className="max-w-2xl mx-auto text-gray-700">
      Our mission is to simplify the tracking of infant growth and nutritional wellness by providing an easy-to-use solution for both parents and healthcare providers, with a focus on digitalizing traditional health record systems.
    </p>
  </div>
);

const About = () => (
  <div className="min-h-screen bg-white">
     <Navbar/>
    <WelcomeSection />
    <div className="text-center my-12">
      <h2 className="text-2xl font-medium text-[#815A54]">Features & Services</h2>
    </div>
    <FeaturesSectionPart1 />
    <FeaturesSectionPart2 />
    <MissionSection />
    <Footer/>
  </div>
);

export default About;
