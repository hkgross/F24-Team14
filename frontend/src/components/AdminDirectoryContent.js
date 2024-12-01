import { useState } from "react";
import useGetDirectory from "../hooks/useGetDirectory";
import axios from "axios";

// NOTE: get directory to show results of new directory instead.

export default function AdminDirectoryContent () {
    const { directory, loading, error } = useGetDirectory();
    const [editingUser, setEditingUser] = useState(null);  
    const [updatedInfo, setUpdatedInfo] = useState({});
    const [saveError, setSaveError] = useState('');
    const [saveMessage, setSaveMessage] = useState('');

    const [directoryUpdate, setDirectoryUpdate] = useState(null);
    // Loading
    if (loading) {
        return <h1>Loading...</h1>
    }

    // Error
    if (error) {
        return <h1>{error}</h1>
    }

    //setDirectoryUpdate(directory);

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
                account_bio_display: updatedInfo.BIO,
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

    // Apply filters
    function applyFilters(e) {
        e.preventDefault();

        // Get query params from form
        const formData = new FormData(e.target);
        const name = formData.get("search");
        const type = formData.get("type");

        // Get token
        const storedUser = localStorage.getItem("user");
        const userData = JSON.parse(storedUser);
        const accessToken = userData.access;

        var hostname=window.location.hostname;

        // Axios post request
        const response = axios.post('http://'+hostname+':8000/' + 'api/directory/', 
            { 
                Name: name,
                Type: type
            }, 
            { headers: {
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then(response => {
                setDirectoryUpdate(response.data);
            })
            .catch(error => {
                console.error(error)
            })
    }

    // Display directory
    const directoryData = directoryUpdate || directory;


    return (
        <div className="font-karla dashboard">
            <div className="main-dash-container">
                <h1>Directory</h1>
                <div>
                    <form onSubmit={applyFilters} className="filters basic-flex">
                        <div className="filter-field">
                            <label for="search">Search User: </label>
                            <input type="text" placeholder="Enter name..." name="search"></input>
                        </div>
                        <div className="filter-field">
                            <label for="type">Filter User Type: </label>
                            <select name="type">
                                <option value="" defaultValue>Select account type</option>
                                <option value="driver">Driver</option>
                                <option value="sponsor">Sponsor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="filter-field">
                            <button type="submit">Go</button>
                        </div>
                    </form>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>ID</th>
                            <th>User Type</th>
                            <th>Status</th>
                            <th>Bio</th>
                            <th>Organization</th>
                        </tr>
                    </thead>
                    <tbody>
                        {directoryData.map((entry) => (
                            <tr key={entry.ACCOUNT_ID}>
                                <td>{entry.NAME}</td>
                                <td>{entry.ACCOUNT_ID}</td>
                                <td>{entry.account_status_display}</td>
                                <td>{entry.account_type_display}</td>
                                <td>{entry.BIO}</td>
                                <td>{entry.ACC_SPONSOR_ID}</td>
                                {entry.account_type_display === 'Driver' && (
                                    <td>
                                        <button onClick={() => handleEditClick(entry)}>Edit</button>
                                    </td>
                                )}
                                {entry.account_type_display === 'Sponsor' && (
                                    <td>
                                        <button onClick={() => handleEditClick(entry)}>Edit</button>
                                    </td>
                                )}
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
                            <select
                                name="account_type_display"
                                value={updatedInfo.account_type_display || ""}
                                onChange={handleChange}
                            >
                                <option value="Driver">Driver</option>
                                <option value="Sponsor">Sponsor</option>
                                <option value="Admin">Admin</option>
                            </select>
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
                        <label>
                            Bio:
                            <input
                                type="text"
                                name="BIO"
                                value={updatedInfo.BIO || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <button onClick={handleSubmit}>Save</button>
                        <button onClick={() => setEditingUser(null)}>Cancel</button>
                    </div>
                )}
            </div>
        </div>
    )
}