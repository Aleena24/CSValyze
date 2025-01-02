import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios for backend connection
import "./MainPage.css";

const MainPage = () => {
  const [view, setView] = useState("main");
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(""); // Error message for invalid file type
  const [file, setFile] = useState(null); // State to hold the file
  const [edaSummary, setEdaSummary] = useState(null); // Store EDA summary
  const [descriptiveStats, setDescriptiveStats] = useState(null); // Store descriptive stats
  const [numericalPlot, setNumericalPlot] = useState(""); // Store numerical distribution plot
  const [categoricalPlots, setCategoricalPlots] = useState({}); // Store categorical plots
  const [correlationPlot, setCorrelationPlot] = useState(""); // Store correlation heatmap
  const navigate = useNavigate();

  useEffect(() => {
    const backgroundImageUrl = "./img/three.jpeg";
    document.querySelector(".homepage-main").style.backgroundImage = `url(${backgroundImageUrl})`;
  }, []);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      const fileType = uploadedFile.name.split('.').pop().toLowerCase();
      const allowedTypes = ['csv', 'json', 'xlsx'];

      if (allowedTypes.includes(fileType)) {
        setFileName(uploadedFile.name);
        setFile(uploadedFile); // Save the file to state
        setView("fileUploading");

        uploadFileToBackend(uploadedFile); // Call function to upload the file to backend
      } else {
        setErrorMessage("Please upload a valid file type: .csv, .json, or .xlsx");
      }
    }
  };

  // Function to upload file to backend
  const uploadFileToBackend = async (uploadedFile) => {
    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      // Backend API request
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress); // Update upload progress
        },
      });

      if (response.status === 200) {
        // Set EDA data on success
        const data = response.data;
        setEdaSummary(data.summary);
        setDescriptiveStats(data.descriptive_stats);
        setNumericalPlot(data.numerical_distribution);
        setCategoricalPlots(data.categorical_distributions);
        setCorrelationPlot(data.correlation_plot);
        setView("fileUploaded"); // File uploaded successfully
      } else {
        throw new Error("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrorMessage("Error uploading file. Please try again.");
      setView("main");
    }
  };

  const handleUnderConstructionClick = () => {
    setView("underConstruction");
  };

  const handleNextClick = () => {
    navigate("/algorithm");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <div>
      <main className="homepage-main">
        {view === "main" && (
          <>
            <h1 className="headline">Build and evaluate ML algorithm automatically</h1>
            <p className="subheadline">Upload Your Data</p>

            <div className="cta">
              <label
                className="btn btn-secondary"
                data-tooltip="Upload CSV, Excel, or JSON files for text/numerical data"
              >
                Text / Numerical
                <input
                  type="file"
                  accept=".csv, .xlsx, .json"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
              </label>
              <button
                className="btn btn-secondary"
                data-tooltip="Upload supported image or video formats"
                onClick={handleUnderConstructionClick}
              >
                Images / Videos
              </button>
            </div>

            {errorMessage && (
              <div className="error-message">
                <p>{errorMessage}</p>
              </div>
            )}
          </>
        )}

        {view === "fileUploading" && (
          <div className="alternate-content">
            <h1 className="headline">File Uploading...</h1>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}

        {view === "fileUploaded" && (
          <div className="alternate-content">
            <div className="message-box">
              <h1>File Uploaded Successfully</h1>
              <p><strong>File Name:</strong> {fileName}</p>
              <p>Proceed with your analysis now.</p>

              {/* EDA Summary */}
              {edaSummary && (
                <div className="eda-summary">
                  <h2>EDA Summary</h2>
                  <pre>{JSON.stringify(edaSummary, null, 2)}</pre>
                </div>
              )}

              {/* Descriptive Statistics */}
              {descriptiveStats && (
                <div className="descriptive-stats">
                  <h2>Descriptive Statistics</h2>
                  <pre>{JSON.stringify(descriptiveStats, null, 2)}</pre>
                </div>
              )}

              {/* Numerical Distribution Plot */}
              {numericalPlot && (
                <div className="plot-container">
                  <h2>Numerical Distribution</h2>
                  <img src={`data:image/png;base64,${numericalPlot}`} alt="Numerical Distribution" />
                </div>
              )}

              {/* Categorical Distributions */}
              {Object.keys(categoricalPlots).length > 0 && (
                <div className="plot-container">
                  <h2>Categorical Distributions</h2>
                  {Object.keys(categoricalPlots).map((col, index) => (
                    <div key={index}>
                      <h3>{col}</h3>
                      <img src={`data:image/png;base64,${categoricalPlots[col]}`} alt={col} />
                    </div>
                  ))}
                </div>
              )}

              {/* Correlation Heatmap */}
              {correlationPlot && (
                <div className="plot-container">
                  <h2>Correlation Heatmap</h2>
                  <img src={`data:image/png;base64,${correlationPlot}`} alt="Correlation Heatmap" />
                </div>
              )}
            </div>

            {/* Swipe Button */}
            <div className="swipe-button-container" onClick={handleNextClick}>
              <button className="swipe-button">
                <span>Swipe Next</span>
                <div className="arrow-container">
                  <div className="arrow"></div>
                </div>
              </button>
            </div>
          </div>
        )}

        {view === "underConstruction" && (
          <div className="alternate-content">
            <h1 className="headline">Coming Soon</h1>
            <p className="subheadline">
              The Images / Videos functionality is currently under development. Stay tuned for updates!
            </p>
          </div>
        )}
      </main>

      {/* Home Icon */}
      <div className="home-icon" onClick={handleHomeClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 3l9 8h-3v10h-12v-10h-3z" />
        </svg>
      </div>
    </div>
  );
};

export default MainPage;
