import React, { useState } from "react";
import axios from "axios";
import './CSS/ForgotFourm.css';

export default function ForgotFourm() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');  
        setError(''); 

        try {
            const hostname = window.location.hostname;
            const response = await axios.post(`http://${hostname}:8000/authentication/request-password-reset/`, {
                email: email,
            });
            console.log(response.data);
            setMessage(response.data.message); // Set success message

        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data.error || 'An unexpected error occurred'); // Set error message

        }
    };

    return (
        <div className="forget-password-page">
            <div className="form-container">
                <h1>Forgot your password?</h1>
                <p>Enter your email address below, and we’ll send you a link to reset your password.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email Address:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <button type="submit">Send Reset Link</button>
                </form>

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}