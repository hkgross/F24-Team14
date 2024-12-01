import { useState } from 'react';
import useGetDirectory from "../hooks/useGetDirectory";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";

export default function CompanyDirectory() {
    const { directory, loading, error } = useGetDirectory();
    const [editingUser, setEditingUser] = useState(null);  
    const [updatedInfo, setUpdatedInfo] = useState({});    
    const [saveError, setSaveError] = useState('');
    const [saveMessage, setSaveMessage] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    var hostname=window.location.hostname;

    if (loading) {
        return <h1>Loading...</h1>;
    }

    if (error) {
        return <h1>{error}</h1>;
    }

    const handleEditClick = (user) => {
        setEditingUser(user);
        setUpdatedInfo(user);  // Initialize form with the current user data
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaveMessage('');  
        setSaveError(''); 
        
        try {
            const hostname = window.location.hostname;
            const response = await axios.put(`http://${hostname}:8000/authentication/users/`,{  
                ACCOUNT_ID: editingUser.ACCOUNT_ID,  
                NAME: updatedInfo.NAME,  
                account_type_display: updatedInfo.account_type_display,  
                account_status_display: updatedInfo.account_status_display,  // Include the status field
            }, {
                headers: {
                    'Content-Type': 'application/json', 
                },
            });
            
            setSaveMessage(response.data.message);
            setEditingUser(null);  // Optionally close the form after successful update
            window.location.reload();  // Reload the page to reflect changes
        } catch (error) {
            console.error('Error:', error);
            setSaveError(error.response?.data.message || 'Failed to update user');
        }
    };

    // Select driver to take control of
    const handleSelectDriver = async (e) => {
        try {
            // Get token from local storage
            const storedUser = localStorage.getItem("user");
            const user = JSON.parse(storedUser);
            const accessToken = user.access;

            const response = await axios.post("http://"+hostname+":8000/authentication/control/", {
                driver: e.ACCOUNT_ID
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })

            // Success
            if (response.status === 200 && response.data.success) {
                login(response.data);
                navigate('/dashboard/');
            }
        }
        catch (error) {
            console.error("error: ", error);
        }
    };

    return (
        <div className="font-karla dashboard">
            <div className="dash-main-container">
                <h1>Directory</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>ID</th>
                            <th>User Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                            <th>Control</th>
                        </tr>
                    </thead>
                    <tbody>
                        {directory.map((entry) => (
                            <tr key={entry.ACCOUNT_ID}>
                                <td>{entry.NAME}</td>
                                <td>{entry.ACCOUNT_ID}</td>
                                <td>{entry.account_type_display}</td>
                                <td>{entry.account_status_display}</td>
                                {entry.account_type_display === 'Driver' && (
                                    <td>
                                        <button onClick={() => handleEditClick(entry)}>Edit</button>
                                    </td>
                                )}
                                {entry.account_type_display === 'Driver' && 
                                entry.account_status_display === 'Active' && (
                                        <td>
                                            <button onClick={() => handleSelectDriver(entry)}>Select</button>
                                        </td>
                                    )
                                }
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Display the edit form if a user is being edited */}
                {editingUser && (
                    <div className="edit-form">
                        <h2>Edit User</h2>
                        <label>
                            Name:
                            <input
                                type="text"
                                name="NAME"
                                value={updatedInfo.NAME || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            User Type:
                            <input
                                type="text"
                                name="account_type_display"
                                value={updatedInfo.account_type_display || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Status:
                            <select
                                name="account_status_display"
                                value={updatedInfo.account_status_display || ""}
                                onChange={handleChange}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </label>
                        <button onClick={handleSubmit}>Save</button>
                        <button onClick={() => setEditingUser(null)}>Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
}