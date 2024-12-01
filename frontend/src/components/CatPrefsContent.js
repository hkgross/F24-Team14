import useGetDriver from "../hooks/useGetDrivers";
import React, { useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function CatPrefsContent() {
    let { id } = useParams();  // 'id' corresponds to 'sponsor_id' in URL
    const { drivers, loading, error } = useGetDriver();
    const [media, setMedia] = useState("");
    const [explicit, setExplicit] = useState("");
    const [message, setMessage] = useState("");
    const [disabled, setDisabled] = useState(false);

    // Loading
    if (loading) {
        return <h1>Loading...</h1>
    }


    // Error
    if (error) {
        return <h1>{error}</h1>
    }

    const onMediaSelect = (e) => {
        const driverID = e.target.value;
        setMedia(driverID);
    }

    // Handle form submission
    const handlePrefsForm = async(e) => {
        setDisabled(true);
        e.preventDefault();

        try {
            // Get token
            const storedUser = localStorage.getItem("user");
            const userData = JSON.parse(storedUser);
            const accessToken = userData.access;

            const hostname = window.location.hostname;
            
            // console.log("Data to submit:", data);
            
            const response = await axios.patch(`http://${hostname}:8000/catalog/prefs/${id}/`,
                {
                    token: accessToken,
                    media_type: media,
                    explicit: explicit
                }, {
                headers: {'Content-Type': 'application/json', 
                            'Authorization': `Bearer ${accessToken}`
                }
            })


            // Feedback for user
            setMessage("Prefs have been updated");

            // Reset
            setMedia("");
            setExplicit("");

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
                <form onSubmit={handlePrefsForm}>
                    <div>
                        <h1>Prefs Update</h1>
                    </div>
                        <div className="form-field">
                            <label for="media">Select a media type for the catalog:</label>
                            {
                                <select onChange={onMediaSelect}>
                                    <option value="" disabled>Select a media type</option>
                                    <option key={1} value={'all'}>
                                        {'all'}
                                    </option>
                                    <option key={2} value={'podcast'}>
                                        {'podcast'}
                                    </option>
                                    <option key={3} value={'music'}>
                                        {'music'}
                                    </option>
                                    <option key={4} value={'musicVideo'}>
                                        {'musicVideo'}
                                    </option>
                                    <option key={5} value={'audiobook'}>
                                        {'audiobook'}
                                    </option>
                                    <option key={6} value={'shortFilm'}>
                                        {'shortFilm'}
                                    </option>
                                    <option key={7} value={'tvShow'}>
                                        {'tvShow'}
                                    </option>
                                    <option key={8} value={'ebook'}>
                                        {'ebook'}
                                    </option>
                                    <option key={9} value={'movie'}>
                                        {'movie'}
                                    </option>
                                </select>}
                        </div>
                        <div className="form-field">
                            <label for="explicit">Explicit? </label>
                            <input type="checkbox" name="explicit" onChange={e => {setExplicit(e.target.value)}}></input>
                        </div>
                    <input disabled={disabled} className="form-btn" type="submit" value="Submit"></input>
                </form>
            </div>
        </div>
    )
}