import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import "../css/profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h2>Login Required</h2>
          <p>Please login to view your profile.</p>

          <button
            className="profile-action-btn"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* Header */}
      <div className="profile-header">

        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <h1>👤 My Profile</h1>

        <p>
          View your account information.
        </p>

      </div>


      {/* Profile Card */}
      <div className="profile-card">

        {/* Profile Picture */}
        <div className="profile-avatar">

          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
            />
          ) : (
            <span>
              👤
            </span>
          )}

        </div>


        {/* User Name */}
        <h2>
          {user.displayName || "User"}
        </h2>

        <p className="profile-role">
          AI Legal Document Simplifier User
        </p>


        {/* User Details */}
        <div className="profile-details">

          <div className="profile-detail">
            <div>
              <span>👤</span>
              <label>Name</label>
            </div>

            <strong>
              {user.displayName || "Not provided"}
            </strong>
          </div>


          <div className="profile-detail">
            <div>
              <span>📧</span>
              <label>Email</label>
            </div>

            <strong>
              {user.email}
            </strong>
          </div>


          <div className="profile-detail">
            <div>
              <span>🔐</span>
              <label>Login Provider</label>
            </div>

            <strong>
              {user.providerData?.[0]?.providerId ===
              "google.com"
                ? "Google"
                : "Email & Password"}
            </strong>
          </div>


          <div className="profile-detail">
            <div>
              <span>🆔</span>
              <label>Account ID</label>
            </div>

            <strong className="user-id">
              {user.uid}
            </strong>
          </div>


          <div className="profile-detail">
            <div>
              <span>📅</span>
              <label>Account Created</label>
            </div>

            <strong>
              {user.metadata?.creationTime
                ? new Date(
                    user.metadata.creationTime
                  ).toLocaleDateString()
                : "Not available"}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;