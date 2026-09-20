import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { io } from "socket.io-client";

// Fix Leaflet Default Icon Issue in React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Socket connection to backend
const socket = io("http://localhost:5557");

const initialDiseases = [
  {
    id: 1,
    name: "Late Blight",
    crop: "Potato",
    lat: 28.3670,
    lng: 79.4304,
    severity: "High",
    location: "Bareilly, UP",
    outbreakChance: "85%",
  },
  {
    id: 2,
    name: "Rice Blast",
    crop: "Rice",
    lat: 27.1767,
    lng: 78.0081,
    severity: "Medium",
    location: "Agra, UP",
    outbreakChance: "60%",
  },
];

const DiseaseMap = () => {
  const [diseases, setDiseases] = useState(initialDiseases);
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Form State for Collaborative Data Sharing
  const [formData, setFormData] = useState({
    name: "",
    crop: "",
    location: "",
    severity: "Medium",
    lat: "",
    lng: "",
  });

  // Real-time listener from socket
  useEffect(() => {
    socket.on("receive_disease_report", (newReport) => {
      setDiseases((prev) => [newReport, ...prev]);
    });

    return () => {
      socket.off("receive_disease_report");
    };
  }, []);

  const getSeverityColor = (severity) => {
    if (severity === "High") return "#d32f2f";
    if (severity === "Medium") return "#f57c00";
    return "#388e3c";
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.lat || !formData.lng) return;

    const reportPayload = {
      id: Date.now(),
      name: formData.name,
      crop: formData.crop || "General Crop",
      location: formData.location || "Local Region",
      severity: formData.severity,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      outbreakChance: formData.severity === "High" ? "80%" : "40%",
    };

    // Emit live to backend socket
    socket.emit("new_disease_report", reportPayload);

    // Reset Form
    setFormData({
      name: "",
      crop: "",
      location: "",
      severity: "Medium",
      lat: "",
      lng: "",
    });
  };

  const filteredDiseases = selectedFilter === "All"
    ? diseases
    : diseases.filter((d) => d.severity === selectedFilter);

  return (
    <div style={{ maxWidth: "1100px", margin: "20px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ color: "#2E7D32", margin: "0 0 5px 0" }}>🗺️ Regional Disease Mapping</h2>
          <p style={{ color: "#666", margin: "0" }}>
            Real-time tracking of plant disease outbreaks and predictive risk modeling.
          </p>
        </div>
        <div style={{ padding: "6px 12px", backgroundColor: "#E8F5E9", borderRadius: "20px", color: "#2E7D32", fontWeight: "bold", fontSize: "14px" }}>
          ● Live Socket Sync Active
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
        {["All", "High", "Medium", "Low"].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setSelectedFilter(level)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: selectedFilter === level ? "#2E7D32" : "#e0e0e0",
              color: selectedFilter === level ? "#fff" : "#333",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {level === "All" ? "All Outbreaks" : `${level} Risk`}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div style={{ height: "500px", width: "100%", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        <MapContainer center={[27.8000, 79.0000]} zoom={7} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredDiseases.map((disease) => (
            <React.Fragment key={disease.id}>
              {/* Radial Outbreak Warning Circle */}
              <CircleMarker
                center={[disease.lat, disease.lng]}
                radius={22}
                fillColor={getSeverityColor(disease.severity)}
                color={getSeverityColor(disease.severity)}
                weight={1}
                fillOpacity={0.25}
              />
              <Marker position={[disease.lat, disease.lng]}>
                <Popup>
                  <div style={{ padding: "5px", minWidth: "160px" }}>
                    <h4 style={{ margin: "0 0 5px 0", color: getSeverityColor(disease.severity) }}>
                      {disease.name}
                    </h4>
                    <p style={{ margin: "3px 0" }}><b>Crop:</b> {disease.crop}</p>
                    <p style={{ margin: "3px 0" }}><b>Location:</b> {disease.location}</p>
                    <p style={{ margin: "3px 0" }}>
                      <b>Severity:</b>{" "}
                      <span style={{ color: getSeverityColor(disease.severity), fontWeight: "bold" }}>
                        {disease.severity}
                      </span>
                    </p>
                    {disease.outbreakChance && (
                      <p style={{ margin: "3px 0" }}><b>Outbreak Risk:</b> {disease.outbreakChance}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      {/* Collaborative Reporting Form */}
      <div style={{ marginTop: "30px", background: "#F1F8E9", padding: "20px", borderRadius: "10px", border: "1px solid #C8E6C9" }}>
        <h3 style={{ color: "#2E7D32", margin: "0 0 10px 0" }}>📢 Report Disease Outbreak in Your Area</h3>
        <p style={{ fontSize: "13px", color: "#555", margin: "0 0 15px 0" }}>
          Share verified outbreak data to alert nearby farmers instantly via live broadcast.
        </p>

        <form onSubmit={handleFormSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          <input
            type="text"
            placeholder="Disease Name (e.g. Rust)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <input
            type="text"
            placeholder="Crop Affected (e.g. Wheat)"
            value={formData.crop}
            onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <input
            type="text"
            placeholder="City / Region"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <input
            type="number"
            step="any"
            placeholder="Latitude (e.g. 28.36)"
            value={formData.lat}
            onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
            required
            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude (e.g. 79.43)"
            value={formData.lng}
            onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
            required
            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <select
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          >
            <option value="Low">Low Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="High">High Severity</option>
          </select>
          <button
            type="submit"
            style={{
              backgroundColor: "#2E7D32",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              padding: "10px",
            }}
          >
            Broadcast Outbreak
          </button>
        </form>
      </div>
    </div>
  );
};

export default DiseaseMap;