import "../css/hero.css";
import { useNavigate } from "react-router-dom";
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="hero">
      <div className="hero-left">
        <div className="badge">
          ✨ AI Powered Legal Assistant
        </div>

        <h1>
          Simplify Complex Legal Documents
          <span> in Seconds</span>
        </h1>

        <p>
          Upload contracts, agreements, policies, or any legal document.
          Our AI instantly summarizes legal language, explains difficult
          clauses, and highlights important risks in simple English.
        </p>

        <div className="hero-buttons">

          <button
            className="primary-btn"
            onClick={() => navigate("/login")}
         >
          🚀 Get Started
         </button>

          <button className="secondary-btn">
            ▶ Watch Demo
          </button>

        </div>

        <div className="rating">

          ⭐⭐⭐⭐⭐

          <p>
            Trusted by Students, Lawyers & Professionals
          </p>

        </div>

      </div>

      <div className="hero-right">

        <div className="dashboard-card">

          <div className="dashboard-header">
            📄 Employment_Contract.pdf
          </div>

          <div className="dashboard-body">

            <div className="status">
              ✅ AI Summary Ready
            </div>

            <div className="risk-section">

              <h4>Risk Score</h4>

              <div className="progress-bar">

                <div className="progress"></div>

              </div>

              <span>80% Medium Risk</span>

            </div>

            <div className="clauses">

              <h4>Important Clauses</h4>

              <ul>
                <li>✔ Salary</li>
                <li>✔ Notice Period</li>
                <li>✔ Confidentiality</li>
                <li>✔ Termination</li>
              </ul>

            </div>

            <button className="summary-btn">
              View Summary
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;