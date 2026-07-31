import "../css/login.css";
import { Link, useNavigate } from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    alert("Registration Successful ✅");

    navigate("/login");
  };

  return (
    <div className="login-container">

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
            required
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Create password"
            required
          />

          <label>Confirm Password</label>

          <input
            type="password"
            placeholder="Confirm password"
            required
          />

          <button
            type="submit"
            className="login-btn"
          >
            Register
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="google-btn"
          >

            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
            />

            Continue with Google

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