import { useAuth } from "../hooks/AuthProvider";
import { useEffect, useState } from "react";
import axios from "axios";

const useGetNotifications = () => {
    const { refreshAccessToken } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    var hostname=window.location.hostname;

    // Get drivers associated with company
    useEffect(() => {
        const fetchNotifications = async () => {
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
              const response = await axios.get('http://'+hostname+':8000/' + 'audit/notifications/', {
                  // Pass token through header
                  headers: {
                      'Authorization': `Bearer ${accessToken}`
                  }
              })
  
              // Set data
              if (response.status === 200) {
                  setNotifications(response.data);
              }
          }
          catch(error) {
              setError("Failed to get data");
          }
          finally {
              setLoading(false);
          }
        } 
        fetchNotifications(); 
      }, [])
      return { notifications, loading, error }
}
export default useGetNotifications;