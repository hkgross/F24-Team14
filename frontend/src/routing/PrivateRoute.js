/* Allow access for logged in users */
/* Redirect to login page if not logged in */
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";


const PrivateRoute = () => {
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            const authStatus = await isAuthenticated();
            setIsLoggedIn(authStatus);
            setLoading(false);
        };
        checkAuthentication();
    }, [isAuthenticated]);

    // Loading
    if (loading) {
        return <h1>Loading...</h1>
    }
    
    // Not logged in
    if (!isLoggedIn)  {
        return <Navigate to="/login" />
    }

    return <Outlet />
};

export default PrivateRoute;