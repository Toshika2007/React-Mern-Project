
import { useSearchParams, useNavigate } from "react-router-dom";
import { Document as PDFDocument, Page, pdfjs } from "react-pdf";
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import "../css/document.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const API_URL = "http://localhost:5000";

function Document() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileName = searchParams.get("file");

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const { toast, showToast, hideToast } = useToast();

  // Verify Firebase authentication.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (!currentUser) {
        navigate("/login", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load previously saved analysis from MongoDB.
  const loadSavedAnalysis = useCallback(async (currentUser) => {
    if (!fileName || !currentUser) return;

    setLoadingSaved(true);

    try {
      const response = await fetch(
        `${API_URL}/documents?userId=${encodeURIComponent(currentUser.uid)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load saved documents.");
      }

      const documents = Array.isArray(data.documents)
        ? data.documents
        : [];

      const savedDocument = documents.find(
        (document) => document.filename === fileName
      );

      if (!savedDocument) {
        showToast("This document was not found in your account.", "error");
        return;
      }

      const savedAnalysis = savedDocument.analysis;

      if (savedAnalysis) {
        const parsed =
          typeof savedAnalysis === "string"
            ? JSON.parse(savedAnalysis)
            : savedAnalysis;

        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setAiAnalysis(parsed);
        }
      }
    } catch (error) {
      console.error("Saved analysis loading error:", error);
      showToast(error.message || "Unable to load saved analysis.", "error");
    } finally {
      setLoadingSaved(false);
    }
  }, [fileName, showToast]);

  useEffect(() => {
    if (user && fileName) {
      loadSavedAnalysis(user);
    }
  }, [user, fileName, loadSavedAnalysis]);

  const handleAnalyze = async () => {
    if (!fileName) {
      showToast("No document selected.", "error");
      return;
    }

    if (!auth.currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setAnalyzing(true);
      setAiAnalysis(null);
      setExtractedText("");

      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filename: fileName,
          userId: auth.currentUser.uid
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Analysis failed.");
      }

      setExtractedText(data.extractedText || "");

      const parsedAnalysis =
        typeof data.analysis === "string"
          ? JSON.parse(data.analysis)
          : data.analysis;

      if (
        !parsedAnalysis ||
        typeof parsedAnalysis !== "object" ||
        Array.isArray(parsedAnalysis)
      ) {
        throw new Error("The AI returned an invalid analysis.");
      }

      setAiAnalysis(parsedAnalysis);
      showToast("Document analyzed and saved successfully!", "success");
    } catch (error) {
      console.error("Analysis error:", error);
      showToast(error.message || "Unable to analyze the document.", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const pdfUrl = fileName
    ? `${API_URL}/uploads/${encodeURIComponent(fileName)}`
    : null;

  const importantClauses = Array.isArray(aiAnalysis?.importantClauses)
    ? aiAnalysis.importantClauses
    : [];

  const legalRisks = Array.isArray(aiAnalysis?.legalRisks)
    ? aiAnalysis.legalRisks
    : [];

  if (authLoading || (user && loadingSaved)) {
    return (
      <main className="document-page">
        <p>Loading your document...</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <div className="document-page">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <div className="document-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>

        <h1>📄 Legal Document Analysis</h1>
        <p>Review and analyze your uploaded legal document.</p>
      </div>

      {fileName ? (
        <div className="document-card">
          <div className="file-info">
            <div className="file-icon">📄</div>
            <div>
              <h2>{fileName}</h2>
              <span className="uploaded-status">
                ✓ Uploaded Successfully
              </span>
            </div>
          </div>

          <div className="pdf-viewer-section">
            <div className="pdf-toolbar">
              <div className="page-controls">
                <button
                  onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                  disabled={pageNumber <= 1}
                >
                  ← Previous
                </button>

                <span>Page {pageNumber} of {numPages || "..."}</span>

                <button
                  onClick={() =>
                    setPageNumber((prev) => Math.min(prev + 1, numPages || prev))
                  }
                  disabled={!numPages || pageNumber >= numPages}
                >
                  Next →
                </button>
              </div>

              <div className="zoom-controls">
                <button
                  onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.7))}
                  disabled={scale <= 0.7}
                  aria-label="Zoom out"
                >
                  −
                </button>

                <span>{Math.round(scale * 100)}%</span>

                <button
                  onClick={() => setScale((prev) => Math.min(prev + 0.1, 2))}
                  disabled={scale >= 2}
                  aria-label="Zoom in"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pdf-viewer">
              <PDFDocument
                file={pdfUrl}
                onLoadSuccess={({ numPages: totalPages }) => {
                  setNumPages(totalPages);
                  setPageNumber(1);
                }}
                onLoadError={(error) => {
                  console.error("PDF loading error:", error);
                  showToast(
                    "Unable to load the PDF. Check the file and backend server.",
                    "error"
                  );
                }}
                loading={<p>Loading PDF...</p>}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </PDFDocument>
            </div>
          </div>

          <div className="analysis-section">
            <h2>🤖 AI Analysis</h2>
            <p>
              Generate a simplified summary, identify important clauses,
              and highlight potential legal risks.
            </p>

            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={analyzing || loadingSaved}
            >
              {analyzing ? "🔄 Analyzing..." : "🤖 Analyze Document"}
            </button>

            {analyzing && (
              <p className="analysis-loading">
                Please wait while AI reviews your document...
              </p>
            )}

            {aiAnalysis && (
              <div className="ai-result">
                <h3>🤖 AI Analysis Result</h3>

                <div className="analysis-card summary-card">
                  <h4>📋 Summary</h4>
                  <p>{aiAnalysis.summary || "No summary was returned."}</p>
                </div>

                <div className="analysis-card">
                  <h4>📌 Important Clauses</h4>

                  {importantClauses.length ? (
                    importantClauses.map((clause, index) => (
                      <div className="clause-item" key={index}>
                        <h5>{clause.title || `Clause ${index + 1}`}</h5>
                        <p>{clause.explanation || "No explanation available."}</p>
                      </div>
                    ))
                  ) : (
                    <p className="empty-message">
                      No important legal clauses were returned for this document.
                    </p>
                  )}
                </div>

                <div className="analysis-card">
                  <h4>⚠️ Legal Risks</h4>

                  {legalRisks.length ? (
                    legalRisks.map((risk, index) => {
                      const severity = (
                        risk.severity || "Low"
                      ).toLowerCase();

                      return (
                        <div className="risk-item" key={index}>
                          <div className="risk-header">
                            <h5>{risk.risk || `Potential Risk ${index + 1}`}</h5>
                            <span className={`severity ${severity}`}>
                              {risk.severity || "Low"}
                            </span>
                          </div>
                          <p>{risk.explanation || "No explanation available."}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="empty-message">
                      No significant legal risks were returned by the AI.
                      This does not guarantee the document is free of risks.
                    </p>
                  )}
                </div>

                <div className="analysis-disclaimer">
                  <h4>⚖️ Disclaimer</h4>
                  <p>
                    {aiAnalysis.disclaimer ||
                      "This AI-generated explanation is for informational purposes only and is not professional legal advice."}
                  </p>
                </div>
              </div>
            )}

            {extractedText && (
              <div className="extracted-text">
                <h3>📄 Extracted Document Text</h3>
                <div className="text-content">{extractedText}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="no-document">
          <h2>No document selected</h2>
          <p>Select a document from your Documents page to view and analyze it.</p>
          <button className="back-btn" onClick={() => navigate("/documents")}>
            Go to Documents
          </button>
        </div>
      )}
    </div>
  );
}

export default Document;
