import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCaretDown, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const location = useLocation();

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      setIsVisible(currentScrollY <= 50 || currentScrollY < lastScrollY);
      setIsScrolled(currentScrollY > 50);
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check login state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (token || storedUser) {
      setIsLoggedIn(true);
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const displayName = 
            parsed.username || 
            parsed.name || 
            parsed.fullName || 
            parsed.user?.username || 
            parsed.user?.name || 
            'Farmer';
          setUserName(displayName);
        } catch {
          setUserName('Farmer');
        }
      }
    } else {
      setIsLoggedIn(false);
      setUserName('');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserName('');
    window.location.href = '/login';
  };

  const isHomePage = location.pathname === '/';

  const navbarVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      }
    }
  };

  if (!isHomePage) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          key="navbar"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={navbarVariants}
          className={`fixed w-full z-30 transition-opacity duration-100 ${
            isScrolled 
              ? 'bg-black bg-opacity-40 backdrop-filter backdrop-blur-lg shadow-md' 
              : 'bg-transparent'
          } text-white`}
        >
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold tracking-tight hover:text-green-400 transition-colors">
              AgriGuard
            </Link>

            <div className="flex items-center space-x-6">
              {/* Services Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 hover:text-green-400 font-semibold transition-colors duration-200"
                >
                  <span>Services</span>
                  <FaCaretDown className="text-xs" />
                </button>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-10 border border-gray-100"
                  >
                    <Link to="/agri-store" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium">AgriStore</Link>
                    <Link to="/health-hub" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium">Health Hub</Link>
                    <Link to="/disease-map" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium">Disease Map</Link>
                  </motion.div>
                )}
              </div>

              {/* Conditional Auth Section */}
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                    <FaUserCircle className="text-green-400 text-base" />
                    <span className="text-xs font-bold tracking-wide text-white capitalize">
                      {userName}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 bg-red-600/80 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition duration-200 shadow-sm"
                    title="Sign Out"
                  >
                    <FaSignOutAlt className="text-xs" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-6">
                  <Link to="/login" className="hover:text-green-400 font-semibold text-sm transition-colors">
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition duration-200 shadow-md shadow-green-600/30"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default Navbar;