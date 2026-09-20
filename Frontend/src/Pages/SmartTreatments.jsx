import React, { useState } from "react";

const SmartTreatments = () => {
  const [diseaseName, setDiseaseName] = useState("");
  const [cropType, setCropType] = useState("");
  const [treatmentData, setTreatmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetTreatment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTreatmentData(null);

    try {
      const response = await fetch("http://localhost:5557/api/ai/treatment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diseaseName, cropType }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setTreatmentData(resData.data);
      } else {
        setError(resData.message || "Failed to fetch treatment data.");
      }
    } catch (err) {
      setError("Server connection failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#2E7D32" }}>🌱 AI Smart Treatment Guide</h2>
      <p style={{ textAlign: "center", color: "#666" }}>
        Enter crop and disease details to get instant AI-generated treatment plans.
      </p>

      <form onSubmit={handleGetTreatment} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
        <div>
          <label style={{ fontWeight: "bold" }}>Crop Type:</label>
          <input
            type="text"
            placeholder="e.g. Tomato, Wheat, Rose"
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        <div>
          <label style={{ fontWeight: "bold" }}>Disease Name:</label>
          <input
            type="text"
            placeholder="e.g. Black Spot, Leaf Blight"
            value={diseaseName}
            onChange={(e) => setDiseaseName(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: "#2E7D32",
            color: "white",
            padding: "12px",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Generating Treatment..." : "Get AI Treatment Plan"}
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: "20px", textAlign: "center" }}>{error}</p>}

      {treatmentData && (
        <div style={{ marginTop: "30px", background: "#F1F8E9", padding: "20px", borderRadius: "8px" }}>
          <h3>🧪 Chemical Treatment</h3>
          <ul>
            {treatmentData.chemicalTreatment?.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>

          <h3 style={{ marginTop: "15px" }}>🌿 Organic/Biological Treatment</h3>
          <ul>
            {treatmentData.organicTreatment?.map((option, i) => (
              <li key={i}>{option}</li>
            ))}
          </ul>

          <h3 style={{ marginTop: "15px" }}>🛡️ Prevention Tips</h3>
          <ul>
            {treatmentData.preventionTips?.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SmartTreatments;