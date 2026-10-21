
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import "../css/Documents.css";

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

function isAnalyzed(document) {
  const analysis = getAnalysis(document);

  return Boolean(
    analysis &&
      (analysis.summary ||
        analysis.importantClauses ||
        analysis.legalRisks)
  );
}

function Documents() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchDocuments = useCallback(async (userId) => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/documents?userId=${encodeURIComponent(userId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch documents.");
      }

      setDocuments(Array.isArray(data.documents) ? data.documents : []);
    } catch (error) {
      console.error("Documents fetch error:", error);
      showToast(error.message || "Unable to load documents.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchDocuments(currentUser.uid);
      } else {
        setUser(null);
        setDocuments([]);
        setLoading(false);
        navigate("/login", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate, fetchDocuments]);

  const analyzedCount = documents.filter(isAnalyzed).length;
  const uploadedCount = documents.length - analyzedCount;

  const filteredDocuments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return documents.filter((document) => {
      const name = (
        document.originalName ||
        document.filename ||
        ""
      ).toLowerCase();

      const matchesSearch = name.includes(term);
      const analyzed = isAnalyzed(document);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "analyzed" && analyzed) ||
        (statusFilter === "uploaded" && !analyzed);

      return matchesSearch && matchesStatus;
    });
  }, [documents, searchTerm, statusFilter]);

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

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const openDocument = (filename) => {
    if (!filename) {
      showToast("Document filename not found.", "error");
      return;
    }

    navigate(`/document?file=${encodeURIComponent(filename)}`);
  };

  if (!user && loading) {
    return (
      <main className="documents-page">
        <div className="empty-documents">
          <h2>Loading your documents...</h2>
        </div>
      </main>
    );
  }

  return (
    <div className="documents-page">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <div className="documents-header">
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <div className="documents-title">
          <div>
            <h1>📄 My Documents</h1>
            <p>Manage and analyze your uploaded legal documents.</p>
          </div>

          <div className="documents-count">
            <strong>{documents.length}</strong>
            <span>{documents.length === 1 ? "Document" : "Documents"}</span>
          </div>
        </div>
      </div>

      <div className="documents-container">
        <section className="documents-overview">
          <div className="documents-overview-card">
            <span>Total Documents</span>
            <strong>{documents.length}</strong>
          </div>

          <div className="documents-overview-card">
            <span>Analyzed</span>
            <strong>{analyzedCount}</strong>
          </div>

          <div className="documents-overview-card">
            <span>Awaiting Analysis</span>
            <strong>{uploadedCount}</strong>
          </div>
        </section>

        <div className="documents-toolbar">
          <input
            type="search"
            className="documents-search"
            placeholder="Search by document name..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search documents"
          />

          <select
            className="documents-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter documents by status"
          >
            <option value="all">All Documents</option>
            <option value="analyzed">Analyzed</option>
            <option value="uploaded">Awaiting Analysis</option>
          </select>

          <button
            className="documents-refresh"
            onClick={() => user && fetchDocuments(user.uid)}
            disabled={loading || !user}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="empty-documents">
            <div className="documents-loading-icon">🔄</div>
            <h2>Loading Documents...</h2>
            <p>Fetching your documents.</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-documents">
            <div className="documents-empty-icon">📂</div>
            <h2>No Documents Yet</h2>
            <p>You haven't uploaded any legal documents yet.</p>

            <button onClick={() => navigate("/dashboard")}>
              Upload Document
            </button>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="empty-documents">
            <div className="documents-empty-icon">🔎</div>
            <h2>No Matching Documents</h2>
            <p>Try a different search term or status filter.</p>

            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="documents-list">
            {filteredDocuments.map((document) => {
              const analyzed = isAnalyzed(document);

              return (
                <div
                  className="document-card"
                  key={document._id || document.filename}
                >
                  <div className="document-icon">📄</div>

                  <div className="document-info">
                    <h3
                      title={document.originalName || document.filename}
                    >
                      {document.originalName ||
                        document.filename ||
                        "Untitled PDF"}
                    </h3>

                    <div className="document-meta">
                      <span>📅 {formatDate(document.uploadedAt)}</span>
                      <span>💾 {formatFileSize(document.fileSize)}</span>
                    </div>

                    <span
                      className={`document-status ${
                        analyzed ? "analyzed" : "uploaded"
                      }`}
                    >
                      {analyzed ? "✓ Analyzed" : "◷ Awaiting Analysis"}
                    </span>
                  </div>

                  <button
                    className="analyze-document-btn"
                    onClick={() => openDocument(document.filename)}
                  >
                    View & Analyze
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Documents;
