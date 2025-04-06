import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { toast } from 'react-hot-toast';
// import "./incident.css"; // Optional: include styles for modal

const Incident = () => {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    address: "",
    title: "",
    message: "",
    document: null,
    category: "",
    otherCategory: "",
    location: { latitude: null, longitude: null },
  });

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incidentHistory, setIncidentHistory] = useState([]);

  const categories = [
    "Harassment", "Fire", "Violence", "Medical Emergency",
    "Theft", "Natural Disaster", "Traffic Accident", "Other"
  ];

  // Fetch location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        }));
      },
      () => toast.error("Location access denied. Enable GPS and refresh.")
    );
  }, []);

  // Fetch user's incident history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${import.meta.env.VITE_API_URL}/incident`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setIncidentHistory(data.incidents || []);
          console.log("firstdddd", data.incidents);
        } else {
          toast.error("Failed to load history");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching incident history");
      }
    };

    fetchHistory();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" && value !== "Other" && { otherCategory: "" }),
    }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && value.length <= 10)) {
      setFormData((prev) => ({ ...prev, number: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, document: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("inside submit", formData);
    if (!formData.location.latitude || !formData.location.longitude) {
      toast.error("Location is required. Please enable GPS.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User authentication required!");
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "location") {
        formDataToSend.append("latitude", formData.location.latitude);
        formDataToSend.append("longitude", formData.location.longitude);
      } else if (key === "document" && formData.document) {
        formDataToSend.append("document", formData.document);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/incident`, {
        method: "POST",
        body: formDataToSend,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      setLoading(false);

      if (res.ok) {
        toast.success("Incident reported successfully!");
        setFormData({
          name: "", number: "", address: "", title: "", message: "",
          document: null, category: "", otherCategory: "", location: formData.location
        });
        setIsModalOpen(false); // close modal
        setIncidentHistory((prev) => [result.incident, ...prev]); // update history
      } else {
        toast.error(result.message || "Error submitting form");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Server error. Please try again later.");
    }
  };

  return (
    <>
      <Navbar />

      <div className="incident-container flex flex-col justify-center">
        <h1>Incident Dashboard</h1>

        <button className="open-form-btn btn cursor-pointer " onClick={() => setIsModalOpen(true)}>
          Report a New Incident
        </button>

        {/* MODAL FORM */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              {/* <span className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</span> */}
              <h2 className="text-center m-5">Report an Incident</h2>
              <form className="incident-form" onSubmit={handleSubmit}>


                <div className="form-group">
                  <label>Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="number" value={formData.number}
                    onChange={handlePhoneChange} required pattern="[0-9]{10}" maxLength="10" />
                </div>

                <div className="form-group">
                  <label>Incident Category</label>
                  <select name="category" value={formData.category}
                    onChange={handleChange} required>
                    <option value="">Select category</option>
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {formData.category === "Other" && (
                  <div className="form-group">
                    <label>Specify Category</label>
                    <input type="text" name="otherCategory" value={formData.otherCategory}
                      onChange={handleChange} placeholder="Please specify" required />
                  </div>
                )}

                <div className="form-group">
                  <label>Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Upload Document</label>
                  <input type="file" accept="image/*" name="document" onChange={handleFileChange} />
                </div>

                <button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* INCIDENT HISTORY TABLE */}
        <div className="incident-history">
          <h2 className="text-center m-5">Previous Incidents</h2>

          {incidentHistory.length === 0 ? (
            <p>No past incidents reported.</p>
          ) : (
            <div className="table-wrapper">
              <table className="incident-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Category</th>
                    <th>Message</th>
                    <th>Address</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Document</th>
                    <th>Reported At</th>
                  </tr>
                </thead>
                <tbody>
                  {incidentHistory.map((incident, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{incident?.otherCategoryMsg || incident?.category || null}</td>
                      <td>{incident?.message}</td>
                      <td>{incident?.address}</td>
                      <td>{incident?.number}</td>
                      <td>{incident?.status}</td>
                      <td>
                        {incident?.documentUrl ? (
                          <a
                            href={incident?.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>{incident?.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
      <style>{`
        .incident-container {
          max-width: 900px;
          margin: 2rem auto;
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .btn{
          background-color: #4a63d0;
  color: white;
  border:
none;
  cursor: pointer;
  transition:
background-color 0.3s;
padding:
0.5rem;
  font-size: 1rem;
  border:
1px solid #ddd;
  border-radius:
4px;
        }
        h1 {
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .incident-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          margin: 0;
          padding: 0;
          background: none;
        }

        label {
          display: block;
          margin-bottom: 0.3rem;
          color: #555;
          font-size: 0.9rem;
          font-weight: 500;
        }

        input, 
        textarea, 
        .category-select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }

        input:focus, 
        textarea:focus, 
        .category-select:focus {
          outline: none;
          border-color: #007bff;
        }

        textarea {
          min-height: 100px;
          resize: vertical;
        }

        .category-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23333' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
          padding-right: 2rem;
          appearance: none;
        }

        .submit-btn {
          background: #007bff;
          color: white;
          padding: 0.7rem;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: background 0.2s;
        }

        .submit-btn:hover {
          background: #0056b3;
        }

        .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .incident-container {
            margin: 1rem;
            padding: 1rem;
          }
        }

        .phone-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .phone-input.invalid {
          border-color: #dc3545;
          background-color: #fff8f8;
        }

        .error-message {
          color: #dc3545;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          display: block;
        }

        .phone-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.1);
        }

        .phone-input.invalid:focus {
          border-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220,53,69,0.1);
        }
      `}</style>
    </>
  );
};

export default Incident;
