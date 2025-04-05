import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // To control hamburger menu
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          alert("Session expired. Please log in again.");
          handleLogout();
        } else {
          setUser(decodedToken);
        }
      } catch (error) {
        console.error("Invalid Token", error);
        alert("Session expired due to token failure. Please log in again.");
        handleLogout();
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fcmToken");
    setUser(null);
    navigate("/");
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="container-fluid navbar-content">
        <Link className="navbar-brand" to="/">Virus Rovers</Link>

        {/* Mobile Menu Toggle */}
        <div className="hamburger-menu" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="hamburger-bar"></div>
          <div className="hamburger-bar"></div>
          <div className="hamburger-bar"></div>
        </div>

        {/* Regular Navbar Links */}
        <div className={`navbar-links ${menuOpen ? "show" : ""}`}>
          {user?.role === "admin" ? (
            <>
              <NavLink className="nav-link" to="/account">Profile</NavLink>
              <NavLink className="nav-link" to="/dashboard">Dashboard</NavLink>
              <NavLink className="nav-link" to="/users">Users</NavLink>
              <NavLink className="nav-link" to="/map">Map</NavLink>
              <NavLink className="nav-link" to="/incidents">Incidents</NavLink>
              <NavLink className="nav-link" to="/news">News</NavLink>
              <NavLink className="nav-link" to="/adminpost">Posts</NavLink>
            </>
          ) : user ? (
            <>
              <NavLink className="nav-link" to="/account">Account</NavLink>
              <NavLink className="nav-link" to="/sos">SOS</NavLink>
              <NavLink className="nav-link" to="/incident">Incident</NavLink>
              <NavLink className="nav-link" to="/emergency">Emergency</NavLink>
              <NavLink className="nav-link" to="/news">News</NavLink>
              <NavLink className="nav-link" to="/post">Community</NavLink>
            </>
          ) : null}
        </div>

        {/* User Dropdown */}
        <div className="navbar-user" ref={dropdownRef}>
          {user ? (
            <div className="user-dropdown-container">
              <button className="user-dropdown" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="user-icon">
                  <User size={20} />
                </div>
                <span className="username">{user.fullName || "User"}</span>
              </button>

              {dropdownOpen && (
                <ul className="dropdown-menu dropdown-menu-end show">
                  <li>
                    <NavLink className="logOut profile-item" to="/account/logindetail">
                      Profile
                    </NavLink>
                  </li>
                  <li>
                    <button className="logOut logout-btn" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <NavLink className="nav-link login-btn" to="/">Login</NavLink>
          )}
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="dropdown-menu-mobile">
            {user?.role === "admin" ? (
              <>
                <NavLink className="nav-link" to="/account">Profile</NavLink>
                <NavLink className="nav-link" to="/dashboard">Dashboard</NavLink>
                <NavLink className="nav-link" to="/users">Users</NavLink>
                <NavLink className="nav-link" to="/map">Map</NavLink>
                <NavLink className="nav-link" to="/incidents">Incidents</NavLink>
                <NavLink className="nav-link" to="/news">News</NavLink>
                <NavLink className="nav-link" to="/adminpost">Posts</NavLink>
                <button className="logOut" onClick={handleLogout}>Logout</button>
              </>
            ) : user ? (
              <>
                <NavLink className="nav-link" to="/account">Profile</NavLink>
                <NavLink className="nav-link" to="/incident">Incident</NavLink>
                <NavLink className="nav-link" to="/sos">SOS</NavLink>
                <NavLink className="nav-link" to="/emergency">Emergency</NavLink>
                <NavLink className="nav-link" to="/news">News</NavLink>
                <NavLink className="nav-link" to="/post">Community</NavLink>
                <button className="logOut" onClick={handleLogout}>Logout</button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;