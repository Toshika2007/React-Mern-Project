
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import "../css/dashboard.css";

function getAnalysis(document) {
  if (!document?.analysis) return null;

  if (typeof document.analysis === "object") {
    return document.analysis;
  }

  if (typeof document.analysis === "string") {
    try {
      return JSON.parse(document.analysis);
    } catch {
      return null;
    }
  }

  return null;
}

function Dashboard() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ================= FETCH USER DOCUMENTS =================

  const fetchDocuments = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/documents?userId=${encodeURIComponent(userId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch documents.");
      }

      setDocuments(
        Array.isArray(data.documents) ? data.documents : []
      );
    } catch (error) {
      console.error("Dashboard documents error:", error);
      showToast(error.message || "Unable to load documents.", "error");
    } finally {
      setDocumentsLoading(false);
    }
  };

  // ================= FIREBASE AUTHENTICATION =================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthLoading(false);
        fetchDocuments(currentUser.uid);
      } else {
        setUser(null);
        setDocuments([]);
        setDocumentsLoading(false);
        setAuthLoading(false);
        navigate("/login", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // ================= DOCUMENT STATISTICS =================

  const analyzedDocuments = documents.filter((doc) => {
    const analysis = getAnalysis(doc);
    return Boolean(
      analysis &&
      (analysis.summary ||
        analysis.importantClauses ||
        analysis.legalRisks)
    );
  });

  const totalRisks = analyzedDocuments.reduce((total, doc) => {
    const analysis = getAnalysis(doc);
    return total + (
      Array.isArray(analysis?.legalRisks)
        ? analysis.legalRisks.length
        : 0
    );
  }, 0);

  // Risk Reports counts analyzed documents that contain risks.
  const riskReportCount = analyzedDocuments.filter((doc) => {
    const analysis = getAnalysis(doc);
    return (
      Array.isArray(analysis?.legalRisks) &&
      analysis.legalRisks.length > 0
    );
  }).length;

  // ================= SELECT PDF =================

  const validateFile = (file) => {
    if (!file) return false;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      showToast("Please select a PDF file.", "error");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("File size must not exceed 10 MB.", "error");
      return false;
    }

    setSelectedFile(file);
    showToast(`${file.name} selected successfully!`, "success");
    return true;
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      validateFile(file);
    }

    // Allow selecting the same file again.
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      validateFile(file);
    }
  };

  // ================= UPLOAD PDF =================

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast("Please select a PDF first.", "error");
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      showToast("Please log in before uploading.", "error");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("document", selectedFile);
    formData.append("userId", currentUser.uid);

    try {
      setUploading(true);

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "PDF upload failed.");
      }

      setSelectedFile(null);

      showToast("PDF uploaded successfully!", "success");

      // Refresh from MongoDB to get the saved document record.
      await fetchDocuments(currentUser.uid);
    } catch (error) {
      console.error("Upload error:", error);
      showToast(error.message || "Unable to upload PDF.", "error");
    } finally {
      setUploading(false);
    }
  };

  // ================= OPEN DOCUMENT =================

  const handleDocumentClick = (fileName) => {
    if (!fileName) {
      showToast("Document filename not found.", "error");
      return;
    }

    navigate(`/document?file=${encodeURIComponent(fileName)}`);
  };

  // ================= LOGOUT =================

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      showToast("Unable to log out. Please try again.", "error");
      setLoggingOut(false);
    }
  };

  // ================= USER DETAILS =================

  const displayName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "User";

  const recentDocuments = documents.slice(0, 5);

  if (authLoading) {
    return (
      <div className="dashboard-container">
        <main className="dashboard-main">
          <p>Loading your dashboard...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">
        <div>
          <div className="sidebar-logo">
            ⚖️ AI Legal
          </div>

          <nav className="sidebar-nav">
            <a
              href="/dashboard"
              className="active"
              onClick={(event) => {
                event.preventDefault();
                navigate("/dashboard");
              }}
            >
              🏠 Dashboard
            </a>

            <a
              href="/documents"
              onClick={(event) => {
                event.preventDefault();
                navigate("/documents");
              }}
            >
              📄 Documents
            </a>

            <a
              href="/history"
              onClick={(event) => {
                event.preventDefault();
                navigate("/history");
              }}
            >
              📚 History
            </a>

            <a
              href="/aichat"
              onClick={(event) => {
                event.preventDefault();
                navigate("/aichat");
              }}
            >
              🤖 AI Chat
            </a>

            <a
              href="/reports"
              onClick={(event) => {
                event.preventDefault();
                navigate("/reports");
              }}
            >
              📊 Reports
            </a>

            <a
              href="/profile"
              onClick={(event) => {
                event.preventDefault();
                navigate("/profile");
              }}
            >
              👤 Profile
            </a>

           <a
              href="/settings"
              onClick={(event) => {
              event.preventDefault();
              navigate("/settings");
              }}
          >
             ⚙️ Settings
          </a>
          </nav>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out..." : "🚪 Logout"}
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="dashboard-main">
        {/* WELCOME */}

        <div className="top-bar">
          <div>
            <h1>Welcome Back, {displayName} 👋</h1>
            <p>
              Ready to analyze your legal documents today?
            </p>
          </div>

          <div className="user-box">
            👤 {displayName}
          </div>
        </div>

        {/* UPLOAD SECTION */}

        <section
          className="upload-section"
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setDragging(false);
            }
          }}
          onDrop={handleDrop}
          style={
            dragging
              ? { outline: "2px dashed #4f46e5", outlineOffset: "4px" }
              : undefined
          }
        >
          <div className="upload-icon">📄</div>

          <h2>Upload Legal Document</h2>

          <p>
            Drag & drop your PDF file here or browse
            from your device.
          </p>

          <input
            type="file"
            id="pdf-upload"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <label htmlFor="pdf-upload" className="upload-btn">
            Browse Files
          </label>

          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
          >
            {uploading ? "Uploading..." : "Upload PDF"}
          </button>

          {selectedFile && (
            <div className="selected-file">
              <strong>📄 {selectedFile.name}</strong>
              <p>
                File size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
              >
                Remove
              </button>
            </div>
          )}
        </section>

        {/* STATISTICS */}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div>
              <h3>
                {documentsLoading ? "..." : documents.length}
              </h3>
              <p>Documents Uploaded</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div>
              <h3>
                {documentsLoading ? "..." : analyzedDocuments.length}
              </h3>
              <p>AI Summaries</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div>
              <h3>
                {documentsLoading ? "..." : riskReportCount}
              </h3>
              <p>Risk Reports</p>
              {!documentsLoading && (
                <small>{totalRisks} total identified risks</small>
              )}
            </div>
          </div>
        </section>

        {/* RECENT DOCUMENTS */}

        <section className="documents-section">
          <div className="section-header">
            <h2>📂 Recent Documents</h2>

            <a
              href="/history"
              onClick={(event) => {
                event.preventDefault();
                navigate("/history");
              }}
            >
              View All
            </a>
          </div>

          {documentsLoading ? (
            <div className="document-item">
              <p>Loading documents...</p>
            </div>
          ) : recentDocuments.length === 0 ? (
            <div className="document-item">
              <div>
                <strong>No documents uploaded</strong>
                <p>Upload a PDF to get started.</p>
              </div>
            </div>
          ) : (
            recentDocuments.map((doc) => {
              const analysis = getAnalysis(doc);
              const isAnalyzed = Boolean(
                analysis &&
                (analysis.summary ||
                  analysis.importantClauses ||
                  analysis.legalRisks)
              );

              return (
                <div
                  className="document-item"
                  key={doc._id || doc.filename}
                  onClick={() => handleDocumentClick(doc.filename)}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      handleDocumentClick(doc.filename);
                    }
                  }}
                >
                  <div>
                    <strong>
                      {doc.originalName || doc.filename || "Untitled PDF"}
                    </strong>
                    <p>
                      {doc.uploadedAt
                        ? `Uploaded ${new Date(doc.uploadedAt).toLocaleDateString()}`
                        : "Uploaded document"}
                    </p>
                  </div>

                  <span
                    className={`status ${isAnalyzed ? "completed" : ""}`}
                  >
                    {isAnalyzed ? "✔ Analyzed" : "Uploaded"}
                  </span>
                </div>
              );
            })
          )}
        </section>

        {/* AI ASSISTANT */}

        <section className="ai-section">
          <div className="section-header">
            <h2>🤖 AI Assistant</h2>

            <button
              className="ask-btn"
              onClick={() => navigate("/aichat")}
            >
              Ask
            </button>
          </div>

          <div className="ai-box">
            Ask me anything about your uploaded legal document...
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
