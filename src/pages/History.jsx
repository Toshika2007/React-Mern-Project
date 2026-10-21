
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import "../css/history.css";

function History() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [userId, setUserId] = useState(null);

  const { toast, showToast, hideToast } = useToast();

  const fetchDocuments = useCallback(async (id) => {
    if (!id) return;

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/documents?userId=${encodeURIComponent(id)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load documents");
      }

      const fetchedDocuments = Array.isArray(data.documents)
        ? data.documents
        : [];

      setDocuments(fetchedDocuments);
    } catch (error) {
      console.error("History error:", error);
      showToast(error.message || "Failed to load history.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchDocuments(user.uid);
      } else {
        setUserId(null);
        setDocuments([]);
        setLoading(false);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [fetchDocuments, navigate]);

  const formatFileSize = (bytes) => {
    if (typeof bytes !== "number" || bytes <= 0) {
      return "Size unavailable";
    }

    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDateTime = (date) => {
    if (!date) {
      return { date: "Unknown date", time: "Unknown time" };
    }

    const uploadedDate = new Date(date);

    if (Number.isNaN(uploadedDate.getTime())) {
      return { date: "Unknown date", time: "Unknown time" };
    }

    return {
      date: uploadedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      time: uploadedDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  };

  const getStatus = (doc) => {
    if (doc.analysis) return "Analyzed";

    return doc.status || "Uploaded";
  };

  const filteredDocuments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return documents.filter((doc) => {
      const name = (doc.originalName || "").toLowerCase();
      const matchesSearch = name.includes(query);

      const status = getStatus(doc).toLowerCase();
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Analyzed" && status === "analyzed") ||
        (statusFilter === "Uploaded" && status !== "analyzed");

      return matchesSearch && matchesStatus;
    });
  }, [documents, searchTerm, statusFilter]);

  const analyzedCount = documents.filter(
    (doc) => Boolean(doc.analysis)
  ).length;

  const openDocument = (filename) => {
    if (!filename) {
      showToast("Document filename not found.", "error");
      return;
    }

    navigate(`/document?file=${encodeURIComponent(filename)}`);
  };

  const refreshHistory = () => {
    if (userId) {
      fetchDocuments(userId);
    }
  };

  return (
    <div className="history-page">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <div className="history-header">
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <div className="history-title-section">
          <h1>📚 Upload History</h1>
          <p>Track, search and revisit your uploaded legal documents.</p>
        </div>

        <div className="history-count">
          <span>{documents.length}</span>
          <small>
            {documents.length === 1 ? "Document" : "Documents"}
          </small>
        </div>
      </div>

      <div className="history-summary">
        <div className="history-summary-card">
          <span>Total Documents</span>
          <strong>{documents.length}</strong>
        </div>

        <div className="history-summary-card">
          <span>Analyzed</span>
          <strong>{analyzedCount}</strong>
        </div>

        <div className="history-summary-card">
          <span>Awaiting Analysis</span>
          <strong>{documents.length - analyzedCount}</strong>
        </div>
      </div>

      <div className="history-toolbar">
        <input
          type="search"
          className="history-search"
          placeholder="Search documents by filename..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Search documents"
        />

        <select
          className="history-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter documents by status"
        >
          <option value="All">All Documents</option>
          <option value="Analyzed">Analyzed</option>
          <option value="Uploaded">Not Analyzed</option>
        </select>

        <button
          className="history-refresh-btn"
          onClick={refreshHistory}
          disabled={loading || !userId}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      <div className="history-container">
        {loading ? (
          <div className="history-empty">
            <div className="history-loading-icon">🔄</div>
            <h2>Loading your documents...</h2>
            <p>Please wait while we fetch your upload history.</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="history-empty">
            <div className="empty-icon">📂</div>
            <h2>No Upload History</h2>
            <p>Your uploaded legal documents will appear here.</p>

            <button
              className="upload-history-btn"
              onClick={() => navigate("/dashboard")}
            >
              Upload Document
            </button>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="history-empty">
            <div className="empty-icon">🔎</div>
            <h2>No Matching Documents</h2>
            <p>Try another filename or change the status filter.</p>

            <button
              className="upload-history-btn"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="history-list">
            {filteredDocuments.map((doc) => {
              const dateTime = formatDateTime(doc.uploadedAt);
              const analyzed = Boolean(doc.analysis);

              return (
                <div className="history-card" key={doc._id}>
                  <div className="history-file-icon">📄</div>

                  <div className="history-file-info">
                    <h3 title={doc.originalName}>
                      {doc.originalName || "Untitled document"}
                    </h3>

                    <div className="history-meta">
                      <span>📅 {dateTime.date}</span>
                      <span>🕐 {dateTime.time}</span>
                      <span>💾 {formatFileSize(doc.fileSize)}</span>
                    </div>

                    <span
                      className={`history-status ${
                        analyzed ? "analyzed" : "uploaded"
                      }`}
                    >
                      {analyzed ? "✓ Analyzed" : "○ Uploaded"}
                    </span>
                  </div>

                  <div className="history-actions">
                    <button
                      className="view-history-btn"
                      onClick={() => openDocument(doc.filename)}
                    >
                      {analyzed ? "View Report" : "View Document"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
