import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth, refreshAccessToken } from "../hooks/AuthProvider";

const useGetAuditLog = () => {
    var hostname=window.location.hostname;
    const { refreshAccessToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [audit, setAudit] = useState([]);

    useEffect(() => {
        const fetchAudit = async () => {
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
              const response = await axios.get('http://'+hostname+':8000/' + 'audit/', {
                  // Pass token through header
                  headers: {
                      'Authorization': `Bearer ${accessToken}`
                  }
              })
  
              // Set data
              if (response.status === 200) {
                  //console.log(response.data);
                  setAudit(response.data);
              }
          }
          catch(error) {
              setError("Failed to get audit log");
          }
          finally {
              setLoading(false);
          }
        } 
        fetchAudit(); 
      }, [])
      return { loading, error, audit }
}

export default useGetAuditLog