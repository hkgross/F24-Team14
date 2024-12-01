import { useState, useEffect } from 'react';
import useGetNotifications from "../hooks/useGetNotifications";
import { useAuth } from "../hooks/AuthProvider"; 
import axios from 'axios';
import './CSS/Notification.css';

export default function NotificationContent() {
    const { notifications, loading, error } = useGetNotifications();
    const [preferences, setPreferences] = useState({});
    const [saving, setSaving] = useState(false);
    const { user } = useAuth();
    const hostname = window.location.hostname;

    useEffect(() => {
        async function fetchPreferences() {
            if (!user) {
                console.error("User object not found");
                return;
            }

            try {

                const response = await axios.get(`http://${hostname}:8000/notifications/getpreferences/`, {
                    params: {
                        username: user.user, 
                    }
                });

                console.log("Preferences response:", response.data);

                setPreferences(response.data || {});
            } catch (err) {
                console.error("Error fetching preferences:", err);
            }
        }

        // async function fetchUserNotifications() {
        //     if (!user) {
        //         console.error("User object not found");
        //         return;
        //     }

        //     try {
        //         const response = await axios.get(`http://${hostname}:8000/notifications/getpreferences/`, {
        //             params: {
        //                 username: user.user,  
        //             }
        //         });

        //         console.log("User notifications response:", response.data);

        //         setUserNotifications(response.data || []); 
        //     } catch (err) {
        //         console.error("Error fetching user notifications:", err);
        //     }
        // }

        if (user) {
            fetchPreferences();  
            //fetchUserNotifications(); 
        } else {
            console.error("User is not authenticated.");
        }
    }, [hostname, user]);

    const handlePreferenceChange = (type) => {
        setPreferences((prev) => ({
            ...prev,
            [type]: !prev[type],
        }));
    };

    const savePreferences = async () => {
        setSaving(true);
        try {
            if (!user) {
                console.error("User data not found");
                alert("Authentication required");
                return;
            }
    
            console.log("Sending preferences: ", { 
                username: user.user, 
                ...preferences, 
            });
    
            await axios.post(`http://${hostname}:8000/notifications/savepreferences/`, { 
                username: user.user, 
                ...preferences, 
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            alert("Preferences saved successfully!");
        } catch (err) {
            console.error("Error saving preferences:", err);
            alert("Failed to save preferences.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <h1>Loading...</h1>;
    }

    if (error) {
        return <h1>{error}</h1>;
    }
    return (
        <div className="font-karla dashboard">
            <div className="dash-main-container">
                <h1>Notifications</h1>
    
                {/* Preferences Section */}
                <h2>Notification Preferences</h2>
                <div className="notification-preferences">
                    <div className="toggle-switch">
                        <label>
                            Notify on Order Error
                            <div className="switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.order_error_enabled || false}
                                    onChange={() => handlePreferenceChange('order_error_enabled')}
                                />
                                <span className="slider"></span>
                            </div>
                        </label>
                    </div>
                    <div className="toggle-switch">
                        <label>
                            Notify on Order Placement
                            <div className="switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.order_placed_enabled || false}
                                    onChange={() => handlePreferenceChange('order_placed_enabled')}
                                />
                                <span className="slider"></span>
                            </div>
                        </label>
                    </div>
                    <div className="toggle-switch">
                        <label>
                            Notify on Points Added
                            <div className="switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.points_added_enabled || false}
                                    onChange={() => handlePreferenceChange('points_added_enabled')}
                                />
                                <span className="slider"></span>
                            </div>
                        </label>
                    </div>
                </div>
    
                <button onClick={savePreferences} disabled={saving}>
                    {saving ? "Saving..." : "Save Preferences"}
                </button>
    
                {/* Notifications Table */}
                <h2>User Notifications</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Notification Type</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications && notifications.length > 0 ? (
                            notifications.map((entry) => (
                                <tr key={entry.EVENT_ID}>
                                    <td>{entry.EVENT_TYPE}</td>
                                    <td>{entry.DESCRIPTION}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2">No notifications available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

}