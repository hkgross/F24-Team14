import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth, refreshAccessToken } from "../hooks/AuthProvider";

// Get sales

const useGetDriverSales = () => {
    var hostname=window.location.hostname;

    const { refreshAccessToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [driverSalesLog, setSalesLog] = useState([]);

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
                const response = await axios.post('http://'+hostname+':8000/' + 'points/sales/driver/', 
                    {
                        Name: "",
                        Sponsor: "",
                        Start: "",
                        End: "",
                        Type: "summary"
                    },
                    // Pass token through header
                    {headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })

                // Set data
                if (response.status === 200) {
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
    return { driverSalesLog, loading, error }
}

export default useGetDriverSales