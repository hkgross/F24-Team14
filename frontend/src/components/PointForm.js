import useGetDriver from "../hooks/useGetDrivers";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PointsForm() {
    const { drivers, loading, error } = useGetDriver();
    const [driver, setDriver] = useState("");
    const [points, setPoints] = useState("");
    const [reason, setReason] = useState("");
    const [message, setMessage] = useState("");

    // Loading
    if (loading) {
        return <h1>Loading...</h1>
    }


    // Error
    if (error) {
        return <h1>{error}</h1>
    }

    const onDriverSelect = (e) => {
        const driverID = e.target.value;
        setDriver(driverID);
    }

    // Handle form submission
    const handlePointForm = async(e) => {
        e.preventDefault();

        try {
            // Get token
            const storedUser = localStorage.getItem("user");
            const userData = JSON.parse(storedUser);
            const accessToken = userData.access;

            // Send 
            var hostname=window.location.hostname;
            const response = await axios.post('http://'+hostname+':8000/' + 'points/', {
                user: driver,
                points: points,
                reason: reason
            }, {
                headers: {'Content-Type': 'application/json', 
                            'Authorization': `Bearer ${accessToken}`
                }
            })

            console.log(driver);

            await axios.post(`http://${hostname}:8000/notifications/updatePointsNot/`,
                {
                    user: driver
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    },
                }
            );
            
            // Feedback for user
            setMessage("Points have been updated");

            // Reset
            setDriver("");
            setPoints("");
            setReason("");

        }
        catch (error) {
            console.error("error: ", error);
            setMessage("Points failed to update");
        }
    }

    return (
        <div className="dashboard font-karla">
            <div className="dash-main-container">
                {message && <h2>{message}</h2>}
                <form onSubmit={handlePointForm}>
                    <div>
                        <h1>Points Form</h1>
                    </div>
                    <fieldset>
                        <legend>Employee</legend>
                        <div className="form-field">
                            <label for="employees">Select a Driver</label>
                            {drivers.length > 0 ? (
                                <select onChange={onDriverSelect} required value={driver}>
                                    <option value="" disabled>Select a driver</option>
                                    {drivers.map((driver) => (
                                        <option key={driver.ACCOUNT_ID} value={driver.ACCOUNT_ID}>
                                            {driver.NAME}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p>No drivers</p>
                            )}
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>Point Change</legend>
                        <div className="form-field">
                            <label for="point_value">Points: </label>
                            <input required type="number" name="point_value" placeholder="Enter an amount" onChange={e => {setPoints(e.target.value)}}></input>
                        </div>
                        <div className="form-field">
                            <label for="reason">Reason for Change: </label>
                            <textarea required name="reason" rows="4" cols="50" onChange={e => {setReason(e.target.value)}}></textarea>
                        </div>
                    </fieldset>
                    <input className="form-btn" type="submit" value="Submit"></input>
                </form>
            </div>
        </div>
    )
}