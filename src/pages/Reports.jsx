
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import "../css/reports.css";

function Reports() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId("");
        setLoading(false);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchReports = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/documents?userId=${encodeURIComponent(userId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch reports");
      }

      setDocuments(Array.isArray(data.documents) ? data.documents : []);
    } catch (err) {
      console.error("Reports error:", err);
      setError(err.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchReports();
    }
  }, [userId, fetchReports]);

  // Support both object and JSON-string analysis formats.
  const getAnalysis = (document) => {
    if (!document.analysis) return null;

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
  };

  const analyzedDocuments = documents.filter(
    (document) => getAnalysis(document) !== null
  );

  const allRisks = analyzedDocuments.flatMap((document) => {
    const analysis = getAnalysis(document);
    return Array.isArray(analysis?.legalRisks)
      ? analysis.legalRisks
      : [];
  });

  const highRisks = allRisks.filter(
    (risk) => risk.severity?.toLowerCase() === "high"
  ).length;

  const mediumRisks = allRisks.filter(
    (risk) => risk.severity?.toLowerCase() === "medium"
  ).length;

  const lowRisks = allRisks.filter(
    (risk) => risk.severity?.toLowerCase() === "low"
  ).length;

  const totalRisks = allRisks.length;

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-loading">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <h1>📊 Reports</h1>
        <p>
          Overview of your uploaded documents and AI-generated legal risk reports.
        </p>
      </div>

      {error && (
        <div className="no-reports">
          <h3>Unable to load reports</h3>
          <p>{error}</p>
          <button onClick={fetchReports}>Try Again</button>
        </div>
      )}

      {!error && (
        <>
          <div className="report-stats">
            <div className="report-card">
              <div className="report-icon">📄</div>
              <h2>{documents.length}</h2>
              <p>Total Documents</p>
            </div>

            <div className="report-card">
              <div className="report-icon">🤖</div>
              <h2>{analyzedDocuments.length}</h2>
              <p>Documents Analyzed</p>
            </div>

            <div className="report-card">
              <div className="report-icon">⚠️</div>
              <h2>{totalRisks}</h2>
              <p>Total Legal Risks</p>
            </div>

            <div className="report-card">
              <div className="report-icon">🔴</div>
              <h2>{highRisks}</h2>
              <p>High Risk Issues</p>
            </div>
          </div>

          <div className="risk-overview">
            <h2>⚠️ Risk Overview</h2>

            <div className="risk-grid">
              <div className="risk-box high">
                <span>High</span>
                <strong>{highRisks}</strong>
              </div>

              <div className="risk-box medium">
                <span>Medium</span>
                <strong>{mediumRisks}</strong>
              </div>

              <div className="risk-box low">
                <span>Low</span>
                <strong>{lowRisks}</strong>
              </div>
            </div>
          </div>

          <div className="document-reports">
            <h2>📋 Document Reports</h2>

            {analyzedDocuments.length === 0 ? (
              <div className="no-reports">
                <h3>No analysis reports available</h3>
                <p>
                  Upload and analyze a document to generate a report.
                </p>
                <button onClick={() => navigate("/dashboard")}>
                  Analyze Document
                </button>
              </div>
            ) : (
              analyzedDocuments.map((document) => {
                const analysis = getAnalysis(document);
                const risks = Array.isArray(analysis?.legalRisks)
                  ? analysis.legalRisks
                  : [];

                return (
                  <div
                    className="report-document"
                    key={document._id}
                  >
                    <div className="report-document-info">
                      <h3>📄 {document.originalName}</h3>

                      <p>
                        Uploaded:{" "}
                        {document.uploadedAt
                          ? new Date(document.uploadedAt).toLocaleDateString()
                          : "Unknown"}
                      </p>

                      <p>
                        Legal risks: {risks.length}
                        {" · "}
                        High:{" "}
                        {risks.filter(
                          (risk) =>
                            risk.severity?.toLowerCase() === "high"
                        ).length}
                      </p>

                      {analysis?.summary && (
                        <p>
                          <strong>Summary:</strong>{" "}
                          {analysis.summary.length > 180
                            ? `${analysis.summary.slice(0, 180)}...`
                            : analysis.summary}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          `/document?file=${encodeURIComponent(document.filename)}`
                        )
                      }
                    >
                      View Report
                    </button>
                  </div>
                );s
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
