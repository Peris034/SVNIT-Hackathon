"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginDetail() {
  const [user, setUser] = useState({});
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/user/logindetail`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleEmailUpdate = async () => {
    const token = localStorage.getItem("token");
    if (!newEmail) return;

    try {
      const response = await fetch(`${API_URL}/user/update-email`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newEmail }),
      });

      const data = await response.json();
      console.log("first", data);
      if (response.ok) {
        toast.success(data.message)
        setUser((prev) => ({ ...prev, email: data.email }));
        localStorage.setItem("token", data.token);
        setMessage("Email updated successfully!");
        setShowEmailDialog(false);
        setNewEmail("");
      } else {
        toast.error(data.message)
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Error updating email:", error);
    }
  };

  const handlePasswordUpdate = async () => {
    const token = localStorage.getItem("token");
    if (!currentPassword || !newPassword) return;

    try {
      const response = await fetch(`${API_URL}/user/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        toast.success(data.message)
        // setMessage("Password updated successfully!");
        setShowPasswordDialog(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message)
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login Details</h2>
      <p><strong>Name:</strong> {user.fullName}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>

      <button onClick={() => setShowEmailDialog(true)} style={styles.button}>Change Email</button>
      <button onClick={() => setShowPasswordDialog(true)} style={styles.button}>Change Password</button>

      {/* {message && <p style={styles.successMessage}>{message}</p>} */}

      {/* Email Change Popup */}
      {showEmailDialog && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Change Email</h3>
            <input
              type="email"
              placeholder="New Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={styles.input}
            />
            <button onClick={() => setShowEmailDialog(false)} style={styles.button}>Cancel</button>
            <button onClick={handleEmailUpdate} style={styles.button}>Save</button>
          </div>
        </div>
      )}

      {/* Password Change Popup */}
      {showPasswordDialog && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Change Password</h3>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
            />
            <button onClick={() => setShowPasswordDialog(false)} style={styles.button}>Cancel</button>
            <button onClick={handlePasswordUpdate} style={styles.button}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
  },
  userInfo: {
    fontSize: "16px",
    marginBottom: "12px",
    color: "#555",
  },
  button: {
    backgroundColor: "#4a67ff",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "6px",
    cursor: "pointer",
    border: "none",
    outline: "none",
    fontSize: "14px",
    fontWeight: "bold",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.3s ease",
    margin: "10px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
  },
  buttonHover: {
    backgroundColor: "#3749d6",
  },
  successMessage: {
    color: "#28a745",
    backgroundColor: "#e6f9ea",
    padding: "10px",
    borderRadius: "6px",
    marginTop: "15px",
    fontSize: "14px",
    fontWeight: "bold",
    textAlign: "center",
  },
  modal: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "8px",
    textAlign: "center",
    width: "350px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  modalHeading: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.3s ease",
  },
  inputFocus: {
    border: "1px solid #4a67ff",
  },
  modalButtonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
  },
  modalButton: {
    backgroundColor: "#4a67ff",
    color: "white",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    border: "none",
    outline: "none",
    fontWeight: "bold",
    transition: "background 0.3s ease",
  },
  modalButtonHover: {
    backgroundColor: "#3749d6",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    color: "#333",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    border: "none",
    outline: "none",
    fontWeight: "bold",
    transition: "background 0.3s ease",
  },
  cancelButtonHover: {
    backgroundColor: "#b0b0b0",
  },
};