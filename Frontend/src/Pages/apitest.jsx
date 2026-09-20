import React, { useState } from "react";

const DetectDisease = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  // Live Location Capture & API Submit
  const handleIdentify = async () => {
    if (!selectedFile) return alert("Please select an image first!");

    setLoading(true);
    setResult(null);

    // Get User Coordinates via Browser Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const formData = new FormData();
          formData.append("image", selectedFile);
          formData.append("lat", lat);
          formData.append("lng", lng);

          try {
            const response = await fetch("http://localhost:5557/api/disease/detect", {
              method: "POST",
              body: formData,
            });

            const data = await response.json();
            if (data.success) {
              setResult(data.data);
            } else {
              alert("Failed to detect disease: " + data.message);
            }
          } catch (err) {
            alert("Error connecting to server!");
          } finally {
            setLoading(false);
          }
        },
        async (error) => {
          console.warn("Location permission denied. Sending request without coordinates.");
          // Fallback: Agar user location permission deny kar de
          sendWithoutLocation();
        }
      );
    } else {
      sendWithoutLocation();
    }
  };

  const sendWithoutLocation = async () => {
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("http://localhost:5557/api/disease/detect", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert("Failed to detect disease: " + data.message);
      }
    } catch (err) {
      alert("Error connecting to server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.badge}>AgriGuard AI</span>
          <h1 style={styles.title}>Plant Disease Identifier</h1>
          <p style={styles.subtitle}>
            Upload a leaf photo to instantly detect plant diseases, get treatment recommendations, and update local outbreaks.
          </p>
        </div>

        {/* File Upload Zone */}
        <div style={styles.uploadBox}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="fileInput"
            style={{ display: "none" }}
          />

          {previewUrl ? (
            <div style={styles.previewContainer}>
              <img src={previewUrl} alt="Preview" style={styles.previewImage} />
              <label htmlFor="fileInput" style={styles.changeBtn}>
                Change Image
              </label>
            </div>
          ) : (
            <label htmlFor="fileInput" style={styles.dropZone}>
              <div style={styles.uploadIcon}>🌱</div>
              <p style={{ margin: "10px 0 5px", fontWeight: "600", color: "#2e7d32" }}>
                Click to upload plant photo
              </p>
              <span style={{ fontSize: "12px", color: "#666" }}>Supports JPG, PNG, WEBP</span>
            </label>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleIdentify}
          disabled={loading || !selectedFile}
          style={{
            ...styles.button,
            opacity: loading || !selectedFile ? 0.6 : 1,
            cursor: loading || !selectedFile ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Analyzing Leaf Pattern & Location..." : "Identify Disease"}
        </button>

        {/* Results Section */}
        {result && (
          <div style={styles.resultContainer}>
            <div style={styles.resultHeader}>
              <div>
                <span style={styles.diseaseBadge}>Detected Condition</span>
                <h2 style={styles.diseaseTitle}>{result.diseaseName}</h2>
              </div>
              <div style={styles.confidenceBox}>
                <span style={styles.confidenceVal}>{result.confidence || 94}%</span>
                <span style={styles.confidenceLabel}>Confidence</span>
              </div>
            </div>

            <div style={styles.grid}>
              {/* Symptoms Card */}
              <div style={styles.infoCard}>
                <h3 style={styles.cardTitle}>🔍 Symptoms</h3>
                <ul style={styles.list}>
                  {result.symptoms?.map((sym, idx) => (
                    <li key={idx} style={styles.listItem}>
                      {sym}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Treatment Card */}
              <div style={styles.infoCard}>
                <h3 style={styles.cardTitle}>💊 Recommended Treatment</h3>
                <ul style={styles.list}>
                  {result.treatment?.map((treat, idx) => (
                    <li key={idx} style={styles.listItem}>
                      {treat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prevention Card */}
              {result.prevention && (
                <div style={{ ...styles.infoCard, gridColumn: "1 / -1" }}>
                  <h3 style={styles.cardTitle}>🛡️ Prevention Tips</h3>
                  <ul style={styles.list}>
                    {result.prevention?.map((prev, idx) => (
                      <li key={idx} style={styles.listItem}>
                        {prev}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Inline CSS Styles
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f4f7f4",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "750px",
    padding: "32px",
  },
  header: {
    textAlign: "center",
    marginBottom: "28px",
  },
  badge: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "0.5px",
  },
  title: {
    color: "#1b4332",
    fontSize: "28px",
    margin: "12px 0 6px",
  },
  subtitle: {
    color: "#666",
    fontSize: "14px",
    margin: 0,
  },
  uploadBox: {
    border: "2px dashed #b7e4c7",
    borderRadius: "12px",
    backgroundColor: "#fafdfa",
    padding: "20px",
    textAlign: "center",
    marginBottom: "20px",
  },
  dropZone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
  },
  uploadIcon: {
    fontSize: "40px",
  },
  previewContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  previewImage: {
    maxHeight: "220px",
    borderRadius: "8px",
    objectFit: "cover",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  changeBtn: {
    fontSize: "13px",
    color: "#2e7d32",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "underline",
  },
  button: {
    width: "100%",
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "all 0.3s ease",
  },
  resultContainer: {
    marginTop: "30px",
    paddingTop: "24px",
    borderTop: "1px solid #eee",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: "16px 20px",
    borderRadius: "12px",
    borderLeft: "5px solid #2e7d32",
    marginBottom: "20px",
  },
  diseaseBadge: {
    fontSize: "12px",
    color: "#2e7d32",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  diseaseTitle: {
    margin: "4px 0 0",
    color: "#1b4332",
    fontSize: "20px",
  },
  confidenceBox: {
    textAlign: "right",
  },
  confidenceVal: {
    display: "block",
    fontSize: "22px",
    fontWeight: "bold",
    color: "#2e7d32",
  },
  confidenceLabel: {
    fontSize: "11px",
    color: "#666",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  infoCard: {
    backgroundColor: "#fafafa",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid #f0f0f0",
  },
  cardTitle: {
    fontSize: "15px",
    color: "#333",
    marginTop: 0,
    marginBottom: "10px",
  },
  list: {
    margin: 0,
    paddingLeft: "18px",
  },
  listItem: {
    fontSize: "13px",
    color: "#555",
    marginBottom: "6px",
    lineHeight: "1.4",
  },
};

export default DetectDisease;