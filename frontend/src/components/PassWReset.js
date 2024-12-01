import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './CSS/PassWReset.css'

export default function PassWReset() {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [passwordStrength, setPasswordStrength] = useState("");
    const [strengthPercentage, setStrengthPercentage] = useState(0);
    const [missingCriteria, setMissingCriteria] = useState([]);
    const [weakPasswordError, setWeakPasswordError] = useState(""); // State for weak password error
    const navigate = useNavigate();

    const checkPasswordStrength = (password) => {
        const criteria = {
            lengthCriteria: password.length >= 8,
            uppercaseCriteria: /[A-Z]/.test(password),
            lowercaseCriteria: /[a-z]/.test(password),
            numberCriteria: /\d/.test(password),
            specialCharCriteria: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };

        const metCriteria = Object.values(criteria).filter(Boolean).length;
        setStrengthPercentage((metCriteria / 5) * 100);

        switch (metCriteria) {
            case 5:
                setPasswordStrength("Strong");
                setWeakPasswordError(""); // Clear error on strong password
                break;
            case 4:
                setPasswordStrength("Moderate");
                break;
            case 3:
                setPasswordStrength("Weak");
                break;
            default:
                setPasswordStrength("Very Weak");
        }

        const unmetCriteria = [];
        if (!criteria.lengthCriteria) unmetCriteria.push("At least 8 characters");
        if (!criteria.uppercaseCriteria) unmetCriteria.push("At least one uppercase letter");
        if (!criteria.lowercaseCriteria) unmetCriteria.push("At least one lowercase letter");
        if (!criteria.numberCriteria) unmetCriteria.push("At least one number");
        if (!criteria.specialCharCriteria) unmetCriteria.push("At least one special character");

        setMissingCriteria(unmetCriteria);
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        // Check password strength on submit
        if (passwordStrength !== "Strong") {
            setWeakPasswordError("Password must be strong to reset."); // Show weak password error
            return; // Prevent form submission
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const hostname = window.location.hostname;
            const response = await axios.post(`http://${hostname}:8000/authentication/forgot-password-two/`,{
                email: email,
                newPassword: newPassword,
                verifyPassword: confirmPassword
            });

            setMessage(response.data.message);
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            setError(error.response?.data.message || "An unexpected error occurred.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
            <form onSubmit={handleReset}>
                <h2 style={{ marginBottom: "1.5rem" }}>Password Reset</h2>
                {message && <p style={{ color: "green" }}>{message}</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                {weakPasswordError && <p style={{ color: "red" }}>{weakPasswordError}</p>} {/* Display weak password error */}

                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
                />

                <label htmlFor="newPassword">New Password:</label>
                <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => {
                        setNewPassword(e.target.value);
                        checkPasswordStrength(e.target.value);
                    }}
                    required
                    style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
                />

                <div className="passwordStrength">
                    <div
                        className="strengthBar"
                        style={{
                            width: `${strengthPercentage}%`,
                            backgroundColor: getStrengthColor(passwordStrength),
                        }}
                    />
                    <p>Password Strength: {passwordStrength}</p>
                    {missingCriteria.length > 0 && (
                        <ul className="missingCriteria">
                            {missingCriteria.map((criterion, index) => (
                                <li key={index}>{criterion}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <label htmlFor="confirmPassword">Confirm New Password:</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ width: "100%", padding: "0.5rem", marginBottom: "1.5rem" }}
                />

                <button
                    type="submit"
                    style={{
                        width: "100%", padding: "0.75rem", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer"
                    }}
                >
                    Reset Password
                </button>
            </form>
        </div>
    );
}

const getStrengthColor = (strength) => {
    switch (strength) {
        case "Strong":
            return "green";
        case "Moderate":
            return "orange";
        case "Weak":
            return "red";
        case "Very Weak":
        default:
            return "lightgray";
    }
};