import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import { MdSearch } from "react-icons/md";
import { FaSort, FaEye, FaTrash, FaStar, FaLeaf } from "react-icons/fa";
import SupplierSidebar from "../components/SupplierSidebar";
import { motion, AnimatePresence } from "framer-motion";
import ShowMaterial from "./ShowMaterial";
import { Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import EditMaterial from "./EditMaterial";
import ManagerNavBar from "../components/ManagerNavBar";

const HomeMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("materialName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterEcoOnly, setFilterEcoOnly] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      // Primary route check
      const res = await axios.get("http://localhost:5557/api/material");
      setMaterials(res.data.data || res.data);
    } catch {
      try {
        // Fallback route check
        const fallbackRes = await axios.get("http://localhost:5557/materials");
        setMaterials(fallbackRes.data.data || fallbackRes.data);
      } catch (err) {
        console.error("Failed to load materials:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const openEditModal = (materialId) => setEditingMaterial(materialId);
  const closeEditModal = () => setEditingMaterial(null);

  const handleMaterialUpdate = () => {
    fetchMaterials();
    closeEditModal();
  };

  const openDeleteModal = (materialId) => {
    setMaterialToDelete(materialId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setMaterialToDelete(null);
  };

  const handleDelete = async () => {
    if (!materialToDelete) return;
    try {
      await axios.delete(`http://localhost:5557/api/material/${materialToDelete}`).catch(() => {
        return axios.delete(`http://localhost:5557/materials/${materialToDelete}`);
      });
      setMaterials(materials.filter((m) => m._id !== materialToDelete));
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getCategoryColor = (category = "") => {
    const cat = category.toLowerCase();
    if (cat.includes("bio") || cat.includes("eco") || cat.includes("organic")) {
      return "bg-emerald-600 text-white";
    }
    if (cat.includes("fertilizer")) return "bg-blue-500 text-white";
    if (cat.includes("pesticide")) return "bg-red-500 text-white";
    if (cat.includes("herbicide")) return "bg-amber-500 text-white";
    return "bg-gray-500 text-white";
  };

  const getToxicityBadge = (level = "") => {
    if (level.includes("Green") || level.includes("Bio-Safe")) {
      return { text: "Bio-Safe", color: "bg-green-100 text-green-800 border-green-300" };
    }
    if (level.includes("Blue") || level.includes("Moderate")) {
      return { text: "Moderate", color: "bg-blue-100 text-blue-800 border-blue-300" };
    }
    if (level.includes("Yellow") || level.includes("Caution")) {
      return { text: "Caution", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
    }
    return { text: "Hazardous", color: "bg-red-100 text-red-800 border-red-300" };
  };

  const openMaterialDetails = (materialId) => setSelectedMaterial(materialId);
  const closeMaterialDetails = () => setSelectedMaterial(null);

  const filteredAndSortedMaterials = (materials || [])
    .filter((m) => {
      const matchesSearch = (m.materialName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "" || m.category === filterCategory;
      const matchesEco = !filterEcoOnly || m.isEcoFriendly;
      return matchesSearch && matchesCategory && matchesEco;
    })
    .sort((a, b) => {
      const valA = a[sortField] || 0;
      const valB = b[sortField] || 0;
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

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
      ></div>

      <ManagerNavBar />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <SupplierSidebar />

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mt-20 mb-8">
              Materials & Eco Supply Store
            </h1>

            <div className="bg-white bg-opacity-40 backdrop-filter backdrop-blur-sm rounded-lg shadow-md p-6 mb-8">
              {/* Search, Filter and Sorting Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex-1 min-w-[220px] relative">
                  <input
                    type="text"
                    placeholder="Search eco supplies, medicines, fertilizers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border-2 border-green-400 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
                  />
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                </div>

                {/* Category Dropdown */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="p-3 border border-green-300 rounded-md text-sm bg-green-50 font-medium"
                >
                  <option value="">All Categories</option>
                  <option value="Eco-Friendly Treatment">Eco-Friendly Treatment</option>
                  <option value="Bio-Pesticide">Bio-Pesticide</option>
                  <option value="Organic Fertilizer">Organic Fertilizer</option>
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Pesticide">Pesticide</option>
                  <option value="Herbicide">Herbicide</option>
                </select>

                {/* Eco-Friendly Toggle Button */}
                <button
                  type="button"
                  onClick={() => setFilterEcoOnly(!filterEcoOnly)}
                  className={`p-3 rounded-md text-sm font-semibold flex items-center transition-colors border ${
                    filterEcoOnly
                      ? "bg-green-700 text-white border-green-800"
                      : "bg-white text-green-700 border-green-400 hover:bg-green-50"
                  }`}
                >
                  <FaLeaf className="mr-2" />
                  Eco-Friendly Only
                </button>

                {/* Sort by Name */}
                <button
                  type="button"
                  onClick={() => handleSort("materialName")}
                  className="p-3 bg-green-100 text-gray-700 rounded-md hover:bg-green-500 hover:text-white transition-colors flex items-center text-sm font-medium"
                >
                  <FaSort className="mr-1" />
                  Name
                </button>

                {/* Sort by Price */}
                <button
                  type="button"
                  onClick={() => handleSort("pricePerUnit")}
                  className="p-3 bg-green-100 text-gray-700 rounded-md hover:bg-green-500 hover:text-white transition-colors flex items-center text-sm font-medium"
                >
                  <FaSort className="mr-1" />
                  Price
                </button>
              </div>

              {loading ? (
                <Spinner />
              ) : (
                <section className="w-fit mx-auto grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 justify-items-center justify-center gap-y-12 gap-x-10 mt-6 mb-3">
                  {filteredAndSortedMaterials.map((material) => {
                    const toxicity = getToxicityBadge(material.toxicityLevel);
                    const hasDiscount =
                      material.originalPrice && material.originalPrice > material.pricePerUnit;

                    return (
                      <div
                        key={material._id}
                        className="w-80 bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm shadow-lg rounded-2xl duration-300 hover:scale-102 hover:shadow-2xl transition-all relative border border-gray-200 overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          {/* Image & Top Badges */}
                          <div className="relative">
                            <img
                              src={
                                material.image ||
                                "https://via.placeholder.com/320x200?text=Agri+Supply"
                              }
                              alt={material.materialName}
                              className="h-52 w-full object-cover"
                            />

                            <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                              {/* Eco Badge */}
                              {material.isEcoFriendly && (
                                <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow flex items-center gap-1">
                                  <FaLeaf /> Eco-Friendly
                                </span>
                              )}

                              {/* Expert Choice Badge */}
                              {material.isExpertRecommended && (
                                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow flex items-center gap-1">
                                  <FaStar /> Expert Choice
                                </span>
                              )}
                            </div>

                            {/* Toxicity Indicator */}
                            <span
                              className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full border shadow-sm ${toxicity.color}`}
                            >
                              {toxicity.text}
                            </span>
                          </div>

                          {/* Card Content */}
                          <div className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getCategoryColor(
                                material.category
                              )}`}
                            >
                              {material.category}
                            </span>

                            <h3 className="text-lg font-bold text-gray-800 capitalize mt-2 truncate">
                              {material.materialName}
                            </h3>

                            {/* Price & Savings Display */}
                            <div className="mt-2 flex items-baseline gap-2">
                              <span className="text-xl font-extrabold text-green-700">
                                Rs.{material.pricePerUnit?.toFixed(2)}
                              </span>
                              <span className="text-xs text-gray-500">
                                / {material.unitType || "unit"}
                              </span>

                              {hasDiscount && (
                                <>
                                  <span className="text-xs line-through text-gray-400">
                                    Rs.{material.originalPrice.toFixed(2)}
                                  </span>
                                  <span className="text-xs font-bold text-red-600">
                                    {Math.round(
                                      ((material.originalPrice - material.pricePerUnit) /
                                        material.originalPrice) *
                                        100
                                    )}
                                    % OFF
                                  </span>
                                </>
                              )}
                            </div>

                            {material.supplierName && (
                              <p className="text-xs text-gray-500 mt-1">
                                Supplier: <span className="font-medium text-gray-700">{material.supplierName}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-100 mt-2">
                          <button
                            type="button"
                            onClick={() => openMaterialDetails(material._id)}
                            className="flex items-center text-green-700 text-xs font-bold hover:text-green-900"
                          >
                            <FaEye className="mr-1" /> View
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(material._id)}
                            className="flex items-center text-blue-600 text-xs font-bold hover:text-blue-800"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(material._id)}
                            className="flex items-center text-red-600 text-xs font-bold hover:text-red-800"
                          >
                            <FaTrash className="mr-1" /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </section>
              )}

              {!loading && filteredAndSortedMaterials.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600 font-medium">
                    No materials found. Start by adding a new eco-friendly supply.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingMaterial && (
          <EditMaterial
            id={editingMaterial}
            onClose={closeEditModal}
            onUpdate={handleMaterialUpdate}
          />
        )}
      </AnimatePresence>

      {/* Material Details Modal */}
      <AnimatePresence>
        {selectedMaterial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-filter backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <ShowMaterial id={selectedMaterial} onClose={closeMaterialDetails} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-filter backdrop-blur-md flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Confirmation</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete this material? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HomeMaterial;