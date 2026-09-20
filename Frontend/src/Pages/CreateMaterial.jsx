import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import ManagerNavBar from "../components/ManagerNavBar";
import SupplierSidebar from "../components/SupplierSidebar";

export default function CreateMaterial() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state syncing with updated Material model
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    materialName: "",
    category: "",
    unitType: "",
    pricePerUnit: "",

    // Step 2: Benefits & Eco Attributes
    originalPrice: "",
    isEcoFriendly: false,
    toxicityLevel: "Bio-Safe (Green)",
    isExpertRecommended: false,
    diseaseUsage: ["Plant Growth"],

    // Step 3: Supplier & Instructions
    usageInstructions: "",
    supplierName: "",
    supplierContact: "",

    // Step 4: Media & Final Details
    image: "",
    stockAvailable: 50,
    expertNotes: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!formData.materialName || !formData.category || !formData.unitType || !formData.pricePerUnit) {
        enqueueSnackbar("Please fill all required basic fields", { variant: "warning" });
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        pricePerUnit: Number(formData.pricePerUnit),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        stockAvailable: Number(formData.stockAvailable),
      };

      // Try primary route then fallback
      try {
        await axios.post("http://localhost:5557/api/material", payload);
      } catch {
        await axios.post("http://localhost:5557/materials", payload);
      }

      enqueueSnackbar("Material added successfully!", { variant: "success" });
      navigate("/agri-store");
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.response?.data?.message || "Failed to create material", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
          backgroundColor: "rgba(243, 244, 246, 1.2)",
          backgroundBlendMode: "overlay",
        }}
      />

      <ManagerNavBar />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <SupplierSidebar />

        <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
          {/* Main Wizard Container */}
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8 border border-gray-100 mt-16">
            {/* Step Progress Circles & Bar */}
            <div className="relative mb-8">
              {/* Background Grey Line */}
              <div className="absolute top-4 left-6 right-6 h-1.5 bg-gray-200 -z-0 rounded" />
              {/* Active Green Line */}
              <div
                className="absolute top-4 left-6 h-1.5 bg-emerald-600 -z-0 rounded transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 3) * 88}%` }}
              />

              <div className="flex justify-between items-center relative z-10">
                {[1, 2, 3, 4].map((step) => {
                  const isActive = currentStep === step;
                  const isDone = currentStep > step;

                  return (
                    <div
                      key={step}
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100"
                          : isDone
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {step}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Steps */}
            <form onSubmit={currentStep === 4 ? handleSubmit : handleNext}>
              {/* STEP 1: Basic Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Material Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="materialName"
                        value={formData.materialName}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Neem Bio-Shield"
                        className="w-full border border-gray-300 focus:border-emerald-500 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 focus:border-emerald-500 rounded-lg p-2.5 text-sm bg-white focus:outline-none"
                      >
                        <option value="">Select Category</option>
                        <option value="Eco-Friendly Treatment">Eco-Friendly Treatment</option>
                        <option value="Bio-Pesticide">Bio-Pesticide</option>
                        <option value="Organic Fertilizer">Organic Fertilizer</option>
                        <option value="Fertilizer">Fertilizer</option>
                        <option value="Pesticide">Pesticide</option>
                        <option value="Herbicide">Herbicide</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Unit Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="unitType"
                        value={formData.unitType}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 focus:border-emerald-500 rounded-lg p-2.5 text-sm bg-white focus:outline-none"
                      >
                        <option value="">Select Unit</option>
                        <option value="kg">kg</option>
                        <option value="liters">liters</option>
                        <option value="packs">packs</option>
                        <option value="bottles">bottles</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Price Per Unit (Rs.) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="pricePerUnit"
                        value={formData.pricePerUnit}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 450"
                        className="w-full border border-gray-300 focus:border-emerald-500 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Benefits & Eco Features */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Eco & Pricing Benefits</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Original MRP (Rs.) <span className="text-gray-400 font-normal">(for savings)</span>
                      </label>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleChange}
                        placeholder="e.g., 600"
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Toxicity & Safety Rating
                      </label>
                      <select
                        name="toxicityLevel"
                        value={formData.toxicityLevel}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Bio-Safe (Green)">Bio-Safe (Green)</option>
                        <option value="Moderate (Blue)">Moderate (Blue)</option>
                        <option value="Caution (Yellow)">Caution (Yellow)</option>
                        <option value="Hazardous (Red)">Hazardous (Red)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <input
                        type="checkbox"
                        id="isEcoFriendly"
                        name="isEcoFriendly"
                        checked={formData.isEcoFriendly}
                        onChange={handleChange}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <label htmlFor="isEcoFriendly" className="text-sm font-medium text-gray-700">
                        🌿 Mark as Eco-Friendly Treatment
                      </label>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <input
                        type="checkbox"
                        id="isExpertRecommended"
                        name="isExpertRecommended"
                        checked={formData.isExpertRecommended}
                        onChange={handleChange}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <label htmlFor="isExpertRecommended" className="text-sm font-medium text-gray-700">
                        ⭐ Expert-Recommended Product
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Supplier & Instructions */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Supplier & Instructions</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Supplier Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="supplierName"
                          value={formData.supplierName}
                          onChange={handleChange}
                          required
                          placeholder="e.g., GreenAgro Supplies"
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Supplier Contact <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="supplierContact"
                          value={formData.supplierContact}
                          onChange={handleChange}
                          required
                          placeholder="e.g., +91 9876543210"
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Usage Instructions <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="usageInstructions"
                        rows="3"
                        value={formData.usageInstructions}
                        onChange={handleChange}
                        required
                        placeholder="Mix 2ml per 1L water and spray in the early morning..."
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Media & Inventory */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Media & Final Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Product Image URL</label>
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="https://example.com/product.jpg"
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Stock Units Available</label>
                        <input
                          type="number"
                          name="stockAvailable"
                          value={formData.stockAvailable}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Expert Verification Notes</label>
                        <input
                          type="text"
                          name="expertNotes"
                          value={formData.expertNotes}
                          onChange={handleChange}
                          placeholder="Tested & approved for UP soils"
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Footer */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
                  >
                    &larr; Back
                  </button>
                ) : <div />}

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {loading ? "Saving..." : currentStep === 4 ? "Submit Material" : "Next \u2192"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}