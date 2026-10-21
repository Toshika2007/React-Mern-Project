import { useState } from "react";
import "../css/login.css";
import { Link, useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../firebase";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";

function Register() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Email + Password Registration
  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      // Save user's name in Firebase
      await updateProfile(userCredential.user, {
        displayName: name.trim(),
      });

      showToast("Registration Successful!", "success");

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);

      if (error.code === "auth/email-already-in-use") {
        showToast("This email is already registered ❌", "error");
      } else if (error.code === "auth/invalid-email") {
        showToast("Invalid email address ❌", "error");
      } else if (error.code === "auth/weak-password") {
        showToast("Password is too weak ❌", "error");
      } else {
        showToast(error.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Registration/Login
  const googleRegister = async () => {
    try {
      setGoogleLoading(true);

      const provider = new GoogleAuthProvider();

      await signInWithPopup(auth, provider);

      showToast("Google Registration Successful!", "success");

      navigate("/dashboard");
    } catch (error) {
      console.error("Google registration error:", error);
      showToast(error.message, "error");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-container">
      {toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={hideToast}
  />
)}
      <div className="login-card">

        <div className="logo">
          ⚖️ AI Legal Document Simplifier
        </div>

        <h1>Create Account 🚀</h1>

        <p>
          Register to start simplifying legal documents.
        </p>

        <form onSubmit={handleRegister}>

          <label>Full Name</label>

          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <label>Confirm Password</label>

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={googleRegister}
            disabled={googleLoading}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
            />

            {googleLoading
              ? "Signing in..."
              : "Continue with Google"}
          </button>

        </form>

        <p className="register-link">
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;