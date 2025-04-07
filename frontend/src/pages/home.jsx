import Navbar from '../Components/Navbar';
import googlePlay from '../assets/google-play.png';
import hero from '../assets/hero.png';
import hero2 from '../assets/hero2.png';
import growth from '../assets/growth.png';
import nutrition from '../assets/nutrition.png';
import babyreport from '../assets/babyreport.png';
import babydoc from '../assets/babydoc.png';
import Footer from '../Components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

    <div className="container mx-auto px-4 py-12 md:py-20">
      {/* Navbar */}
      {/* Main Content */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-10">
        {/* Left Section */}
        <div className="md:w-1/2">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Infant Growth And Nutritional Wellness Tracker
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-6">
            Available for Android
          </p>
          <a href="#" className="inline-block">
            <img src={googlePlay} alt="Google Play" className="h-16" />
          </a>
        </div>

        {/* Right Section */}
        <div className="md:w-1/2 flex justify-center md:justify-end gap-4 relative">
          <div className="w-48 md:w-64 ml-14">
            <img src={hero} alt="Phone Mockup 1" className="w-full h-auto" />
          </div>
          <div className="w-32 md:w-40 mt-24 mr-24">
            <img src={hero2} alt="Phone Mockup 2" className="w-full h-auto" />
          </div>
        </div>
      </div>
    </div>

    <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {['Track Growth', 'Monitor Nutrition', 'Get Insights'].map((feature) => (
              <div key={feature} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">{feature}</h3>
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
          
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left side - Image */}
            <div className="md:w-1/2">
              <img 
                src={growth} 
                alt="" 
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>

            {/* Right side - Content */}
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
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

      <section className="bg-indigo-100 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left side - Image */}
            <div className="md:w-1/2">
            <h2 className="text-4xl md:text-4xl font-bold mb-8">
                Nutrition Tracker
              </h2>
              <div className="space-y-4 text-xl text-gray-700">
                <p>
                  Log Daily Nutritional Intake to see if it meets recommended dietary guidelines. Receive personalized recommendations to optimize your baby&apos;s nutritional wellbeing.
                </p>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="md:w-1/2">
            <img 
              src={nutrition} 
              alt="" 
              className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-stone-300 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left side - Image */}
            <div className="md:w-1/2">
              <img 
                src={babyreport} 
                alt="" 
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>

            {/* Right side - Content */}
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Generate reports and analyze growth trends
                
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p>
                Generate detialed reports and visualize dynamic growth charts to track your infant&apos;s progress over time. Compare growth patterns against standardized benchmarks. Identify trends, and receive alerts for any deviations.
                 
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-orange-100 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left side - Image */}
            <div className="md:w-1/2">
            <h2 className="text-4xl md:text-4xl font-bold mb-8">
            Stay ahead on Immunizations
              </h2>
              <div className="space-y-4 text-xl text-gray-700">
                <p>
                Keep track of your baby&apos;s vaccination schedule with ease. Get reminders for upcoming vaccines. Maintain a digital record of completed immunizations, and access essential information about each vaccine to ensure your little one stays protected and healthy. 
                </p>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="md:w-1/2">
            <img 
              src={babydoc} 
              alt="" 
              className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
            <footer/>
          </div>
          
        </div>
<<<<<<< Updated upstream
      </section>
      <Footer/>
=======
        
      </section>
      <Footer/>
     
>>>>>>> Stashed changes

    </div>
  );
};

export default Home;

