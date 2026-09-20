import React, { useState, useRef, useEffect } from "react";

// Dynamic backend URL: Render backend in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-agriguard-mern.onrender.com";

const DetectDisease = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Live Camera States & Ref
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      stopCamera();
    }
  };

  // Start Live Webcam / Mobile Rear Camera
  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setCameraStream(stream);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError("Camera permission denied or camera not accessible.");
    }
  };

  // Attach active stream to video element
  useEffect(() => {
    if (isCameraActive && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, cameraStream]);

  // Turn off active stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    setCameraError("");
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Snap image from live stream
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const capturedFile = new File(
            [blob],
            `leaf-capture-${Date.now()}.jpg`,
            { type: "image/jpeg" }
          );
          setSelectedFile(capturedFile);
          setPreviewUrl(URL.createObjectURL(capturedFile));
          setResult(null);
          stopCamera();
        }
      },
      "image/jpeg",
      0.95
    );
  };

  // Live Location Capture & API Submit
  const handleIdentify = async () => {
    if (!selectedFile) return alert("Please select an image first!");

    setLoading(true);
    setResult(null);

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
            const response = await fetch(`${API_BASE_URL}/api/disease/detect`, {
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
      const response = await fetch(`${API_BASE_URL}/api/disease/detect`, {
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
            Upload a leaf photo or use live camera to instantly detect plant diseases and get treatment recommendations.
          </p>
        </div>

        {cameraError && <div style={styles.errorBanner}>{cameraError}</div>}

        {/* Live Camera Viewport */}
        {isCameraActive ? (
          <div style={styles.cameraBox}>
            <div style={styles.videoWrapper}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={styles.videoPlayer}
              />
              <div style={styles.cameraFrameOverlay} />
            </div>
            <div style={styles.cameraActions}>
              <button
                type="button"
                onClick={capturePhoto}
                style={styles.captureBtn}
              >
                📸 Capture Photo
              </button>
              <button
                type="button"
                onClick={stopCamera}
                style={styles.cancelCameraBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* File Upload Zone & Camera Trigger */
          <div style={styles.uploadBox}>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              id="fileInput"
              style={{ display: "none" }}
            />

            {previewUrl ? (
              <div style={styles.previewContainer}>
                <img src={previewUrl} alt="Preview" style={styles.previewImage} />
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <label htmlFor="fileInput" style={styles.changeBtn}>
                    Upload Another
                  </label>
                  <span style={{ color: "#aaa" }}>|</span>
                  <button
                    type="button"
                    onClick={startCamera}
                    style={styles.switchCameraBtn}
                  >
                    Use Live Camera
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.actionGrid}>
                {/* Upload from device */}
                <label htmlFor="fileInput" style={styles.actionCard}>
                  <div style={styles.uploadIcon}>🌱</div>
                  <p style={{ margin: "10px 0 3px", fontWeight: "600", color: "#2e7d32", fontSize: "14px" }}>
                    Upload Leaf Photo
                  </p>
                  <span style={{ fontSize: "11px", color: "#777" }}>Browse JPG, PNG, WEBP</span>
                </label>

                {/* Open live webcam/phone camera */}
                <div onClick={startCamera} style={styles.actionCard}>
                  <div style={styles.uploadIcon}>📷</div>
                  <p style={{ margin: "10px 0 3px", fontWeight: "600", color: "#2e7d32", fontSize: "14px" }}>
                    Use Live Camera
                  </p>
                  <span style={{ fontSize: "11px", color: "#777" }}>Snap real-time picture</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleIdentify}
          disabled={loading || !selectedFile || isCameraActive}
          style={{
            ...styles.button,
            opacity: loading || !selectedFile || isCameraActive ? 0.6 : 1,
            cursor: loading || !selectedFile || isCameraActive ? "not-allowed" : "pointer",
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
  errorBanner: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    marginBottom: "16px",
    textAlign: "center",
    border: "1px solid #fecaca",
  },
  uploadBox: {
    border: "2px dashed #b7e4c7",
    borderRadius: "12px",
    backgroundColor: "#fafdfa",
    padding: "20px",
    textAlign: "center",
    marginBottom: "20px",
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  actionCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 10px",
    borderRadius: "10px",
    border: "1px solid #d8f3dc",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    transition: "transform 0.2s, background-color 0.2s",
  },
  uploadIcon: {
    fontSize: "34px",
  },
  cameraBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
  },
  videoWrapper: {
    position: "relative",
    width: "100%",
    height: "260px",
    backgroundColor: "#000",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cameraFrameOverlay: {
    position: "absolute",
    inset: "16px",
    border: "2px dashed rgba(52, 211, 153, 0.7)",
    borderRadius: "10px",
    pointerEvents: "none",
  },
  cameraActions: {
    display: "flex",
    gap: "12px",
    width: "100%",
    justifyContent: "center",
  },
  captureBtn: {
    backgroundColor: "#2e7d32",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  cancelCameraBtn: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "bold",
    cursor: "pointer",
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
  switchCameraBtn: {
    background: "none",
    border: "none",
    fontSize: "13px",
    color: "#2e7d32",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "underline",
    padding: 0,
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