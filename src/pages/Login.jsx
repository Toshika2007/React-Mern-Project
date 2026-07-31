import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../css/login.css";
import { Link } from "react-router-dom";


function Login() {

  const navigate = useNavigate();
  const googleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();

    await signInWithPopup(auth, provider);

    alert("Google Login Successful ✅");

    navigate("/dashboard");

  } catch (error) {
    console.log(error);
    alert(error.message);
  }
};

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="login-container">

      <div className="login-card">

        <div className="logo">
          ⚖️ AI Legal Document Simplifier
        </div>

        <h1>Welcome Back 👋</h1>

        <p>
          Continue to access AI-powered legal analysis.
        </p>

        <form onSubmit={handleLogin}>

  <label>Email</label>

  <input
    type="email"
    placeholder="Enter your email"
    required
  />

  <label>Password</label>

  <input
    type="password"
    placeholder="Enter your password"
    required
  />

  <div className="login-options">

    <label className="remember">
      <input type="checkbox" />
      Remember Me
    </label>

    <a href="#">Forgot Password?</a>

  </div>

  <button type="submit" className="login-btn">
    Login
  </button>

  <div className="divider">
    <span>OR</span>
  </div>

  <button
  type="button"
  className="google-btn"
  onClick={googleLogin}
>

    <img
      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
      alt="Google"
    />

    Continue with Google

  </button>

</form>

        <p className="register-link">
          Don't have an account?
          <Link to="/register"> Register</Link>
        </p>

      </div>

    </div>

  );
}

export default Login;