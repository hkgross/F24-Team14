import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import "./CSS/Login.css";

function LoginForm() {
    const navigate = useNavigate();

    const [formUsername, setUsername] = useState("");
    var [formPassword, setPassword] = useState("");
    const [formMFA, setMFA] = useState("");
    const [errorMessage, setErrorMessage] = useState('');
    const [remember, setRemember] = useState('');
    const { login } = useAuth();

    //Credit to StackOverflow user Vitaly Zdanevich for the following implementation of the built-in crypto sha256 function
    async function sha256(message) {
        // encode as UTF-8
        const msgBuffer = new TextEncoder().encode(message);                    
    
        // hash the message
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    
        // convert ArrayBuffer to Array
        const hashArray = Array.from(new Uint8Array(hashBuffer));
    
        // convert bytes to hex string                  
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // Function to handle form submission
    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
    
        try {

            //hash the password and transmit that
            formPassword = await sha256(formPassword);

            const hostname = window.location.hostname;
            const response = await axios.post(`http://${hostname}:8000/authentication/login/`, {
                username: formUsername,
                password: formPassword,
                mfa:      formMFA,
                remember: remember
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
    
            if (response.status === 200) {
                if (response.data.success) {
                    login(response.data);  // Log in the user
                    navigate('/dashboard/');
                } else {
                    let errorMsg = response.data.message;
    
                    // Only add remaining attempts if the account is not locked
                    if (response.data.lockout_time_remaining !== undefined) {
                        const minutes = Math.floor(response.data.lockout_time_remaining / 60);
                        const seconds = response.data.lockout_time_remaining % 60;
                        errorMsg = `Account is temporarily locked. Please try again in ${minutes} minute(s) and ${seconds} second(s).`;
                    } else if (response.data.remaining_attempts !== undefined) {
                        errorMsg += ` You have ${response.data.remaining_attempts} attempts remaining.`;
                    }
    
                    setErrorMessage(errorMsg);
                }
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const { lockout_time_remaining } = error.response.data;
    
                // Set the lockout message if lockout_time_remaining is present
                if (lockout_time_remaining !== undefined) {
                    const minutes = Math.floor(lockout_time_remaining / 60);
                    const seconds = lockout_time_remaining % 60;
                    setErrorMessage(`Account is temporarily locked. Please try again in ${minutes} minute(s) and ${seconds} second(s).`);
                } else {
                    setErrorMessage(error.response.data.message || 'An error occurred during login.');
                }
            } else {
                setErrorMessage('Your account is locked. Please try again later.');
            }
            console.error('Error:', error);
        }
    };
    
    return (
        <div className="mainContainer" style={{ marginTop: "10vh" }}>
            <form onSubmit={handleLogin}>
                <div className="titleContainer">
                    <br></br>
                    <h2>Login</h2>
                    <br></br>
                </div>
                <div className="inputContainer">
                    <label htmlFor="username">Username: </label>
                    <input onChange={e => { setUsername(e.target.value) }} type="text" id="username" />
                </div>
                <div className="inputContainer">
                    <label htmlFor="password">Password: </label>
                    <input onChange={e => { setPassword(e.target.value) }} type="password" id="password" />
                </div>
                <div className="inputContainer">
                    <label htmlFor="mfa">MFA Code (If enabled): </label>
                    <input onChange={e => { setMFA(e.target.value) }} type="text" id="mfa" />
                </div>
                <div>
                    <input type="checkbox" id="remember" onChange={e => {setRemember(e.target.value)}} />
                    <label htmlFor="remember"> Remember me</label>
                    <br></br><br></br>
                </div>
                <a href="/testme" id="login-banner-btn">Forgot Password?</a>
                <button type="submit">LOG IN</button>
                <a href="/" type="button" className="cancelbtn">Cancel</a>
                {errorMessage && <p className="errorMessage">{errorMessage}</p>} {/* Display error message if exists */}
            </form>
        </div>
    )
}

export default LoginForm