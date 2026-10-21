
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import "../css/settings.css";

function Settings() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(
    document.documentElement.dataset.theme === "dark"
  );
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [analysisNotifications, setAnalysisNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login", { replace: true });
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Apply theme to the page.
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  const handleSave = () => {
    try {
      setSaving(true);

      // Store preferences in this browser.
      localStorage.setItem("legalSettings", JSON.stringify({
        darkMode,
        emailNotifications,
        analysisNotifications,
      }));

      showToast("Settings saved successfully!", "success");
    } catch (error) {
      console.error("Settings save error:", error);
      showToast("Unable to save settings in this browser.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Restore saved browser preferences.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("legalSettings");

      if (saved) {
        const preferences = JSON.parse(saved);

        setDarkMode(Boolean(preferences.darkMode));
        setEmailNotifications(
          preferences.emailNotifications ?? true
        );
        setAnalysisNotifications(
          preferences.analysisNotifications ?? true
        );
      }
    } catch (error) {
      console.error("Unable to restore settings:", error);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      showToast("Unable to log out. Please try again.", "error");
    }
  };

  if (loading) {
    return (
      <main className="settings-page">
        <p>Loading settings...</p>
      </main>
    );
  }

  if (!user) return null;

  const displayName =
    user.displayName || user.email?.split("@")[0] || "User";

  return (
    <main className="settings-page">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <header className="settings-header">
        <div>
          <p className="settings-eyebrow">PREFERENCES</p>
          <h1>Settings</h1>
          <p>Manage your account and application preferences.</p>
        </div>

        <button
          className="settings-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      {/* ACCOUNT */}

      <section className="settings-card">
        <div className="settings-card-heading">
          <span className="settings-icon">👤</span>
          <div>
            <h2>Account Information</h2>
            <p>Your current signed-in account details.</p>
          </div>
        </div>

        <div className="settings-field">
          <label>Display Name</label>
          <div className="settings-value">{displayName}</div>
        </div>

        <div className="settings-field">
          <label>Email Address</label>
          <div className="settings-value">
            {user.email || "No email available"}
          </div>
        </div>

        <div className="settings-field">
          <label>Authentication Provider</label>
          <div className="settings-value">
            {user.providerData?.[0]?.providerId || "Firebase"}
          </div>
        </div>
      </section>

      {/* APPEARANCE */}

      <section className="settings-card">
        <div className="settings-card-heading">
          <span className="settings-icon">🎨</span>
          <div>
            <h2>Appearance</h2>
            <p>Choose how the application looks on this browser.</p>
          </div>
        </div>

        <div className="settings-option">
          <div>
            <strong>Dark Mode</strong>
            <p>Use a dark theme for supported application elements.</p>
          </div>

          <label className="settings-switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(event) => setDarkMode(event.target.checked)}
            />
            <span className="settings-slider" />
          </label>
        </div>
      </section>

      {/* NOTIFICATIONS */}

      <section className="settings-card">
        <div className="settings-card-heading">
          <span className="settings-icon">🔔</span>
          <div>
            <h2>Notifications</h2>
            <p>Manage your notification preferences.</p>
          </div>
        </div>

        <div className="settings-option">
          <div>
            <strong>Email Notifications</strong>
            <p>Preference for receiving email updates.</p>
          </div>

          <label className="settings-switch">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(event) =>
                setEmailNotifications(event.target.checked)
              }
            />
            <span className="settings-slider" />
          </label>
        </div>

        <div className="settings-option">
          <div>
            <strong>Document Analysis Notifications</strong>
            <p>Preference for updates about document analysis.</p>
          </div>

          <label className="settings-switch">
            <input
              type="checkbox"
              checked={analysisNotifications}
              onChange={(event) =>
                setAnalysisNotifications(event.target.checked)
              }
            />
            <span className="settings-slider" />
          </label>
        </div>

        <p className="settings-note">
          These notification switches currently save preferences only.
          Email or push notifications are not sent by this page.
        </p>
      </section>

      {/* SECURITY */}

      <section className="settings-card">
        <div className="settings-card-heading">
          <span className="settings-icon">🔐</span>
          <div>
            <h2>Security</h2>
            <p>Manage your current session.</p>
          </div>
        </div>

        <div className="settings-option">
          <div>
            <strong>Sign Out</strong>
            <p>Sign out of your current account on this application.</p>
          </div>

          <button
            className="settings-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </section>

      {/* SAVE */}

      <div className="settings-actions">
        <button
          className="settings-save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </main>
  );
}

export default Settings;
