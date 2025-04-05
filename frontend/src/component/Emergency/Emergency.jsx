import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ Added useNavigate
import Navbar from '../Navbar';
import EmergencyContacts from "./EmergencyContacts";
import SosAlertButton from "./SosAlertButton";

const Emergency = () => {
    const navigate = useNavigate(); // ✅ Initialize navigate
    const token = localStorage.getItem('token');

    if (!token) {
        console.error("Token is missing! Redirecting to login...");
        navigate('/'); // ✅ Redirect to login if token is missing
        return null;
    }

    return (
        <>
            <Navbar />
            <div>
                <EmergencyContacts token={token} />
                {/* <SosAlertButton token={token} /> */}
            </div>
        </>
    );
};

export default Emergency;
