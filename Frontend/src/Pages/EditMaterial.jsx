import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import {
  FaDollarSign,
  FaBook,
  FaSave,
  FaTimesCircle,
  FaTimes,
  FaLeaf,
  FaImage,
} from "react-icons/fa";

const EditMaterial = ({ id, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    materialName: "",
    category: "",
    diseaseUsage: [],
    usageInstructions: "",
    unitType: "",
    pricePerUnit: "",
    originalPrice: "",
    isEcoFriendly: false,
    toxicityLevel: "Bio-Safe (Green)",
    isExpertRecommended: false,
    supplierName: "",
    supplierContact: "",
    image: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const diseaseOptions = [
    "Plant Growth",
    "Insect Control",
    "Weed Killers",
    "Fungal Infection",
    "Bacterial Blight",
    "Soil Health",
  ];

  const unitTypeOptions = ["kg", "liters", "packs", "bottles"];

  const categoryOptions = [
    "Eco-Friendly Treatment",
    "Bio-Pesticide",
    "Organic Fertilizer",
    "Fertilizer",
    "Pesticide",
    "Herbicide",
  ];

  // Fetch with auto fallback for /api/material & /materials
  useEffect(() => {
    const fetchMaterial = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5557/api/material/${id}`);
        const data = res.data.data || res.data;
        setFormData((prev) => ({ ...prev, ...data }));
      } catch {
        try {
          const fallbackRes = await axios.get(`http://localhost:5557/materials/${id}`);
          const data = fallbackRes.data.data || fallbackRes.data;
          setFormData((prev) => ({ ...prev, ...data }));
        } catch (err) {
          console.error("Fetch error:", err);
          enqueueSnackbar("Error fetching material details", { variant: "error" });
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMaterial();
  }, [id, enqueueSnackbar]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDiseaseChange = (e) => {
    const { value, checked } = e.target;
    const currentUsage = Array.isArray(formData.diseaseUsage) ? formData.diseaseUsage : [];
    const updatedDiseaseUsage = checked
      ? [...currentUsage, value]
      : currentUsage.filter((disease) => disease !== value);

    setFormData((prev) => ({
      ...prev,
      diseaseUsage: updatedDiseaseUsage,
    }));
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      pricePerUnit: value,
    }));

    if (Number(value) < 0) {
      setErrors((prev) => ({ ...prev, pricePerUnit: "Price must be positive" }));
    } else {
      setErrors((prev) => ({ ...prev, pricePerUnit: "" }));
    }
  };

  const handleSupplierContactChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, supplierContact: value }));

    // Flexible for 10-digit Indian phone numbers
    const cleanPhone = value.replace(/\D/g, "");
    if (value && (cleanPhone.length < 10 || cleanPhone.length > 12)) {
      setErrors((prev) => ({
        ...prev,
        supplierContact: "Please enter a valid 10-digit contact number",
      }));
    } else {
      setErrors((prev) => ({ ...prev, supplierContact: "" }));
    }
  };

  const isFormValid = () => {
    return (
      Boolean(formData.materialName) &&
      Boolean(formData.category) &&
      Boolean(formData.unitType) &&
      Number(formData.pricePerUnit) > 0 &&
      Boolean(formData.supplierName) &&
      Boolean(formData.supplierContact) &&
      !errors.pricePerUnit &&
      !errors.supplierContact
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      enqueueSnackbar("Please fill all required fields correctly", { variant: "error" });
      return;
    }
    setLoading(true);

    const payload = {
      ...formData,
      pricePerUnit: Number(formData.pricePerUnit),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
    };

    try {
      let updatedData;
      try {
        const response = await axios.put(`http://localhost:5557/api/material/${id}`, payload);
        updatedData = response.data.data || response.data;
      } catch {
        const fallbackRes = await axios.put(`http://localhost:5557/materials/${id}`, payload);
        updatedData = fallbackRes.data.data || fallbackRes.data;
      }

      enqueueSnackbar("Material updated successfully!", { variant: "success" });
      if (onUpdate && typeof onUpdate === "function") {
        onUpdate(updatedData);
      }
      onClose();
    } catch (error) {
      console.error("Error updating material:", error);
      enqueueSnackbar("Error updating material", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl shadow-2xl rounded-2xl bg-white overflow-hidden my-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-emerald-50">
          <h3 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
            <FaLeaf className="text-emerald-600" /> Edit Material & Eco Supplies
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-10 text-emerald-700 font-bold">Loading...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Image Preview + Image URL Input */}
              <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <img
                  src={
                    formData.image ||
                    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=300&q=80"
                  }
                  alt={formData.materialName}
                  className="w-28 h-28 object-cover rounded-lg shadow border"
                />
                <div className="flex-1 w-full">
                  <label className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <FaImage className="text-emerald-600" /> Product Image URL (Paste link to change image)
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image || ""}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108..."
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Direct image link paste karein taaki tablet photo replace ho sake.
                  </p>
                </div>
              </div>

              {/* Row 2: Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Material Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="materialName"
                    value={formData.materialName || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Price Per Unit (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      name="pricePerUnit"
                      value={formData.pricePerUnit || ""}
                      onChange={handlePriceChange}
                      required
                      className="w-full pl-8 border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Original MRP (Rs.) <span className="text-gray-400 font-normal">(for savings)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. 600"
                      className="w-full pl-8 border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Unit Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unitType"
                    value={formData.unitType || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Unit Type</option>
                    {unitTypeOptions.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Toxicity & Safety Rating
                  </label>
                  <select
                    name="toxicityLevel"
                    value={formData.toxicityLevel || "Bio-Safe (Green)"}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Bio-Safe (Green)">Bio-Safe (Green)</option>
                    <option value="Moderate (Blue)">Moderate (Blue)</option>
                    <option value="Caution (Yellow)">Caution (Yellow)</option>
                    <option value="Hazardous (Red)">Hazardous (Red)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Eco & Expert Badges */}
              <div className="flex flex-wrap gap-6 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <label className="flex items-center gap-2 text-sm font-medium text-emerald-900 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isEcoFriendly"
                    checked={Boolean(formData.isEcoFriendly)}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  🌿 Mark as Eco-Friendly Treatment
                </label>

                <label className="flex items-center gap-2 text-sm font-medium text-emerald-900 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isExpertRecommended"
                    checked={Boolean(formData.isExpertRecommended)}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  ⭐ Expert-Recommended Product
                </label>
              </div>

              {/* Row 4: Supplier Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="supplierName"
                    value={formData.supplierName || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="supplierContact"
                    value={formData.supplierContact || ""}
                    onChange={handleSupplierContactChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                  />
                  {errors.supplierContact && (
                    <p className="text-xs text-red-500 mt-1">{errors.supplierContact}</p>
                  )}
                </div>
              </div>

              {/* Row 5: Usage Instructions */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Usage Instructions <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="usageInstructions"
                  rows="3"
                  value={formData.usageInstructions || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Row 6: Target Usage Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Target Disease / Usage Area
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {diseaseOptions.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 text-xs bg-gray-50 border p-2 rounded cursor-pointer hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        value={option}
                        checked={formData.diseaseUsage?.includes(option) || false}
                        onChange={handleDiseaseChange}
                        className="w-3.5 h-3.5 text-emerald-600 rounded"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <FaTimesCircle className="inline mr-1" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid()}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow transition-all ${
                    isFormValid()
                      ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  <FaSave className="inline mr-1.5" /> Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditMaterial;