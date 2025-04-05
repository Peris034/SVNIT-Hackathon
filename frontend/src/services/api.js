const API_URL = import.meta.env.VITE_API_URL;

export const fetchEmergencyContacts = async (token) => {
    try {
        const response = await fetch(`${API_URL}/emergency-contacts`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching emergency contacts:", error);
        return [];
    }
};

export const addEmergencyContact = async (contact, token) => {
    try {
        const response = await fetch(`${API_URL}/emergency-contacts`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(contact)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error adding emergency contact:", error);
        return null;
    }
};

export const sendSosAlert = async (coordinates, token) => {
    // console.log("Sending SOS Alert Request:", coordinates); // Debugging
    try {
        const response = await fetch(`${API_URL}/sos-alerts`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ coordinates })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error sending SOS alert:", error);
        return null;
    }
};

export const fetchUserSosAlerts = async (token) => {
    try {
        const response = await fetch(`${API_URL}/sos-alerts`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching SOS alerts:", error);
        return [];
    }
};
