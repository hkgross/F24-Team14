import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import "./CSS/CreateAccountForm.css";



function CreateAccountForm() {
    const navigate = useNavigate();

    const [formName, setName] = useState("");
    const [formAddress, setAddress] = useState("");
    const [formBirthday, setBirthday] = useState("");
    const [formUsername, setUsername] = useState("");
    const [formEmail, setEmail] = useState("");
    const [formBio, setBio] = useState("");
    var [formAccountType, setAccountType] = useState("");
    const [formAccSponsorId, setAccSponsorId] = useState("");
    const [errorMessage, setErrorMessage] = useState('');
    const [passwordStrength, setPasswordStrength] = useState("");
    const [strengthPercentage, setStrengthPercentage] = useState(0);
    const [missingCriteria, setMissingCriteria] = useState([]);
    var [formPassword, setPassword] = useState("");

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

    
    // Account type options handling
    const storedUser = localStorage.getItem("user");
    var userData;
    if (!storedUser) {
        // var selectElement = document.getElementById("accountType");
        // selectElement.remove(selectElement.options.length - 1);
        // navigate('/dashboard/');
    }
    else{
        userData = JSON.parse(storedUser);
        const userAccountType = userData.type;
    
            if (userAccountType === "sponsor") {
            window.onload = function() {
                // alert("loaded");
                var selectElement = document.getElementById("accountType");
                selectElement.remove(selectElement.options.length - 1);
            }
        }
    
        if (userAccountType === "driver") {
            navigate('/dashboard/');
        }
    }

    const checkPasswordStrength = (password) => {
        const criteria = {
            lengthCriteria: password.length >= 8,
            uppercaseCriteria: /[A-Z]/.test(password),
            lowercaseCriteria: /[a-z]/.test(password),
            numberCriteria: /\d/.test(password),
            specialCharCriteria: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
        
        const metCriteria = Object.values(criteria).filter(Boolean).length;

        // Calculate and set strength percentage
        setStrengthPercentage((metCriteria / 5) * 100);

        // Update strength text
        switch (metCriteria) {
            case 5:
                setPasswordStrength("Strong");
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

    const handleCreation = async (e) => {
        e.preventDefault();

        try {
            setErrorMessage('');

            //Get user token
            // Check if there is a current user in local storage
            // const storedUser = localStorage.getItem("user");
            // if (!storedUser) {
            //     return null;
            // }

            // // Get access token
            // const userData = JSON.parse(storedUser);
            var accessToken = "UNREGISTERED";
            if (localStorage.getItem("user")) {
                accessToken = userData.access;
            }

            formPassword = await sha256(formPassword);
            if (formAccountType === ""){
                formAccountType = "driver";
            }
            const hostname = window.location.hostname;
            const response = await axios.post(`http://${hostname}:8000/authentication/create/`, {
                name: formName,
                address: formAddress,
                birthday: formBirthday,
                username: formUsername,
                email: formEmail,
                bio: formBio,
                accountType: formAccountType,
                accSponsorId: formAccSponsorId,
                token: accessToken,
                password: formPassword
            }, {
                headers: {'Content-Type': 'application/json'}
            })
        
            if (response.status === 200) {
                if (response.data.success) {
                    alert('Account created successfully!');
                    console.log(response.data);
                    navigate('/dashboard/');
                } else {
                    setErrorMessage('Something went wrong.');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('Something went wrong.');
        }
    };

    return (
        <div className="mainContainer" style={{marginTop:"10vh"}}>
            <form onSubmit={handleCreation}>
                <hr></hr>
                <div className="titleContainer">
                  <h2>User Information</h2>
                </div>
                <br></br><br></br>
                <div className="inputContainer">
                    <label htmlFor="accountType">Account Type: </label>
                    <select onChange={e => {setAccountType(e.target.value)}} id="accountType">
                        <option value="driver">Driver</option>
                        <option value="sponsor">Sponsor</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="inputContainer">
                    <label htmlFor="name">Name: </label>
                    <input onChange={e => {setName(e.target.value)}} type="text" id="name"/>
                </div>
                <div className="inputContainer">
                    <label htmlFor="address">Address: </label>
                    <input onChange={e => {setAddress(e.target.value)}} type="text" id="address"/>
                </div>
                <br></br>
                <div className="inputContainer">
                    <label htmlFor="email">Email: </label>
                    <input onChange={e => {setEmail(e.target.value)}} type="email" id="email"/>
                </div>
                <br></br>
                <div className="inputContainer">
                    <label htmlFor="birthday">Birthday: </label>
                    <input onChange={e => {setBirthday(e.target.value)}} type="date" id="birthday"/>
                </div>
                <br></br>
                <div className="inputContainer">
                    <label htmlFor="bio">Bio: </label>
                    <textarea onChange={e => {setBio(e.target.value)}} id="bio"/>
                </div>
                
                <br></br>
                <hr></hr>
                <br></br>

                <div className="inputContainer">
                    <h2>Account Information</h2>
                    <label htmlFor="username">Username: </label>
                    <input onChange={e => {setUsername(e.target.value)}} type="text" id="username"/>
                </div>
                <div className="inputContainer">
                    <label htmlFor="password">Password: </label>
                    <input
                        onChange={e => {
                            setPassword(e.target.value);
                            checkPasswordStrength(e.target.value);
                        }}
                        type="password"
                        id="password"
                    />
                </div>
                
                <div className="passwordStrength">
                    <div
                        className="strengthBar"
                        style={{
                            width: `${strengthPercentage}%`,
                            backgroundColor: getStrengthColor(passwordStrength)
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
                <br />
                <div className="inputContainer">
                    <label htmlFor="accSponsorId">Sponsor ID: </label>
                    <input onChange={e => {setAccSponsorId(e.target.value)}} type="text" id="accSponsorId"/>
                </div>
                <br></br>
                <button type="submit" disabled={passwordStrength !== "Strong"}>
                    CREATE
                </button>
                <a href="/" className="cancelbtn">Cancel</a>
                <br /><br />

                {errorMessage && <p className="errorMessage">{errorMessage}</p>}
            </form>
        </div>
    );
}

// Helper function to get color based on password strength
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

export default CreateAccountForm;