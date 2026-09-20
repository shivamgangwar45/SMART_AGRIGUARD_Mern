import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import BackgroundSvg from "../images/117.svg";
import "../../src/index.css";
import WelcomeOverlay from "../components/WelcomeOverlay";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Endpoints fallback array matching the confirmed user backend route
    const endpoints = [
      'http://localhost:5557/api/user/login',
      'http://localhost:5557/api/auth/login',
      'http://localhost:5557/user/login',
      'http://localhost:5557/auth/login'
    ];

    try {
      let response = null;
      let lastErr = null;

      for (const url of endpoints) {
        try {
          response = await axios.post(url, {
            email: formData.email.trim().toLowerCase(),
            password: formData.password
          });
          if (response && (response.status === 200 || response.status === 201)) {
            break;
          }
        } catch (err) {
          lastErr = err;
          if (err.response && err.response.status === 404) {
            continue;
          }
          throw err;
        }
      }

      if (!response) {
        throw lastErr || new Error("Login service unreachable.");
      }

      const token = response.data?.token || response.data?.accessToken;
      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(response.data.user || response.data));
        
        setUserData({
          name: response.data.user?.username || response.data.username || response.data.name || 'Farmer',
          role: response.data.user?.role || response.data.role || 'farmer'
        });

        setShowWelcome(true);
        
        const userRole = (response.data.user?.role || response.data.role || '').toLowerCase();

        setTimeout(() => {
          setShowWelcome(false);
          switch(userRole) {
            case 'admin':
              navigate('/admin');
              break;
            case 'manager':
              navigate('/manager-dashboard');
              break;
            case 'supplier':
              navigate('/materials');
              break;  
            default:
              // Directs users to the standard landing homepage
              window.location.href = '/';
          }
        }, 1500);
      } else {
        setError('Login failed: Token not received.');
      }
    } catch (err) {
      console.error('Login error details:', err.response?.data || err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center">
      <WelcomeOverlay show={showWelcome} userData={userData} />
      
      {/* Background Layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${BackgroundSvg})`,
          backgroundSize: "cover",
          filter: "blur(5px)",
          zIndex: -1,
        }}
      ></div>

      {/* Login Form */}
      <div className="w-full max-w-sm m-auto px-4">
        <form
          className="rounded-3xl px-8 pt-8 pb-10 bg-white shadow-2xl border border-gray-100"
          onSubmit={handleSubmit}
        >
          <h1 className="text-3xl font-extrabold mb-6 text-center text-green-700">
            Sign In
          </h1>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow-sm border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition"
              id="email"
              name="email"
              type="email"
              placeholder="e.g. shivamgangwarbda51@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6 relative">
            <label
              className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="shadow-sm border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition"
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400 hover:text-green-600"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <MdVisibilityOff size={22} /> : <MdVisibility size={22} />}
              </span>
            </div>

            {error && <p className="text-red-500 text-xs italic mt-2 font-medium">{error}</p>}
            {successMessage && (
              <p className="text-green-600 text-xs italic mt-2 font-medium">{successMessage}</p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition duration-200 shadow-md shadow-green-600/30 disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <div className="text-center mt-5 flex justify-between items-center text-xs">
            <a
              className="text-gray-500 hover:text-green-700 transition"
              href="#"
            >
              Forgot Password?
            </a>
            <a
              href="/register"
              className="text-green-700 font-bold hover:underline"
            >
              Create an Account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;