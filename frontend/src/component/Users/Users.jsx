import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import "./Users.css"; 

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSearchCard, setShowSearchCard] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  // Show search card when search term exists
  useEffect(() => {
    setShowSearchCard(searchTerm.length > 0);
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      setLoading(false);
    }
  };

  const deleteUser = async (id, role) => {
    if (role === "admin") {
      alert("❌ Admins cannot be removed!");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete user");

      setUsers(users.filter((user) => user._id !== id)); 
    } catch (error) {
      console.error("❌ Error deleting user:", error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile.includes(searchTerm)
  );

  const SearchResultCard = () => {
    if (!showSearchCard) return null;

    const totalResults = filteredUsers.length;
    const adminCount = filteredUsers.filter(user => user.role === "admin").length;
    const userCount = filteredUsers.filter(user => user.role === "user").length;

    return (
      <div className="search-result-card">
        <div className="search-summary">
          <h3>Search Results</h3>
          <p>Found {totalResults} matches</p>
        </div>
        <div className="search-stats">
          <div className="stat-item">
            <span className="stat-label">👥 Total</span>
            <span className="stat-value">{totalResults}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">👑 Admins</span>
            <span className="stat-value">{adminCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">👤 Users</span>
            <span className="stat-value">{userCount}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="users-container">
        <h1>Users Management</h1>

        <div className="search-section">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search users..."
              className="search-box"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>
          <SearchResultCard />
        </div>

        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
                {/* <th>Status</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.mobile}</td>
                    <td className={user.role === "admin" ? "admin-role" : ""}>
                      {user.role}
                    </td>
                    {/* <td>
                      <span className={`status-indicator ${user.lastLogin ? 'status-active' : 'status-inactive'}`}></span>
                      {user.lastLogin ? 'Active' : 'Inactive'}
                    </td> */}
                    <td>
                      {user.role !== "admin" ? (
                        <button 
                          className="delete-btn" 
                          onClick={() => deleteUser(user._id, user.role)}
                        >
                          <span>🗑️</span> Remove
                        </button>
                      ) : (
                        <span className="admin-tag">
                          <span>👑</span> Admin
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    {loading ? 'Loading users...' : 'No users found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .search-section {
          margin-bottom: 20px;
        }

        .search-wrapper {
          position: relative;
          max-width: 500px;
          margin: 0 auto;
        }

        .search-box {
          width: 100%;
          padding: 12px 40px 12px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .search-box:focus {
          border-color: #2196F3;
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
          outline: none;
        }

        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
        }

        .clear-search:hover {
          background: #f0f0f0;
        }

        .search-result-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          margin-top: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          animation: slideDown 0.3s ease;
        }

        .search-summary {
          margin-bottom: 15px;
          text-align: center;
        }

        .search-summary h3 {
          margin: 0;
          color: #333;
          font-size: 18px;
        }

        .search-summary p {
          margin: 5px 0 0;
          color: #666;
          font-size: 14px;
        }

        .search-stats {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .stat-item {
          padding: 10px 20px;
          background: #f8f9fa;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 100px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: bold;
          color: #333;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 600px) {
          .search-stats {
            flex-direction: column;
            gap: 10px;
          }

          .stat-item {
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default Users;