import { useAuth } from "../hooks/AuthProvider";
import React, { useEffect, useState } from "react";

export default function DriverDash() {
    const { user, fetchUserInfo, refreshAccessToken } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get data for user
    useEffect(() => {
        const getUserData = async () => {
            try {
                setLoading(true);

                // Refresh in case
                await refreshAccessToken();

                const data = await fetchUserInfo();
                if (data) {
                    setUserData(data);
                    // REMOVE LATER
                    // Check if data received
                    //console.log("data: ", data);
                }
            }
            catch (error) {
                console.error("Error", error);
            } 
            finally {
                setLoading(false);
            }
        };

        getUserData();

    }, []);

    if (loading) {
        return (
            <h1>Loading...</h1>
        )
    }

    return (
        <div className="dashboard font-karla">
            <div className="welcome-widget">
                <h1>Welcome to your Sponsor Dashboard</h1>
            </div>
            <div className="bottom-widget-bar basic-flex">
                <div className="bottom-widget">
                    <h2>Applications</h2>
                </div>
                <div className="bottom-widget">
                    <h2>Company Directory</h2>
                </div>
                <div className="bottom-widget">
                    <h2>Audit Logs</h2>
                </div>
                <div className="bottom-widget">
                    <h2>Account</h2>
                </div>
            </div>
        </div>
    )
}