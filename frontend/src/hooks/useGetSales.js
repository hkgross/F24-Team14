import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth, refreshAccessToken } from "../hooks/AuthProvider";

// Get sales for driver

const useGetSales = () => {
    var hostname=window.location.hostname;

    const { refreshAccessToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [salesLog, setSalesLog] = useState([]);

    useEffect(() => {
        const fetchPoints = async () => {
            setLoading(true);
            setError(false);
            try {
                // Get token from local storage
                const storedUser = localStorage.getItem("user");
                const user = JSON.parse(storedUser);
                const accessToken = user.access;

                // Refresh in case
                await refreshAccessToken();

                // Make get request to backend
                const response = await axios.get('http://'+hostname+':8000/' + 'points/sales/', {
                    // Pass token through header
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })

                // Set data
                if (response.status === 200) {
                    //console.log(response.data);
                    setSalesLog(response.data);
                }
            }
            catch(error) {
                setError("Failed to get points history");
            }
            finally {
                setLoading(false);
            }
        }
        fetchPoints();
    }, [])
    return { salesLog, loading, error }
}

export default useGetSales