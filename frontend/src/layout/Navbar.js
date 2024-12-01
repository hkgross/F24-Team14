import { useAuth } from "../hooks/AuthProvider";
import React, { useEffect, useState } from "react";
import logo from "../assets/logo-icon.svg";
import { useNavigate } from "react-router-dom";



export default function Navbar() {
    const {fetchUserInfo, refreshAccessToken, logout } = useAuth();
    const [user, setUserData] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        const getUserData = async () => {
            try {

                await refreshAccessToken();

                const data = await fetchUserInfo();
                if (data) {
                    setUserData(data);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        getUserData();
    }, []);

    const handleLogout = (e) => {


        e.preventDefault();
        logout();
        navigate('/login');

    }


    return (
        <nav className="nav font-karla basic-flex">
            {/* Redirect to landing page if not logged in, or dashboard if logged in */}
            <div className="title-container">
                <img src={logo} alt="PandaSoft Logo" className="logo" />
                <a href={user ? "/dashboard" : "/"} className="site-title">PandaSoft</a>
                
                {user ? (
                    <span className="user-name">Hello, {user.NAME}! 
                    <a href={user ? "/dashboard" : "/"} onClick={handleLogout}>(Logout)</a>
                    </span>
                ) : (
                    <span className="guest-message">
                        Hello, Guest <a href="/login">(Login)</a>
                    </span>
                )}
            </div>
            <ul>
                <li>
                    <a style={{ marginRight: 20 }} href="/">Home</a>
                    <a style={{ marginRight: 20 }} href="/sponsors">Sponsors/Applications</a>
                    <a href="/about">About</a>
                </li>
            </ul>
        </nav>
    );
}