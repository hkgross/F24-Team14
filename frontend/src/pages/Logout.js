import Navbar from "../layout/Navbar";
import LogoutContent from "../components/LogoutContent";
import React, { useEffect } from "react";
import { useAuth } from "../hooks/AuthProvider";
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const timeoutID = setTimeout(() => {
            navigate('/login')
            logout();
        }, 3000);
        return () => clearTimeout(timeoutID);
    }, []);

    return (
        <>
        <Navbar />
        <LogoutContent/>
        </>
    )
}

export default Logout;