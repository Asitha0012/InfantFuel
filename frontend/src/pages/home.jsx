import Navbar from '../Components/Navbar';
import googlePlay from '../assets/google-play.png';
import hero from '../assets/hero.png';
import hero2 from '../assets/hero2.png';
import baby01 from '../assets/baby01.jpg';
import baby02 from '../assets/baby02.jpg';
import baby03 from '../assets/baby03.jpg';
import baby04 from '../assets/baby04.jpg';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-30 via-white to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between mt-10">
          {/* Left Section */}
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight drop-shadow-sm">
              Infant Growth And Nutritional Wellness Tracker
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-6">
              Available for Android
            </p>
            <a href="#" className="inline-block">
              <img src={googlePlay} alt="Google Play" className="h-16" />
            </a>
          </div>

          {/* Right Section - Phone Images */}
          <div className="md:w-1/2 flex justify-center md:justify-end gap-4 relative">
            <div className="w-48 md:w-64 ml-14 drop-shadow-xl">
              <img src={hero} alt="Phone Mockup 1" className="w-full h-auto rounded-2xl" />
            </div>
            <div className="w-32 md:w-40 mt-24 mr-24 drop-shadow-lg">
              <img src={hero2} alt="Phone Mockup 2" className="w-full h-auto rounded-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <section className="bg-gradient-to-r from-orange-100 via-white to-blue-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              {
                feature: 'Track Growth',
                img: baby01,
                alt: 'Track Growth',
                desc: "Easily track your baby’s weight, height, and head circumference over time with visual charts. Stay informed about their growth milestones."
              },
              {
                feature: 'Monitor Nutrition',
                img: baby02,
                alt: 'Monitor Nutrition',
                desc: "Keep an eye on your baby’s feeding patterns and nutritional intake. Get guidance based on age-appropriate dietary needs to support optimal health."
              },
              {
                feature: 'Get Insights',
                img: baby03,
                alt: 'Get Insights',
                desc: "Receive personalized insights and alerts about your baby’s growth trends, upcoming clinic visits, and vaccination schedules — all in one place."
              },
            ].map(({ feature, img, alt, desc }) => (
              <div key={feature} className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center hover:shadow-2xl transition-shadow duration-200">
                <img src={img} alt={alt} className="w-28 h-28 object-cover rounded-full mb-4 border-4 border-orange-200 shadow" />
                <h3 className="text-xl font-semibold mb-3 text-orange-700">{feature}</h3>
                <p className="text-gray-600 text-center">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
        
      {/* Growth Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left side - Image */}
            <div className="md:w-1/2 flex justify-center">
              <img 
                src={baby02} 
                alt="Monitor Milestones" 
                className="w-96 h-auto rounded-2xl shadow-2xl border-4 border-orange-100"
              />
            </div>

            {/* Right side - Content */}
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-blue-900">
                Monitor Milestones With Precision
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p>
                  Monitor your Infant&apos;s growth by recording key indicators like weight, height, head Circumference, and BMI. Visualize trends over time and compare them with standardized growth charts to ensure healthy development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nutrition Section */}
      <section className="bg-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left side - Content */}
            <div className="md:w-1/2 order-2 md:order-1">
              <h2 className="text-4xl md:text-4xl font-bold mb-8 text-orange-700">
                Nutrition Tracker
              </h2>
              <div className="space-y-4 text-xl text-gray-700">
                <p>
                  Log Daily Nutritional Intake to see if it meets recommended dietary guidelines. Receive personalized recommendations to optimize your baby&apos;s nutritional wellbeing.
                </p>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="md:w-1/2 order-1 md:order-2 flex justify-center">
              <img 
                src={baby01} 
                alt="Nutrition Tracker" 
                className="w-96 h-auto rounded-2xl shadow-2xl border-4 border-orange-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Reports Section */}
      <section className="bg-stone-100 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left side - Image */}
            <div className="md:w-1/2 flex justify-center">
              <img 
                src={baby04} 
                alt="Growth Reports" 
                className="w-96 h-auto rounded-2xl shadow-2xl border-4 border-orange-100"
              />
            </div>

            {/* Right side - Content */}
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-blue-900">
                Generate reports and analyze growth trends
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p>
                  Generate detailed reports and visualize dynamic growth charts to track your infant&apos;s progress over time. Compare growth patterns against standardized benchmarks. Identify trends, and receive alerts for any deviations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Immunization Section */}
      <section className="bg-orange-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left side - Content */}
            <div className="md:w-1/2">
              <h2 className="text-4xl md:text-4xl font-bold mb-8 text-orange-700">
                Stay ahead on Immunizations
              </h2>
              <div className="space-y-4 text-xl text-gray-700">
                <p>
                  Keep track of your baby&apos;s vaccination schedule with ease. Get reminders for upcoming vaccines. Maintain a digital record of completed immunizations, and access essential information about each vaccine to ensure your little one stays protected and healthy. 
                </p>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="md:w-1/2 flex justify-center">
              <img 
                src={baby03} 
                alt="Immunization" 
                className="w-96 h-auto rounded-2xl shadow-2xl border-4 border-orange-100"
              />
            </div>
          </div>
        </div>
      </section>
     
    </div>
  );
};

export default Home;