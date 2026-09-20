import React, { useRef, useState } from "react";
import "./Upload.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";

function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    setMessage("");
    setError("");
    setProgress(0);

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setFile(null);
      setError("Please select a CSV file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    handleFile(selectedFile);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const droppedFile = event.dataTransfer.files[0];

    handleFile(droppedFile);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");
    setProgress(10);

    const formData = new FormData();

    formData.append("file", file);

    try {
      const progressTimer = setInterval(() => {
        setProgress((current) => {
          if (current >= 90) {
            clearInterval(progressTimer);
            return 90;
          }

          return current + 10;
        });
      }, 150);

      const response = await fetch(
        `${API_URL}/api/upload/statement`,
        {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
          body: formData,
        }
      );

      clearInterval(progressTimer);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail?.message ||
          data.detail ||
          "Upload failed."
        );
      }

      setProgress(100);

      setMessage(
        `${data.transactions_imported} transactions imported successfully.`
      );
    } catch (err) {
      console.error("Upload error:", err);

      setProgress(0);

      setError(
        err.message ||
        "Failed to upload statement."
      );
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setMessage("");
    setError("");
    setProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="upload-page">

      {/* Animated background */}
      <div className="upload-background">

        <div className="background-orb orb-one"></div>

        <div className="background-orb orb-two"></div>

        <div className="background-orb orb-three"></div>

        <div className="grid-floor"></div>

        <div className="floating-particle particle-one"></div>
        <div className="floating-particle particle-two"></div>
        <div className="floating-particle particle-three"></div>
        <div className="floating-particle particle-four"></div>
        <div className="floating-particle particle-five"></div>

      </div>


      {/* Header */}
      <div className="upload-header">

        <div className="upload-eyebrow">
          <span className="eyebrow-dot"></span>
          FINANCIAL DATA IMPORT
        </div>

        <h1>
          Upload Your
          <span> Statement</span>
        </h1>

        <p>
          Import your financial statement and let FinPilot
          transform your transactions into meaningful insights.
        </p>

      </div>


      {/* Main 3D area */}
      <div className="upload-stage">

        {/* Rotating rings */}
        <div className="orbit orbit-one"></div>
        <div className="orbit orbit-two"></div>
        <div className="orbit orbit-three"></div>


        {/* 3D Upload Card */}
        <div
          className={`upload-card-3d ${
            dragActive ? "dragging" : ""
          } ${
            uploading ? "is-uploading" : ""
          } ${
            message ? "upload-success" : ""
          } ${
            error ? "upload-error" : ""
          }`}
        >

          {/* Card glow */}
          <div className="card-glow"></div>

          {/* Top glass highlight */}
          <div className="card-highlight"></div>


          {/* 3D Folder */}
          <div className="folder-scene">

            <div className="folder-shadow"></div>

            <div className="folder-back">

              <div className="folder-tab"></div>

            </div>

            <div className="folder-front">

              <div className="folder-shine"></div>

              <div className="folder-arrow">
                ↑
              </div>

            </div>

            <div className="folder-glow"></div>

          </div>


          {/* Upload content */}
          <div className="upload-content">

            <div className="upload-title-row">

              <h2>
                {uploading
                  ? "Uploading..."
                  : message
                  ? "Upload Complete"
                  : "Upload Statement"}
              </h2>

              <span className="file-type">
                CSV
              </span>

            </div>


            <p className="upload-description">
              {uploading
                ? "Processing your financial statement..."
                : message
                ? "Your transactions are ready to analyze."
                : "Drag and drop your CSV statement here"}
            </p>


            {/* Drop zone */}
            <div
              className={`drop-zone ${
                dragActive ? "active" : ""
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={openFilePicker}
            >

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                hidden
              />

              <div className="drop-icon">
                ↑
              </div>

              <div>
                <strong>
                  {dragActive
                    ? "Drop your file here"
                    : "Choose a CSV file"}
                </strong>

                <span>
                  Maximum supported format: .CSV
                </span>
              </div>

            </div>


            {/* Selected file */}
            {file && !uploading && (
              <div className="selected-file">

                <div className="file-icon">
                  CSV
                </div>

                <div className="file-details">

                  <strong>
                    {file.name}
                  </strong>

                  <span>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>

                </div>

                <button
                  type="button"
                  className="remove-file"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeFile();
                  }}
                >
                  ×
                </button>

              </div>
            )}


            {/* Upload progress */}
            {uploading && (
              <div className="progress-section">

                <div className="progress-header">

                  <span>
                    Uploading
                  </span>

                  <strong>
                    {progress}%
                  </strong>

                </div>

                <div className="progress-track">

                  <div
                    className="progress-bar"
                    style={{
                      width: `${progress}%`,
                    }}
                  >
                    <div className="progress-shine"></div>
                  </div>

                </div>

                <span className="progress-status">
                  Analyzing financial data...
                </span>

              </div>
            )}


            {/* Upload button */}
            {!uploading && !message && (
              <button
                className="upload-button"
                onClick={handleUpload}
                disabled={!file}
              >

                <span className="button-icon">
                  ↑
                </span>

                <span>
                  Upload Statement
                </span>

                <span className="button-arrow">
                  →
                </span>

              </button>
            )}


            {/* Success */}
            {message && (
              <div className="status-message success-message">

                <div className="status-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Upload successful
                  </strong>

                  <span>
                    {message}
                  </span>
                </div>

              </div>
            )}


            {/* Error */}
            {error && (
              <div className="status-message error-message">

                <div className="status-icon">
                  !
                </div>

                <div>
                  <strong>
                    Upload failed
                  </strong>

                  <span>
                    {error}
                  </span>
                </div>

              </div>
            )}

          </div>


          {/* Bottom metadata */}
          <div className="upload-footer">

            <span>
              🔒 Secure processing
            </span>

            <span>
              •
            </span>

            <span>
              CSV only
            </span>

            <span>
              •
            </span>

            <span>
              FinPilot AI
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Upload;