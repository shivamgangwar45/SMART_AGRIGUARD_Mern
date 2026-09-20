import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaLeaf, 
  FaSearch, 
  FaMobileAlt, 
  FaCheckCircle, 
  FaChevronDown, 
  FaClock,
  FaFacebookF,
  FaTwitter,
  FaInstagram 
} from 'react-icons/fa';
import { RiPlantLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WhatWeOffer from '../components/WhatWeOffer';
import { FaRobot, FaChartLine, FaGraduationCap, FaPiggyBank } from "react-icons/fa6";

const Home = () => {
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const whatWeOfferRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    whatWeOfferRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  // Article in Homepage
  const recentArticles = [
    {
      title: "5 Early Signs of Plant Disease Every Farmer Should Know",
      excerpt: "Learn to spot the subtle indicators of plant health issues before they become major problems.",
      date: "2026-09-18",
      image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "AI in Agriculture: Revolutionizing Crop Protection",
      excerpt: "Discover how artificial intelligence is changing the game for farmers worldwide.",
      date: "2026-09-15",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Organic vs. Chemical Treatments: Making the Right Choice",
      excerpt: "We break down the pros and cons of different treatment approaches for your crops.",
      date: "2026-09-12",
      image: "https://images.pexels.com/photos/2255801/pexels-photo-2255801.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];

  // Success Story
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Organic Farmer",
      quote: "SmartAgriGuard's AI detection saved my tomato crop from a blight outbreak. The early warning and targeted treatment plan were game-changers!",
      image: "/images/testimonial-sarah.jpg"
    },
    {
      name: "Michael Chen",
      role: "Agricultural Researcher",
      quote: "The disease mapping feature has been invaluable for our regional studies. It's providing insights that would have taken years to gather manually.",
      image: "/images/testimonial-michael.jpg"
    },
    {
      name: "Elena Rodriguez",
      role: "Small-scale Farmer",
      quote: "As a new farmer, the Health Hub has been my go-to resource. The expert advice and AI recommendations have given me confidence in managing my crops.",
      image: "/images/testimonial-elena.jpg"
    }
  ];

  // Why choose us section
  const benefits = [
    {
      title: "Cutting-Edge AI Technology",
      description: "Our advanced algorithms provide accurate disease detection and personalized treatment plans.",
      icon: "FaRobot"
    },
    {
      title: "Eco-Friendly Solutions",
      description: "We prioritize sustainable and organic treatments to protect both your crops and the environment.",
      icon: "FaLeaf"
    },
    {
      title: "Real-Time Monitoring",
      description: "Stay ahead of potential outbreaks with our continuous monitoring and early warning system.",
      icon: "FaChartLine"
    },
    {
      title: "Expert Knowledge Base",
      description: "Access a wealth of information from agricultural experts and our AI-powered recommendations.",
      icon: "FaGraduationCap"
    },
    {
      title: "Cost-Effective",
      description: "Reduce crop losses and optimize treatment applications, saving you time and money.",
      icon: "FaPiggyBank"
    }
  ];

  // FAQ Section
  const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="border-b border-green-200 last:border-b-0">
        <button
          className="flex justify-between items-center w-full py-5 px-3 text-left"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-lg font-semibold">{question}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaChevronDown className="text-green-600" />
          </motion.div>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <p className="p-3 text-gray-600">{answer}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Contacts Section
  const contactInfo = {
    email: "shivamgangwarbda51@gmail.com",
    phone: "+91 8433210134",
    address: "Bhojipura, Bareilly, UP 243202",
    socialMedia: {
      facebook: "https://facebook.com/smartagriguard",
      twitter: "https://twitter.com/smartagriguard",
      instagram: "https://instagram.com/smartagriguard"
    }
  };

  return (
    <div className="min-h-screen bg-white text-green-800">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
            filter: 'blur(4px)',
          }}
        ></div>
        
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
        
        <div className="container mx-auto px-4 text-center relative z-20">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight"
          >
            Protect Plants with AgriGuard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-white"
          >
            AgriGuard: Advanced plant disease detection for smarter farming
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center space-x-4"
          >
            <button
              className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-green-700 transition duration-300"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
            <button
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-green-800 transition duration-300"
              onClick={() => navigate('/about')}
            >
              Learn More
            </button>
          </motion.div>
          
          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 flex justify-center space-x-8"
          >
            {[
              { icon: FaCheckCircle, text: "99% Accuracy" },
              { icon: FaLeaf, text: "50+ Disease Types" },
              { icon: FaClock, text: "24/7 Monitoring" },
            ].map((feature, index) => (
              <div key={index} className="flex items-center text-white">
                <feature.icon className="text-green-400 mr-2 text-2xl" />
                <span className="text-lg">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full overflow-hidden z-10">
          <svg className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="rgba(255,255,255,0.1)" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      <WhatWeOffer ref={whatWeOfferRef} />

      {/* Recent Articles Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Recent Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentArticles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-48 object-cover bg-gray-100"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg?auto=compress&cs=tinysrgb&w=600";
                  }}
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <p className="text-sm text-gray-500 font-medium">{article.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-14 bg-gradient-to-br from-white to-green-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-10 text-green-800">Why Choose Us</h2>
          <div className="space-y-12 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-0' : 'pl-0'}`}>
                  <div className="flex items-center mb-3">
                    <div className="text-4xl text-green-600 mr-4">
                      {benefit.icon === 'FaRobot' && <FaRobot />}
                      {benefit.icon === 'FaLeaf' && <FaLeaf />}
                      {benefit.icon === 'FaChartLine' && <FaChartLine />}
                      {benefit.icon === 'FaGraduationCap' && <FaGraduationCap />}
                      {benefit.icon === 'FaPiggyBank' && <FaPiggyBank />}
                    </div>
                    <h3 className="text-2xl font-semibold text-green-800">{benefit.title}</h3>
                  </div>
                  <p className="text-base text-gray-600 mb-3">{benefit.description}</p>
                  <div className="h-2 w-full bg-green-200 rounded-full relative">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-green-600 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: '90%' }}
                      transition={{ duration: 1.6, delay: 0.3 }}
                    />
                  </div>
                </div>
                <div className="w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
            {[
              { step: 1, text: 'Take a photo of your plant' },
              { step: 2, text: 'Upload it to AgriGuard' },
              { step: 3, text: 'Get instant disease analysis' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: scrollY > 800 ? 1 : 0, x: scrollY > 800 ? 0 : -50 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <p className="text-center max-w-xs">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {[
              {
                question: "How does SmartAgriGuard's AI technology work?",
                answer: "Our AI uses advanced computer vision and machine learning algorithms to analyze images of plants. It compares these images against a vast database of known plant diseases, identifying patterns and symptoms to provide accurate diagnoses."
              },
              {
                question: "Can SmartAgriGuard detect diseases in all types of crops?",
                answer: "Currently, SmartAgriGuard supports over 60 different crop types, including most common fruits, vegetables, and grains. We're continuously expanding our database to include more varieties."
              },
              {
                question: "How accurate is the disease detection?",
                answer: "Our AI model has been trained on millions of images and has an accuracy rate of over 95% for common plant diseases. It's continuously improving with new data and feedback from agricultural experts."
              },
              {
                question: "What kind of treatment recommendations does SmartAgriGuard provide?",
                answer: "We offer both organic and conventional treatment options, tailored to the specific disease and severity. Our recommendations are based on the latest agricultural research and best practices."
              },
              {
                question: "How does the disease mapping feature benefit farmers?",
                answer: "Disease mapping aggregates data from user reports and AI detections to create real-time visualizations of disease spread in your area. This helps farmers prepare for potential outbreaks and make informed decisions about crop protection strategies."
              },
              {
                question: "Is my farm's data kept private and secure?",
                answer: "Absolutely. We take data privacy very seriously. All farm-specific data is encrypted and anonymized. We only use aggregated, non-identifiable data for improving our AI models and disease mapping features."
              },
              {
                question: "Can SmartAgriGuard integrate with other farm management software?",
                answer: "Yes, we offer API integrations with several popular farm management platforms. This allows for seamless incorporation of our disease detection and treatment recommendations into your existing workflows."
              }
            ].map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 bg-green-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: scrollY > 1200 ? 1 : 0, y: scrollY > 1200 ? 0 : 50 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold mb-6"
          >
            Ready to protect your plants?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: scrollY > 1200 ? 1 : 0, y: scrollY > 1200 ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl mb-8"
          >
            Join AgriGuard today and keep your crops healthy!
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-green-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-100 transition duration-300"
            onClick={() => navigate('/register')}
          >
            Sign Up Now
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-10 border-t border-green-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand / Social */}
            <div>
              <h4 className="text-2xl font-bold mb-4">AgriGuard</h4>
              <p className="text-green-100 text-sm mb-6 leading-relaxed">
                Empowering farmers with AI-driven plant disease detection and sustainable agricultural solutions.
              </p>
              <div className="flex space-x-4">
                <a 
                  href={contactInfo.socialMedia.facebook} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-9 h-9 rounded-full bg-green-700 flex items-center justify-center hover:bg-green-600 transition-colors text-white"
                >
                  <FaFacebookF size={15} />
                </a>
                <a 
                  href={contactInfo.socialMedia.twitter} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-9 h-9 rounded-full bg-green-700 flex items-center justify-center hover:bg-green-600 transition-colors text-white"
                >
                  <FaTwitter size={15} />
                </a>
                <a 
                  href={contactInfo.socialMedia.instagram} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-9 h-9 rounded-full bg-green-700 flex items-center justify-center hover:bg-green-600 transition-colors text-white"
                >
                  <FaInstagram size={15} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-green-100">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
              <p className="mb-2 text-sm text-green-100">{contactInfo.address}</p>
              <p className="mb-2 text-sm text-green-100">Phone: {contactInfo.phone}</p>
              <p className="text-sm text-green-100 break-words">Email: {contactInfo.email}</p>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-xl font-semibold mb-4">Newsletter</h4>
              <p className="mb-4 text-sm text-green-100">Stay updated with our latest news and offers.</p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-4 py-2.5 rounded-l-lg focus:outline-none text-gray-900 text-sm bg-white"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2.5 rounded-r-lg hover:bg-green-700 transition duration-300 text-sm font-semibold whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-green-700/60 pt-6 text-center">
            <p className="text-green-300 text-sm">&copy; 2026 AgriGuard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;