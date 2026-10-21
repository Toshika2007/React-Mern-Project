import { useState } from "react";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "../css/login.css";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";

function Login() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ================= GOOGLE LOGIN =================
  const googleLogin = async () => {
    try {
      setGoogleLoading(true);

      const provider = new GoogleAuthProvider();

      await signInWithPopup(auth, provider);

      showToast("Google Login Successful!", "success");

      navigate("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);

      showToast(error.message, "error");
    } finally {
      setGoogleLoading(false);
    }
  };

  // ================= EMAIL + PASSWORD LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast("Please enter your email.", "error");
      return;
    }

    if (!password.trim()) {
      showToast("Please enter your password.", "error");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      showToast("Login Successful!", "success");

      navigate("/dashboard");
    } catch (error) {
      console.error("Email login error:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/invalid-login-credentials"
      ) {
        showToast("Invalid email or password ❌", "error");
      } else if (error.code === "auth/user-not-found") {
        showToast("No account found with this email ❌", "error");
      } else if (error.code === "auth/wrong-password") {
        showToast("Incorrect password ❌", "error");
      } else if (error.code === "auth/too-many-requests") {
        showToast("Too many failed attempts. Please try again later.", "error");
      } else {
        showToast(error.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      <div className="login-card">

        {/* Logo */}
        <div className="logo">
          ⚖️ AI Legal Document Simplifier
        </div>

        {/* Heading */}
        <h1>Welcome Back 👋</h1>

        <p>
          Continue to access AI-powered legal analysis.
        </p>


        {/* Login Form */}
        <form onSubmit={handleLogin}>

          {/* Email */}
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />


          {/* Password */}
          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />


          {/* Login Options */}
          <div className="login-options">

            <label className="remember">

              <input
                type="checkbox"
                disabled={loading}
              />

              Remember Me

            </label>

            <a
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Forgot Password?
            </a>

          </div>


          {/* Login Button */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>


          {/* Divider */}
          <div className="divider">
            <span>OR</span>
          </div>


          {/* Google Login */}
          <button
            type="button"
            className="google-btn"
            onClick={googleLogin}
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


        {/* Register */}
        <p className="register-link">

          Don't have an account?

          <Link to="/register">
            {" "}Register
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;