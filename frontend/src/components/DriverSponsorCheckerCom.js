import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/AuthProvider";
import './CSS/DriverSponsorChecker.css';

export default function DriverSponsorViewer() {
    const { user } = useAuth();  
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hostname = window.location.hostname;

    useEffect(() => {
        const getSponsorData = async () => {
            try {
                setLoading(true);

                if (!user || !user.ACCOUNT_ID) {
                    setError("User or account information is not available.");
                    return;
                }

                // Make the API call to fetch sponsors, passing the ACCOUNT_ID as a parameter
                const response = await axios.get(`http://${hostname}:8000/sponsors/getspon/`, {
                    params: {
                        account_id: user.account_id, 
                    },
                });

                setSponsors(response.data || []);
            } catch (err) {
                console.error("Error loading sponsor data:", err);
                setError("Failed to load sponsor information.");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            getSponsorData();
        } else {
            setError("User is not authenticated.");
        }
    }, [hostname, user]);

    // Render based on the state
    if (loading) {
        return <h1>Loading...</h1>;
    }

    if (error) {
        return <div className="Error">{error}</div>;
    }

    if (sponsors.length === 0) {
        return <p>No sponsors have accepted your application.</p>;
    }

    return (
        <div className="My-Sponsors">
            <h1>My Sponsors</h1>
            <div className="Sponsor-List">
                {sponsors.map((sponsor, index) => (
                    <div key={index} className="Sponsor-Card">
                        <h2>{sponsor.sponsor_name}</h2>
                        <p><strong>Points:</strong> {sponsor.points}</p>
                        <p><strong>Application Date:</strong> {new Date(sponsor.app_date).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}