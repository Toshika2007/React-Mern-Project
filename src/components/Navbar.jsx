import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/navbar.css";

function Navbar() {

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">

      <div className="logo">
        ⚖️ AI Legal Document Simplifier
      </div>

      <ul className="nav-links">

        <Link to="/">Home</Link>  

        {!user && (
          <>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}

        {user && (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            {/* <li><Link to="/profile">Profile</Link></li> */}
            <li>
              <button
                className="logout-nav-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </>
        )}

      </ul>

      {!user && (
        <button
          className="start-btn"
          onClick={() => navigate("/login")}
        >
          Get Started
        </button>
      )}

    </nav>
  );
}

export default Navbar;