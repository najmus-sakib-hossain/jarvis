"use client";

import { useState, useEffect } from "react";

interface GoFileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  link?: string;
}

export default function GoFileManager() {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<GoFileItem[]>([]);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Fetch items from API route
  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/list");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch items");
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadUrl(null);
      setError(null);
    }
  };

  // Handle file upload
  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setUploadUrl(data.url);
      fetchItems(); // Refresh list after upload
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file deletion
  const handleDelete = async (fileId: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/delete?fileId=${fileId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed");
      setItems(items.filter((item) => item.id !== fileId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>GoFile Manager</h2>

      {/* Upload Section */}
      <form onSubmit={handleUpload} style={{ marginBottom: "20px" }}>
        <input
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          style={{ display: "block", marginBottom: "10px" }}
        />
        <button
          type="submit"
          disabled={!file || isUploading}
          style={{
            padding: "10px 20px",
            backgroundColor: isUploading ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isUploading || !file ? "not-allowed" : "pointer",
          }}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {/* Upload Result */}
      {uploadUrl && (
        <div style={{ marginBottom: "20px" }}>
          <p>File uploaded successfully!</p>
          <a href={uploadUrl} target="_blank" rel="noopener noreferrer">
            {uploadUrl}
          </a>
        </div>
      )}

      {/* Items List */}
      <h3>Your Files and Folders</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : items.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((item) => (
            <li
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                borderBottom: "1px solid #ddd",
              }}
            >
              <span>
                {item.type === "folder" ? "📁" : "📄"} {item.name}
                {item.size && ` (${(item.size / 1024 / 1024).toFixed(2)} MB)`}
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "10px" }}>
                    [Download]
                  </a>
                )}
              </span>
              {item.type === "file" && (
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#ff4444",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No files or folders found.</p>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}