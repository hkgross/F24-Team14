import React, { useState, useEffect } from "react";
import { useAuth, refreshAccessToken } from "../hooks/AuthProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CSS/AccountSettings.css";

function AccountSettingsForm(){
    var hostname=window.location.hostname;

    const [newName, setNewName] = useState("");
    const [newAddress, setNewAddress] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [newBirthday, setNewBirthday] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newBio, setNewBio] = useState("");
    const [styleDelete, setStyleDelete] = useState("closed");
    const [stylePassword, setStylePassword] = useState("closed");
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState("");
    const [MFASuccessMessage, setMFASuccessMessage] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [verifyPassword, setVerifyPassword] = useState("");

    const { user, fetchUserInfo, refreshAccessToken } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Get data for user
    useEffect(() => {
        const getUserData = async () => {
            try {
                setLoading(true);
                // Refresh in case
                await refreshAccessToken();
                const data = await fetchUserInfo();
                if (data) {
                    setUserData(data);
                    // REMOVE LATER
                    // Check if data received
                    // console.log("data: ", data);
                }
            }
            catch (error) {
                console.error("Error", error);
            } 
            finally {
                setLoading(false);
            }
        };
        getUserData();
    }, []);

    if (loading) {
        return console.log("loading");
    }

    // Function to handle delete
    const deleteAccount = () => {
        setSuccessMessage("");
        var hostname=window.location.hostname;
        axios.patch('http://'+hostname+':8000/accounts/'+userData.ACCOUNT_ID+'/', {
            STATUS: 'DELETED',
            PASSWORD: null
          })
            .then(response => console.log(response.data))
            .catch(error => console.error(error));
        setSuccessMessage("Account Deleted. Logging out...");
        navigate('/logout');
    };

    const changeStyleDelete = () => {
        if (styleDelete !== "closed") setStyleDelete("closed");
        else setStyleDelete("open");
    };

    const sendEmail = async(e) => {
        setSuccessMessage('');  
        setErrorMessage(''); 
        var nameChange = false;
        var addressChange = false;
        var emailChange = false;
        var birthdayChange = false;
        var usernameChange = false;
        var bioChange = false;

        if(newName != ''){
            nameChange = true;
        }
        if(newAddress != ''){
            addressChange = true;
        }
        if(newEmail != ''){
            emailChange = true;
        }
        if(newBirthday != ''){
            birthdayChange = true;
        }
        if(newUsername != ''){
            usernameChange = true;
        }
        if(newBio != ''){
            bioChange = true;
        }

        try {
            const response = await axios.post('http://'+hostname+':8000/authentication/update-info/', {
                currentEmail: userData.EMAIL,
                name: nameChange,
                address: addressChange,
                email: emailChange,
                birthday: birthdayChange,
                username: usernameChange,
                bio: bioChange,
            });
            console.log(response.data);
            setSuccessMessage(response.data.message); // Set success message

        } catch (error) {
            console.error('Error:', error);
            setErrorMessage(error.response?.data.error || 'An unexpected error occurred'); // Set error message
        }
    };

    const saveChanges = () => {
        var n = newName;
        var a = newAddress;
        var e = newEmail;
        var b = newBirthday;
        var u = newUsername;
        var bio = newBio;
        if(newName == ''){
            n = userData.NAME;
        }
        if(newAddress == ''){
            a = userData.ADDRESS;
        }
        if(newEmail == ''){
            e = userData.EMAIL;
        }
        if(newBirthday == ''){
            b = userData.BIRTHDAY;
        }
        if(newUsername == ''){
            u = userData.USERNAME;
        }
        if(newBio == ''){
            bio = userData.BIO;
        }
        var hostname=window.location.hostname;
        console.log("sending request")
        axios.patch('http://'+hostname+':8000/accounts/'+userData.ACCOUNT_ID+'/', {
            NAME: n,
            ADDRESS: a,
            EMAIL: e,
            BIRTHDAY: b,
            USERNAME: u,
            BIO: bio,
          }, {
            timeout: 10000
          })
            .then(response => console.log(response.data))
            .catch(error => console.error(error));
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        try {
            setErrorMessage('');
            setSuccessMessage('');
            var hostname=window.location.hostname;
            const response = await axios.post('http://'+hostname+':8000/authentication/verify-password/', {
                username: userData.USERNAME,
                currentPassword: currentPassword,
                newPassword: newPassword,
                verifyPassword: verifyPassword
            });
            console.log(response.data);
            if (response.status === 200) {
                if (response.data.success === true) {
                    console.log(response.data);
                    setSuccessMessage("Password updated successfully.");
                    changeStylePassword();
                }
                else {
                    setErrorMessage('Password cannot be updated.');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('Password cannot be updated.');
        }
    };

    const createMFA = () => {
        setMFASuccessMessage('');
        
        console.log(userData);
        var hostname=window.location.hostname;
        axios.post('http://'+hostname+':8000/authentication/mfasetup/', {
            username: userData.USERNAME,
            token: JSON.parse(localStorage.getItem("user")).access

        })
            .then(response => {
                console.log(response.data);
                setSuccessMessage(response.data.message);
                document.getElementById("totkKey").innerHTML = "<img src='"+response.data.qrCode+"' /><br />Either scan the above QR code, or enter the following secret key in your MFA app: <br /><br /><a href='"+response.data.url+"'>"+response.data.secretKey+"</a><br /><br /><b style='color:red;'>MFA is now enabled. If you do not save this key, you can't log in.</b>";
            })
            .catch(error => console.error(error));
    };




    const changeStylePassword = () => {
        if (stylePassword !== "closed") setStylePassword("closed");
        else setStylePassword("open");
    };

    const handleClick = () => {
        saveChanges();
        sendEmail();
        // Delay reload
        setTimeout(() => {
            window.location.reload();
        }, 3000);
        
    };

    return (
        <div className="dashboard">
            <div id="id01" className={styleDelete}>
                <span onClick={changeStyleDelete} className="close" title="Close Modal">&times;</span>
                <form className="modal-content">
                    <div className="infoContainer">
                        <h1>Delete Account</h1>
                        <p>Are you sure you want to delete your account?</p>
                        <div className="clearfix">
                            <button type="button" className="btn" onClick={changeStyleDelete}>Cancel</button>
                            <button type="button" className="deletebtn" onClick={deleteAccount}>Delete</button>
                            {successMessage && <p className="successMessage">{successMessage}</p>} {/* Display error message if exists */}
                        </div>
                    </div>
                </form>
            </div>
            <div id="id02" className={stylePassword}>
                <span onClick={changeStylePassword} className="close" title="Close Modal">&times;</span>
                <form className="modal-content">
                    <div className="infoContainer">
                        <h1>Change Password</h1>
                        <label htmlFor="currentPassword">Enter Current Password: </label>
                        <input                             
                            type="password" 
                            className="updateForm" 
                            id="currentPassword" 
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)} 
                        />
                    </div>
                    <div className="infoContainer">
                        <label htmlFor="newPassword">Enter New Password: </label>
                        <input 
                            type="password" 
                            className="updateForm" 
                            id="newPassword" 
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="infoContainer">
                        <label htmlFor="verifyPassword">Re-enter New Password: </label>
                        <input 
                            type="password" 
                            className="updateForm" 
                            id="verifyPassword" 
                            value={verifyPassword}
                            onChange={e => setVerifyPassword(e.target.value)}
                        />
                        <div className="clearfix">
                            <button type="button" className="btn" onClick={changeStylePassword}>Cancel</button>
                            <button type="button" className="btn" onClick={updatePassword}>Update</button>
                        </div>
                        {errorMessage && <p className="errorMessage">{errorMessage}</p>} {/* Display error message if exists */}
                    </div>
                </form>
            </div>
            <div className="welcome-widget" style={{height:"99%"}}>
                <h1 className="font-karla">Account Information</h1>
                <div className="infoContainer" style={{marginTop:"10vh"}}>
                    <table>
                        <tbody>
                            <tr>
                                <th>Name</th>
                                <td>{userData.NAME}</td>
                                <td>
                                    <div className="inputContainer">
                                        <label htmlFor="settingsName">New Name: </label>
                                        <input 
                                            className="updateForm" 
                                            type="text" 
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)} 
                                            id="settingsName" 
                                            style={{width:"200px"}}
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th>Address</th>
                                <td>{userData.ADDRESS}</td>
                                <td>
                                    <div className="inputContainer">
                                        <label htmlFor="settingsAddress">New Address: </label>
                                        <input 
                                            className="updateForm" 
                                            type="text" 
                                            value={newAddress}
                                            onChange={e => setNewAddress(e.target.value)} 
                                            id="settingsAddress" 
                                            style={{width:"200px"}}
                                        />                                    
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th>Email</th>
                                <td>{userData.EMAIL}</td>
                                <td>
                                    <div className="inputContainer">
                                        <label htmlFor="settingsEmail">New Email: </label>
                                        <input 
                                            className="updateForm" 
                                            type="email" 
                                            value={newEmail}
                                            onChange={e => setNewEmail(e.target.value)} 
                                            id="settingsEmail" 
                                            style={{width:"200px"}}
                                        />                                    
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th>Birthday</th>
                                <td>{userData.BIRTHDAY}</td>
                                <td>
                                    <div className="inputContainer">
                                        <label htmlFor="settingsBirthday">New Birthday: </label>
                                        <input 
                                            className="updateForm" 
                                            type="date" 
                                            value={newBirthday}
                                            onChange={e => setNewBirthday(e.target.value)} 
                                            id="settingsBirthday" 
                                            style={{width:"200px"}}
                                        />                                    
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th>Username</th>
                                <td>{userData.USERNAME}</td>
                                <td>
                                    <div className="inputContainer">
                                        <label htmlFor="settingsUsername">New Username: </label>
                                        <input 
                                            className="updateForm" 
                                            type="text" 
                                            value={newUsername}
                                            onChange={e => setNewUsername(e.target.value)} 
                                            id="settingsUsername" 
                                            style={{width:"200px"}}
                                        />                                    
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th>Password</th>
                                <td>************</td>
                                <td>
                                    <button onClick={changeStylePassword}>Update</button>
                                    {successMessage && <p className="successMessage">{successMessage}</p>} {/* Display error message if exists */}
                                </td>
                            </tr>
                            <tr>
                                <th>MFA Setup</th>
                                <td id="totkKey">************</td>
                                <td>
                                    <button onClick={createMFA}>Setup MFA</button>
                                    {MFASuccessMessage && <p className="MFASuccessMessage">{MFASuccessMessage}</p>} {/* Display error message if exists */}
                                </td>
                            </tr>
                            <tr>
                                <th>Bio</th>
                                <td>{userData.BIO}</td>
                                <td>
                                    <div className="inputContainer">
                                        <label htmlFor="settingsBio">New Bio: </label>
                                        <input 
                                            className="updateForm" 
                                            type="text" 
                                            value={newBio}
                                            onChange={e => setNewBio(e.target.value)} 
                                            id="settingsBio" 
                                            style={{width:"200px"}}
                                        />                                    
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <button 
                    className="btn" 
                    onClick={handleClick}
                    >Save Changes</button>
                <button className="deletebtn" onClick={changeStyleDelete}>Delete Account</button>
            </div>
        </div>
    )
}

export default AccountSettingsForm  