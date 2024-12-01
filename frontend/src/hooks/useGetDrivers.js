// Get all the drivers associated with the company 
// of the user who is logged in

import { useAuth } from "../hooks/AuthProvider";
import React, { useEffect, useState } from "react";
import axios from "axios";

const useGetDriver = () => {
    const { refreshAccessToken } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    var hostname=window.location.hostname;

    // Get drivers associated with company
    useEffect(() => {
      const fetchDrivers = async () => {
        setLoading(true);
        setError(null);
        try {

            // Get token from local storage
            const storedUser = localStorage.getItem("user");
            const user = JSON.parse(storedUser);
            const accessToken = user.access;

            // Refresh in case
            await refreshAccessToken();

            // Make get request to backend
            const response = await axios.get('http://'+hostname+':8000/' + 'api/mydrivers/', {
                // Pass token through header
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })

            // Set data
            if (response.status === 200) {
                //console.log(response.data);
                setDrivers(response.data);
            }
        }
        catch(error) {
            setError("Failed to get drivers");
        }
        finally {
            setLoading(false);
        }
      } 
      fetchDrivers(); 
    }, [])
    return { drivers, loading, error }
}

export default useGetDriver;