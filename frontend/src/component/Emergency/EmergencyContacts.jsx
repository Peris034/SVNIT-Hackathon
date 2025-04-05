import React, { useState, useEffect } from "react";
import { fetchEmergencyContacts, addEmergencyContact } from "../../services/api";
import { Plus, Phone, User, Heart } from "lucide-react";
import "./EmergencyContacts.css"; // Make sure this path is correct

const EmergencyContacts = ({ token }) => {
    const [contacts, setContacts] = useState([]);
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");  
    const [relationship, setRelationship] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        const loadContacts = async () => {
            try {
                const data = await fetchEmergencyContacts(token);
                if (Array.isArray(data)) {
                    setContacts(data);
                } else {
                    console.error("Unexpected response:", data);
                    setContacts([]);
                }
            } catch (err) {
                console.error("Error fetching contacts:", err);
                setError("Failed to load contacts.");
            } finally {
                setLoading(false);
            }
        };
        loadContacts();
    }, [token]);

    const handleAddContact = async () => {
        if (!name || !mobile) {
            setError("Name and Mobile are required!");
            return;
        }

        try {
            const newContact = { name, mobile, relationship };
            const addedContact = await addEmergencyContact(newContact, token);
            if (addedContact) {
                setContacts(prev => [...prev, addedContact]);
                setName("");
                setMobile("");
                setRelationship("");
                setError(null);
            }
        } catch (err) {
            console.error("Error adding contact:", err);
            setError("Failed to add contact.");
        }
    };

    return (
        <div className="emergency-container">
            <div className="header-section">
                <h2 className="page-title">Emergency Contacts</h2>
                <button 
                    className="add-button"
                    onClick={() => setIsFormVisible(!isFormVisible)}
                >
                    <Plus size={20} />
                    <span>Add Contact</span>
                </button>
            </div>

            {error && (
                <div className="error-message">{error}</div>
            )}

            {isFormVisible && (
                <div className="contact-form">
                    <h3 className="form-title">Add New Emergency Contact</h3>
                    <div className="input-group">
                        <User size={20} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Contact Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <Phone size={20} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Mobile Number"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <Heart size={20} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Relationship"
                            value={relationship}
                            onChange={(e) => setRelationship(e.target.value)}
                        />
                    </div>
                    <button 
                        className="save-button"
                        onClick={handleAddContact}
                    >
                        Save Contact
                    </button>
                </div>
            )}

            <div className="contacts-table">
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                ) : contacts.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Relationship</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map(contact => (
                                <tr key={contact._id} className="table-row">
                                    <td className="table-cell" data-label="Name">{contact.name}</td>
                                    <td className="table-cell" data-label="Mobile">{contact.mobile}</td>
                                    <td className="table-cell" data-label="Relationship">{contact.relationship || "N/A"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <Phone size={40} className="empty-icon" />
                        <p className="empty-text">No emergency contacts added yet</p>
                        <p className="empty-subtext">Click the "Add Contact" button to add your first contact</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmergencyContacts;
