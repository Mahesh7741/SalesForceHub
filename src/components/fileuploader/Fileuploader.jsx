import React, { useState } from "react";

const FileUploader = () => {
  const [objectName, setObjectName] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!objectName || !csvFile) {
      setStatus("Please fill in the object name and select a CSV file.");
      return;
    }

    const sfAuthData = localStorage.getItem("sfAuthData");
    if (!sfAuthData) {
      setStatus("Missing Salesforce credentials in localStorage.");
      return;
    }

    const { accessToken, instanceUrl } = JSON.parse(sfAuthData);

    if (!accessToken || !instanceUrl) {
      setStatus("Invalid Salesforce credentials.");
      return;
    }

    const formData = new FormData();
    formData.append("objectName", objectName);
    formData.append("csv", csvFile);

    setIsLoading(true);
    setStatus("Uploading...");

    try {
      const response = await fetch("/api/fileUploader", {
        method: "POST",
        body: formData,
        headers: {
          "x-salesforce-token": accessToken,
          "x-salesforce-instance": instanceUrl,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setStatus(
          `✅ Upload successful: ${
            result.results?.length || 0
          } records inserted.`
        );
      } else {
        setStatus(`❌ Error: ${result.error || "Upload failed"}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus("❌ Upload failed. Check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Upload CSV to Salesforce</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="objectName" style={styles.label}>
            Object API Name
          </label>
          <input
            type="text"
            id="objectName"
            value={objectName}
            onChange={(e) => setObjectName(e.target.value)}
            style={styles.input}
            placeholder="e.g., Account"
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="csvFile" style={styles.label}>
            Select CSV File
          </label>
          <input
            type="file"
            id="csvFile"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files[0])}
            style={styles.input}
            required
          />
        </div>

        <button type="submit" style={styles.button} disabled={isLoading}>
          {isLoading ? "Uploading..." : "Upload CSV"}
        </button>
      </form>

      {status && <div style={styles.status}>{status}</div>}
    </div>
  );
};

// Simple CSS in JS for layout and styling
const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "16px",
  },
  inputGroup: {
    textAlign: "left",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px 20px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  status: {
    marginTop: "20px",
    fontSize: "16px",
    color: "#333",
    minHeight: "24px",
  },
};

export default FileUploader;
