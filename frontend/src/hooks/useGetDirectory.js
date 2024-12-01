// Get all users in company if sponsor
// Get all users if admin

import { useAuth } from "../hooks/AuthProvider";
import React, { useEffect, useState } from "react";
import axios from "axios";

const useGetDirectory = () => {
    const { refreshAccessToken } = useAuth();
    const [directory, setDirectory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    var hostname=window.location.hostname;

    useEffect(() => {
        const fetchDirectory = async () => {
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
                const response = await axios.get('http://'+hostname+':8000/' + 'api/directory/', {
                    // Pass token through header
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })

                // Set data
                if (response.status === 200) {
                    //console.log(response.data);
                    setDirectory(response.data);
                }
            }
            catch (error) {
                setError("Failed to get directory");
            }
            finally {
                setLoading(false);
            }
        }
        fetchDirectory();
    }, [])
    return { directory, loading, error }
}
export default useGetDirectory;