import React, { useState } from "react";
import axios from "axios";
import "../../src/index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackgroundSvg from "../images/114.svg";
import { countries } from "../components/CountriesForPhone";
import { motion } from "framer-motion";
import { parsePhoneNumber } from "libphonenumber-js";
import leftLeaf from "../images/p4.png";
import rightLeaf from "../images/p4.png";

// Dynamic API Base URL targeting Render backend
const API_BASE = import.meta.env.VITE_API_URL || "https://smart-agriguard-mern.onrender.com";

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    country: "India",
    password: "",
    confirmPassword: "",
    role: "farmer",
    phoneNumber: "",
    location: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const sortedCountries = [
    { code: "IN", dialCode: "91", name: "India" },
    ...countries.filter((c) => c.code !== "IN")
  ];

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === "phoneNumber") {
      if (!/^[+\d]*$/.test(value)) return;
    } else if ((id === "firstName" || id === "lastName") && /\d/.test(value)) {
      return;
    }
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (id === "password") {
      const passwordErrors = validatePassword(value);
      setValidationErrors((prev) => ({ ...prev, password: passwordErrors }));
    } else if (id === "confirmPassword") {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: value !== formData.password ? ["Passwords do not match"] : []
      }));
    }
  };

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
    setFormData((prev) => ({ ...prev, phoneNumber: "" }));
  };

  const validateForm = () => {
    const errors = {};
    setValidationErrors({});

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.username.trim()) errors.username = "Username is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      errors.email = "Valid email is required";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else {
      try {
        const phoneNumber = parsePhoneNumber(formData.phoneNumber, selectedCountry);
        if (!phoneNumber.isValid()) {
          errors.phoneNumber = "Invalid phone number for selected country";
        }
      } catch {
        const cleanNumber = formData.phoneNumber.replace(/\D/g, "");
        if (cleanNumber.length !== 10) {
          errors.phoneNumber = "Please enter a valid 10-digit mobile number";
        }
      }
    }

    if (!formData.role) errors.role = "Role is required";
    if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.country) errors.country = "Country is required";
    if (!formData.location.trim()) errors.location = "Specific location/address is required";

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) errors.password = passwordErrors;

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = ["Passwords do not match"];
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter");
    if (!/[0-9]/.test(password)) errors.push("At least one number");
    if (!/[@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("At least one special character");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const rawDigits = formData.phoneNumber.replace(/\D/g, "");
    const tenDigits = rawDigits.length > 10 ? rawDigits.slice(-10) : rawDigits;
    const internationalPhone = `+91${tenDigits}`;

    const userData = {
      username: formData.username.trim(),
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role.toLowerCase(),
      phone: tenDigits,
      phoneNumber: tenDigits,
      contactNumber: internationalPhone,
      location: formData.location.trim() || formData.country,
      address: formData.location.trim(),
      country: formData.country,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth
    };

    try {
      const response = await axios.post(
        `${API_BASE}/api/user/register`,
        userData,
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );

      const token = response.data?.token || response.data?.accessToken;
      if (token) localStorage.setItem("authToken", token);
      if (response.data?.user) localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success("Registration successful! You are now logged in.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        theme: "colored"
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    } catch (err) {
      console.error("Backend Error Response:", err.response?.data || err);
      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please verify user details.";
      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen">
      <div
        style={{
          backgroundImage: `url(${BackgroundSvg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(5px)"
        }}
        className="absolute top-0 left-0 w-full h-full -z-10"
      ></div>
      <div
        className="absolute top-0 left-0 w-full h-full bg-opacity-50"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.6)"
        }}
      />
      <div className="relative w-full min-h-screen m-auto overflow-hidden scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-200">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute left-0 top-2/3 transform -translate-y-1/4 rotate-0 pointer-events-none"
        >
          <motion.img 
            src={leftLeaf} 
            alt="Left Leaf" 
            className="w-80 h-auto filter drop-shadow-2xl"
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute right-0 top-2/3 transform -translate-y-1/4 -rotate-0 scale-x-[-1] pointer-events-none"
        >
          <motion.img 
            src={rightLeaf} 
            alt="Right Leaf" 
            className="w-80 h-auto filter drop-shadow-2xl"
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <h1 className="text-3xl mt-12 font-bold mb-6 justify-center flex">
          <span className="text-green-600 font-weight-bold text-3xl">Sign Up for</span>
          <span className="text-black ml-4 text-3xl">AgriGuard</span>
        </h1>

        <form
          className="ml-auto mr-auto rounded-3xl px-10 pt-8 pb-10 mb-6 -mt-2 bg-white shadow-xl w-11/12 md:w-3/4 lg:w-1/2 relative z-10"
          onSubmit={handleSubmit}
        >
          <div className="flex justify-between gap-4">
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mt-2 mb-2" htmlFor="firstName">
                First Name
              </label>
              <input
                className={`shadow-lg my-1 focus:outline-none focus:border-green-600 appearance-none border rounded w-full py-3 px-4 text-gray-700 ${
                  validationErrors.firstName ? "border-red-500" : ""
                }`}
                id="firstName"
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              {validationErrors.firstName && (
                <p className="text-red-500 text-xs italic mt-1">{validationErrors.firstName}</p>
              )}
            </div>
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mt-2 mb-2" htmlFor="lastName">
                Last Name
              </label>
              <input
                className={`shadow-lg my-1 focus:outline-none focus:border-green-600 appearance-none border rounded w-full py-3 px-4 text-gray-700 ${
                  validationErrors.lastName ? "border-red-500" : ""
                }`}
                id="lastName"
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              {validationErrors.lastName && (
                <p className="text-red-500 text-xs italic mt-1">{validationErrors.lastName}</p>
              )}
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mt-2 mb-2" htmlFor="username">
                Username
              </label>
              <input
                className={`shadow-lg my-1 focus:outline-none focus:border-green-600 appearance-none border rounded w-full py-3 px-4 text-gray-700 ${
                  validationErrors.username ? "border-red-500" : ""
                }`}
                id="username"
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {validationErrors.username && (
                <p className="text-red-500 text-xs italic mt-1">{validationErrors.username}</p>
              )}
            </div>
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mt-2 mb-2" htmlFor="email">
                Email
              </label>
              <input
                className={`shadow-lg my-1 focus:outline-none focus:border-green-600 appearance-none border rounded w-full py-3 px-4 text-gray-700 ${
                  validationErrors.email ? "border-red-500" : ""
                }`}
                id="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs italic mt-1">{validationErrors.email}</p>
              )}
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mt-2 mb-2" htmlFor="phoneNumber">
                Phone Number
              </label>
              <div className="flex">
                <select
                  className="shadow-lg my-1 focus:outline-none focus:border-green-600 border rounded-l w-2/5 py-3 px-3 text-gray-700 bg-white"
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  required
                >
                  {sortedCountries.map((country, idx) => (
                    <option key={`${country.code}-${idx}`} value={country.code}>
                      {country.code} (+{country.dialCode})
                    </option>
                  ))}
                </select>
                <input
                  className={`shadow-lg my-1 focus:outline-none focus:border-green-600 appearance-none border rounded-r w-3/5 py-3 px-4 text-gray-700 ${
                    validationErrors.phoneNumber ? "border-red-500" : ""
                  }`}
                  id="phoneNumber"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              {validationErrors.phoneNumber && (
                <p className="text-red-500 text-xs italic mt-1">{validationErrors.phoneNumber}</p>
              )}
            </div>

            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mt-2 mb-2" htmlFor="role">
                Role
              </label>
              <select
                className="shadow-lg my-1 focus:outline-none focus:border-green-600 appearance-none border rounded w-full py-3 px-4 text-gray-700 bg-white"
                id="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="farmer">Farmer</option>
                <option value="OrganicFarmer">Organic Farmer</option>
                <option value="cropFarmer">Crop Farmer</option>
                <option value="greenhouseFarmer">Greenhouse Farmer</option>
                <option value="forester">Forester</option>
                <option value="gardener">Gardener</option>
                <option value="soilTester">Soil Tester</option>
                <option value="agriculturalResearcher">Agricultural Researcher</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mt-2 mb-2" htmlFor="dateOfBirth">
                Date of Birth
              </label>
              <input
                className="shadow-lg my-1 focus:outline-none focus:border-green-600 appearance-none border rounded w-full py-3 px-4 text-gray-700"
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mt-2 mb-2" htmlFor="gender">
                Gender
              </label>
              <select
                className="shadow-lg my-1 focus:outline-none focus:border-green-600 appearance-none border rounded w-full py-3 px-4 text-gray-700 bg-white"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mt-2 mb-2" htmlFor="country">
                Country
              </label>
              <select
                className="shadow-lg my-1 focus:outline-none focus:border-green-600 appearance-none border rounded w-full py-3 px-4 text-gray-700 bg-white"
                id="country"
                value={formData.country}
                onChange={handleChange}
                required
              >
                {["India", "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Bangladesh", "Brazil", "Canada", "China", "Egypt", "France", "Germany", "Indonesia", "Italy", "Japan", "Malaysia", "Mexico", "Pakistan", "Russia", "Saudi Arabia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Thailand", "Turkey", "United Arab Emirates", "United Kingdom", "United States"].map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full">
            <label className="block text-gray-700 text-sm font-bold mt-2 mb-2" htmlFor="location">
              Specific Location/Address
            </label>
            <input
              className={`shadow-lg my-1 focus:outline-none focus:border-green-600 appearance-none border rounded w-full py-3 px-4 text-gray-700 ${
                validationErrors.location ? "border-red-500" : ""
              }`}
              id="location"
              type="text"
              placeholder="e.g. Bhojipura, Bareilly, UP 243202"
              value={formData.location}
              onChange={handleChange}
              required
            />
            {validationErrors.location && (
              <p className="text-red-500 text-xs italic mt-1">{validationErrors.location}</p>
            )}
          </div>

          <div className="flex justify-between gap-4">
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mt-3 mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className={`shadow-lg my-1 focus:outline-none focus:border-green-600 appearance-none border rounded w-full py-3 px-4 text-gray-700 ${
                    validationErrors.password && validationErrors.password.length > 0 ? "border-red-500" : ""
                  }`}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="*********"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.password && validationErrors.password.length > 0 && (
                <ul className="text-red-500 text-xs italic mt-1">
                  {validationErrors.password.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mt-3 mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  className={`shadow-lg my-1 focus:outline-none focus:border-green-600 appearance-none border rounded w-full py-3 px-4 text-gray-700 ${
                    validationErrors.confirmPassword && validationErrors.confirmPassword.length > 0 ? "border-red-500" : ""
                  }`}
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="*********"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && validationErrors.confirmPassword.length > 0 && (
                <p className="text-red-500 text-xs italic mt-1">{validationErrors.confirmPassword[0]}</p>
              )}
            </div>
          </div>

          {error && <p className="text-red-500 text-xs italic mt-2 font-semibold">{error}</p>}

          <div className="items-center justify-between">
            <button
              className="ml-auto mr-auto mt-7 flex items-center justify-center bg-green-600 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl mx-3 px-36 transition-colors"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
          <div className="text-center text-xs mt-2">
            Already have an account?
            <a className="ml-2 text-green-600 text-xs" href="/login">
              Sign in
            </a>
          </div>
        </form>

        <ToastContainer />
      </div>
    </div>
  );
}

export default Register;