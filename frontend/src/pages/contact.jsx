
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';


const ContactUs = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />
    
      <div className="px-6 py-12 md:px-16 lg:px-32">
        <h1 className="text-4xl font-bold text-center text-purple-600 mb-8">Contact Us</h1>
        
        <p className="text-center text-gray-600 mb-10">
          Have questions, suggestions, or need support? Reach out to us using the form below.
        </p>

        <form className="max-w-2xl mx-auto bg-purple-50 p-8 rounded-2xl shadow-md space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <input
              type="text"
              placeholder="Your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Message</label>
            <textarea
              placeholder="Write your message here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            ></textarea>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
     <Footer />
    </div>
  );
};

export default ContactUs;
