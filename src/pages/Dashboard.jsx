import "../css/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          ⚖️ AI Legal
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="active">🏠 Dashboard</a>
          <a href="#">📄 Documents</a>
          <a href="#">🤖 AI Chat</a>
          <a href="#">📊 Reports</a>
          <a href="#">👤 Profile</a>
          <a href="#">⚙️ Settings</a>
        </nav>

        <button className="logout-btn">🚪 Logout</button>

      </aside>

      {/* Main Content */}
      <main className="dashboard-main">

        {/* Top Welcome */}
        <div className="top-bar">

          <div>
            <h1>Welcome Back, Toshika 👋</h1>
            <p>Ready to analyze your legal documents today?</p>
          </div>

          <div className="user-box">
            👤 Toshika
          </div>

        </div>

        {/* Upload Section */}
        <section className="upload-section">

          <div className="upload-icon">📄</div>

          <h2>Upload Legal Document</h2>

          <p>Drag & drop your PDF file here or browse from your device.</p>

          <button className="upload-btn">Browse Files</button>

        </section>

        {/* Stats */}
        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">📄</div>

            <div>
              <h3>15</h3>
              <p>Documents Uploaded</p>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">🤖</div>

            <div>
              <h3>15</h3>
              <p>AI Summaries</p>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">⚠️</div>

            <div>
              <h3>10</h3>
              <p>Risk Reports</p>
            </div>

          </div>

        </section>

        {/* Recent Documents */}
        <section className="documents-section">

          <div className="section-header">

            <h2>📂 Recent Documents</h2>

            <a href="#">View All</a>

          </div>

          <div className="document-item">

            <div>
              <strong>Employment_Contract.pdf</strong>
              <p>Analyzed Today</p>
            </div>

            <span className="status completed">✔ Completed</span>

          </div>

          <div className="document-item">

            <div>
              <strong>Rental_Agreement.pdf</strong>
              <p>Analyzed Yesterday</p>
            </div>

            <span className="status completed">✔ Completed</span>

          </div>

          <div className="document-item">

            <div>
              <strong>Offer_Letter.pdf</strong>
              <p>Upload Pending</p>
            </div>

            <span className="status pending">⏳ Pending</span>

          </div>

        </section>

        {/* AI Assistant */}
        <section className="ai-section">

          <div className="section-header">

            <h2>🤖 AI Assistant</h2>

            <button className="ask-btn">Ask</button>

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