import { useContext, createContext, useState, useEffect } from "react";
import axios from "axios";

// Create AuthContext
const AuthContext = createContext();

var hostname=window.location.hostname;

const AuthProvider = ({children}) => {
    // Initialize user state
    const [user, setUser] = useState(() => {
        const currentUser = localStorage.getItem("user");
        if (currentUser) {
            return JSON.parse(currentUser);
        }
        else {
            return null;
        }
    });

    // Login
    const login = (userData) => {
        // Save user data and save to local storage
        // First login
        if (!user || user === "{}" || user === "") {
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
        }
        else {
            // Save user as sponsor
            // Save driver as new user
            const sponsorUser = localStorage.getItem("user");
            localStorage.setItem("sponsor", sponsorUser);
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
        }
    };

    // Check if user logged in or not
    const isAuthenticated = async () => {
        // Check local storage if user exists
        const storedUser = localStorage.getItem("user");

        // Check access token
        if (storedUser) {
            // Get token
            const userData = JSON.parse(storedUser);
            const accessToken = userData.access;

            // Check token
            const response = await axios.get('http://'+hostname+':8000/authentication/isvalid/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            
            if (response.status === 200 && response.data.valid) {
                return true;
            }

        }
        
        return false;
    };

    // Logout
    const logout = async () => {
        const sponsor = localStorage.getItem("sponsor");

        // Not a sponsor logged into driver
        if (sponsor === null || sponsor === "") {
            localStorage.clear();
        }
        else {
            localStorage.setItem("user", sponsor);
            localStorage.setItem("sponsor", "");
        }
    }

    // Use refresh token
    const refreshAccessToken = async () => {
        // Get data from local storage
        const storedUser = localStorage.getItem("user");
        const userData = JSON.parse(storedUser);
        const refreshToken = userData.refresh;

        try {
            // REPLACE WHEN DEPLOYING
            var hostname=window.location.hostname;var hostname=window.location.hostname;
            const response = await axios.post('http://'+hostname+':8000/' + 'token/refresh/', {
            //const response = await axios.post('http://localhost:8000/token/refresh/', {
                refresh: refreshToken
            }, {
                headers: {'Content-Type': 'application/json'}
            })
            
            if (response.status === 200) {
                // Update access token
                userData.access = response.data.access;
                // Update local storage
                localStorage.setItem("user", JSON.stringify(userData));
                // Update state
                setUser(userData);
            }
            else {
                // Add logout
            }
        } catch (error) {
            // logout
        }
    }


    // Get user data for logged in user using the access token
    const fetchUserInfo = async () => {
        // Check if there is a current user in local storage
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            return null;
        }

        // Get access token
        const userData = JSON.parse(storedUser);
        const accessToken = userData.access;

        // Send token to backend
        try {
            var hostname=window.location.hostname;var hostname=window.location.hostname;
            const response = await axios.post('http://'+hostname+':8000/authentication/profile/', {
                token: accessToken
            }, {
                headers: {'Content-Type': 'application/json'}
            });

            // Success
            if (response.status === 200) {
                return response.data;
            }
            else {
                console.error("Error: ", response.status);
                return null;
            }

        } catch (error) {
            console.error("Error: ", error);
            return null;
        }

    };
    // Get user data for logged in user using the access token
    const fetchAccSponsorInfo = async () => {
        // Check if there is a current user in local storage
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            return null;
        }

        // Get access token
        const userData = JSON.parse(storedUser);
        const accessToken = userData.access;

        // Send token to backend
        try {
            // REPLACE WHEN DEPLOYING
            var hostname=window.location.hostname;
            const response = await axios.post('http://'+hostname+':8000/authentication/acc-sponsor/', {
                token: accessToken
            }, {
                headers: {'Content-Type': 'application/json'}
            });

            // Success
            if (response.status === 200) {
                return response.data;
            }
            else {
                console.error("Error: ", response.status);
                return null;
            }

        } catch (error) {
            console.error("Error: ", error);
            return null;
        }

    };
    
    
    return <AuthContext.Provider value={{user, login, isAuthenticated, logout, refreshAccessToken, fetchUserInfo, fetchAccSponsorInfo}}>{children}</AuthContext.Provider>
};

export default AuthProvider;

// Custom hook to access authentication context 
export const useAuth = () => {
    return useContext(AuthContext);
};