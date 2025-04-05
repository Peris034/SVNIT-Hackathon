import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
// import { ToastContainer, toast } from "react-toastify";
import { toast } from 'react-hot-toast';

import "react-toastify/dist/ReactToastify.css";

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

  // Predefined categories
  const categories = [
    "Harassment",
    "Fire",
    "Violence",
    "Medical Emergency",
    "Theft",
    "Natural Disaster",
    "Traffic Accident",
    "Other"
  ];

  useEffect(() => {
    // Fetch user's location
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
      (error) => {
        toast.error("Location access denied. Enable GPS and refresh.");
      }
    );
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Reset otherCategory when category changes to something other than "Other"
    if (name === "category" && value !== "Other") {
      setFormData(prev => ({ ...prev, otherCategory: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, document: file }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 10 digits
    if (value === '' || (/^\d+$/.test(value) && value.length <= 10)) {
      setFormData(prev => ({ ...prev, number: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    if (!formData.location.latitude || !formData.location.longitude) {
      toast.error("Location is required. Please enable GPS.");
      return;
    }

    if (!localStorage.getItem("token")) {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/incident`, {
        method: "POST",
        body: formDataToSend,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setLoading(false);
      if (response.ok) {
        toast.success("Incident reported successfully!");

        setFormData({
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
      } else {
        const errorResponse = await response.json();
        toast.error(errorResponse.message || "Error submitting form");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Server error. Please try again later.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="incident-container">
        <h1>Report an Incident</h1>
        <form className="incident-form" onSubmit={handleSubmit}>

          {formData.category === "Other" && (
            <div className="form-group animate-fade-in">
              <label>Specify Category</label>
              <input
                type="text"
                name="otherCategory"
                value={formData.otherCategory}
                onChange={handleChange}
                placeholder="Please specify the incident category"
                required
                className="other-category-input"
              />
            </div>
          )}

          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel"
              name="number"
              value={formData.number}
              onChange={handlePhoneChange}
              required
              pattern="[0-9]{10}"
              maxLength="10"
              title="Please enter a valid 10-digit phone number"
              className={`phone-input ${formData.number.length > 0 && formData.number.length < 10 ? 'invalid' : ''}`}
            />
            {formData.number.length > 0 && formData.number.length < 10 && (
              <span className="error-message">Phone number must be 10 digits</span>
            )}
          </div>

          <div className="form-group">
            <label>Incident Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="category-select"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea name="message" value={formData.message} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Upload Supporting Document</label>
            <input type="file" accept="image/*" name="document" onChange={handleFileChange} />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Incident"}
          </button>
        </form>
      </div>

      <style>{`
        .incident-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
