import "../css/features.css";

function Features() {
  return (
    <section className="features" id="features">

      <h2>Our Features</h2>

      <p className="feature-subtitle">
        Powerful AI tools to simplify legal documents and help
        users understand contracts with confidence.
      </p>

      <div className="feature-container">

        <div className="feature-card">
          <div className="icon">📄</div>
          <h3>Upload Legal Documents</h3>
          <p>
            Upload contracts, agreements, and policies securely
            for AI analysis.
          </p>
        </div>

        <div className="feature-card">
          <div className="icon">🤖</div>
          <h3>AI Summary</h3>
          <p>
            Instantly convert lengthy legal documents into
            short, easy-to-understand summaries.
          </p>
        </div>

        <div className="feature-card">
          <div className="icon">⚠️</div>
          <h3>Risk Detection</h3>
          <p>
            Identify risky clauses, penalties, and important
            legal conditions automatically.
          </p>
        </div>

        <div className="feature-card">
          <div className="icon">💬</div>
          <h3>AI Chat Assistant</h3>
          <p>
            Ask questions about your uploaded document and
            receive instant AI-powered answers.
          </p>
        </div>

      </div>

    </section>
  );
}

export default Features;