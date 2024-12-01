import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth, refreshAccessToken } from "../hooks/AuthProvider";

// Get the points associated with current driver 

const useGetSalesBySponsor = () => {
    var hostname=window.location.hostname;

    const { refreshAccessToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sponsorSalesLog, setSponsorSalesLog] = useState([]);

    useEffect(() => {
        const fetchSales = async () => {
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
                // Axios post request
            const response = await axios.post('http://'+hostname+':8000/' + 'points/sales/sponsor/', 
                { 
                    Sponsor: '',
                    // Driver: '',
                    Start: '',
                    End: '',
                    Type: 'summary'
                }, 
                { headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${accessToken}`
                }})
                // Set points
                // Set data
                if (response.status === 200) {
                    //console.log(response.data);
                    setSponsorSalesLog(response.data);
                }
            }
            catch(error) {
                setError("Failed to get points history");
            }
            finally {
                setLoading(false);
            }
        }
        fetchSales();
    }, [])
    return { sponsorSalesLog, loading, error }
}

export default useGetSalesBySponsor