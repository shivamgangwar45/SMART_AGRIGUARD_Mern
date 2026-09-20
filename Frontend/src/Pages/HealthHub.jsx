import React, { useState } from "react";
import { Link } from "react-router-dom";
import LogNavBar from "../components/LogingNavBar";
import { FaBookOpen, FaShieldAlt, FaFlask, FaSeedling, FaSearch, FaArrowRight } from "react-icons/fa";

const HealthHub = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const articles = [
    {
      id: 1,
      title: "Eco-Friendly Disease Prevention & Soil Sanitation",
      category: "prevention",
      tag: "Disease Prevention",
      readTime: "5 min read",
      author: "Dr. Arvind Sharma (Agronomist)",
      date: "Sep 2026",
      summary:
        "Learn natural crop rotation cycles, bio-fungicides application, and soil preparation techniques to stop late blight before it begins.",
      image: "https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 2,
      title: "Understanding Pesticide Toxicity: Green vs Red Label Sprays",
      category: "pesticides",
      tag: "Pesticide Safety",
      readTime: "7 min read",
      author: "AgriGuard Research Team",
      date: "Aug 2026",
      summary:
        "A breakdown of pesticide hazard labels, active residue risks on fruits, and how replacing chemicals with bio-safe options saves pollinators.",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      title: "Integrated Pest Management (IPM) for Vegetable Crops",
      category: "practices",
      tag: "Agricultural Practices",
      readTime: "6 min read",
      author: "Kisan Vigyan Kendra",
      date: "Sep 2026",
      summary:
        "Pest management combining neem extracts, pheromone traps, and precision foliar feeding to cut chemical costs by 40%.",
      image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      title: "Early Warning Symptoms: Rice Blast & Wheat Rust",
      category: "prevention",
      tag: "Expert Knowledge",
      readTime: "4 min read",
      author: "Dr. R. K. Patel",
      date: "Jul 2026",
      summary:
        "Identify spindle-shaped lesions, stem discolorations, and leaf chlorosis in early vegetative stages before irreversible crop losses.",
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const filteredArticles = articles.filter((art) => {
    const matchesTab = activeTab === "all" || art.category === activeTab;
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LogNavBar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Top Hero Section */}
        <div className="bg-emerald-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="bg-emerald-600/80 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              AgriGuard Knowledge Base
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold mt-4 mb-4 leading-tight">
              Plant Health Hub
            </h1>
            <p className="text-emerald-100 text-base sm:text-lg leading-relaxed">
              Access field-tested agricultural wisdom, learn disease prevention, understand pesticide effects, and implement sustainable farming practices.
            </p>

            {/* Search Input */}
            <div className="mt-8 relative max-w-xl">
              <input
                type="text"
                placeholder="Search articles on diseases, pesticides, prevention..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-full text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            </div>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
            <FaSeedling size={380} />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap gap-3 mb-8 items-center border-b pb-4 border-gray-200">
          {[
            { id: "all", label: "All Insights", icon: FaBookOpen },
            { id: "prevention", label: "Disease Prevention", icon: FaShieldAlt },
            { id: "pesticides", label: "Pesticide Effects", icon: FaFlask },
            { id: "practices", label: "Agricultural Practices", icon: FaSeedling },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mb-2">
                    <span className="bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {art.tag}
                    </span>
                    <span className="text-gray-400 font-normal">{art.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mt-2 line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-3 line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-900">{art.author}</p>
                  <p className="text-[11px] text-gray-400">{art.date}</p>
                </div>
                <Link
                  to="/admin/articles"
                  className="text-emerald-700 hover:text-emerald-900 font-bold text-xs flex items-center gap-1"
                >
                  Read Article <FaArrowRight size={10} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HealthHub;