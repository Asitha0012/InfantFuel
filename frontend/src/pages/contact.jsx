
import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import { EMAILJS_CONFIG } from '../config/emailjs';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import AIChatWidget from '../Components/AIChatWidget';

const ContactUs = () => {
  const form = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if EmailJS is configured
      if (EMAILJS_CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID') {
        toast.error('EmailJS is not configured yet. Please check the setup instructions.');
        return;
      }

      // Template parameters for EmailJS
      const templateParams = {
        from_name: formData.from_name,
        reply_to: formData.from_email,  // User's email (for FROM and REPLY-TO)
        message: formData.message,
        subject: `Contact Form Message from ${formData.from_name}`,
        to_email: EMAILJS_CONFIG.TO_EMAIL  // Your email (recipient)
      };

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        from_name: '',
        from_email: '',
        message: ''
      });
    } catch (error) {
      console.error('EmailJS Error:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />
    
      <div className="px-6 py-12 md:px-16 lg:px-32">
        <h1 className="text-4xl font-bold text-center text-purple-600 mb-8">Contact Us</h1>
        
        <p className="text-center text-gray-600 mb-10">
          Have questions, suggestions, or need support? Reach out to us using the form below.
        </p>

        <form 
          ref={form}
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-purple-50 p-8 rounded-2xl shadow-md space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <input
              type="text"
              name="from_name"
              value={formData.from_name}
              onChange={handleInputChange}
              placeholder="Your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email Address</label>
            <input
              type="email"
              name="from_email"
              value={formData.from_email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Write your message here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            ></textarea>
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 rounded-xl transition ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700'
              } text-white`}
            >
              {isLoading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
      <AIChatWidget />
     <Footer />
    </div>
  );
};

export default ContactUs;
