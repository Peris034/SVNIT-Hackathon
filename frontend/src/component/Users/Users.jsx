import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import "./Users.css"; 

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
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

  return (
    <>
      <Navbar />
      <div className="users-container">
        <h1>Users Management</h1>

        <div className="table-header">
          <input
            type="text"
            placeholder="Search users..."
            className="search-box"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
    </>
  );
};

export default Users;