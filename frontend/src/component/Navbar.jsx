import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import "./Navbar.css"; // Import the CSS file

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        if (decodedToken.exp * 1000 < Date.now()) {
          handleLogout();
          alert("Session expired. Please log in again.");
        } else {
          setUser(decodedToken);
        }
      } catch (error) {
        console.error("Invalid Token", error);
        handleLogout();
        alert("Session expired due to token failure. Please log in again.");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="container-fluid navbar-content">
        <Link className="navbar-brand" to="/">CORONA</Link>

        <div className="navbar-links">
          {user?.role === "admin" ? (
            <>
              <NavLink className="nav-link" to="/dashboard">Dashboard</NavLink>
              <NavLink className="nav-link" to="/users">Users</NavLink>
              <NavLink className="nav-link" to="/map">Map</NavLink>
              <NavLink className="nav-link" to="/account">Account</NavLink>
              <NavLink className="nav-link" to="/incident">Incident</NavLink>
            </>
          ) : user ? (
            <>
              <NavLink className="nav-link" to="/account">Account</NavLink>
              <NavLink className="nav-link" to="/incident">Incident</NavLink>
              <NavLink className="nav-link" to="/sos">Sos</NavLink>
              <NavLink className="nav-link" to="/emergency">Emergency</NavLink>
            </>
          ) : null}
        </div>

        <div className="navbar-user">
          {user ? (
            <div className="dropdown">
              <button className="user-dropdown" data-bs-toggle="dropdown">
                <div className="user-icon">
                  <User size={20} />
                </div>
                <span className="username">{user.fullName || "User"}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <NavLink className="dropdown-item profile-item" to="/account/logindetail">
                    Profile
                  </NavLink>
                </li>
                <li>
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <NavLink className="nav-link login-btn" to="/">Login</NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
