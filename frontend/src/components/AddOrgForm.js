import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AddOrgForm() {
    const [message, setMessage] = useState("");


    // Handle form submit
    function handleForm(e) {
        e.preventDefault();

        // Get data from form
        const formData = new FormData(e.target);
        const name = formData.get('org-name');
        const description = formData.get('description');
        const points = formData.get('points');

        // Get token
        const storedUser = localStorage.getItem("user");
        const userData = JSON.parse(storedUser);
        const accessToken = userData.access;

        var hostname=window.location.hostname;

        // Axios request
        const response = axios.post('http://'+hostname+':8000/api/create-sponsor/', 
            {
                Name: name,
                Description: description,
                Points: points
            },
            { headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => {
            // Feedback for user
            setMessage("New sponsor has been created");
        })
        .catch(error => {
            console.error(error);
            setMessage("Failed to create new sponsor");
        })

    }

    return (
        <div className="dashboard font-karla">
            <div className="dash-main-container">
                <h1>Add Sponsor Organization</h1>
                {message && <h2>{message}</h2>}
                <form onSubmit={handleForm}>
                    <div className="form-field">
                        <label for="org-name">Sponsor Organization Name: </label>
                        <input required type="text" placeholder="Enter name..." name="org-name"></input>
                    </div>
                    <div className="form-field">
                        <label for="description">Sponsor Description: </label>
                        <textarea required name="description" rows="4" cols="50" placeholder="Enter description..."></textarea>
                    </div>
                    <div className="form-field">
                        <label for="points">Point Value:</label>
                        <input type="number" name="points" max="1" min="0" step="0.01"></input>
                    </div>
                    <div className="form-field">
                        <button type="submit">Go</button>
                    </div>
                </form>
            </div>
        </div>
    )
}