// import React, { useEffect, useState } from "react";
import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import useDjangoData from '../hooks/useDjangoData';
import { useAuth } from "../hooks/AuthProvider";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export default function AppStatusContent() {
    const navigate = useNavigate();
    const { user, fetchUserInfo, refreshAccessToken } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [loadingapps, setLoadingapps] = useState(true);
    const [error, setError] = useState(null);

    // Get data for user
    useEffect(() => {
        const getUserData = async () => {
            try {
                setLoading(true);

                // Refresh in case
                await refreshAccessToken();

                const userData = await fetchUserInfo();
                if (userData) {
                    setUserData(userData);
                    // REMOVE LATER
                    // Check if data received
                    // console.log("data: ", userData);
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
    // REPLACE WHEN SWITCHING FROM DEV AND DEPLOYMENT
    // while(loading){
        
    // };
    useEffect(() => {
        const fetchData = async () => {
            try{
                var hostname = window.location.hostname;
                const response = await axios.post('http://' + hostname + ':8000/applications/status/',
                // const response = await axios.post('http://52.44.88.150:8000/authentication/login', {
                    JSON.stringify({ACCOUNT_ID: userData.ACCOUNT_ID}),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCsrfToken(),
                    }
                });
                // Remove
                console.log(response.data);
                setData(response.data);
            }
            catch (err) {
                console.error(err);
                setError(err);
            }
            finally {
                setLoadingapps(false);
            }
        };
        fetchData();
    }, [userData]);
    let listItems = null;
    if(data != null) {
    listItems = data.map(application =>
        <li>
            <div class="card_sponsor">
                <div class="container">
                    <div class='flexbox-container-sponsor'>
                        <div>
                            <h4><b>{'User ID: ' + application.ACCOUNT_ID_id}</b></h4>
                            <p>{application.HIRING_DESC}</p>
                            <>{'Status: ' + application.STATUS}</>
                        </div>
                        <div>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    )
    }
    return (
        <div>
            {listItems}
        </div>
    );
}

// Helper function to get CSRF token
const getCsrfToken = () => {
	const cookieValue = document.cookie
		.split('; ')
		.find((row) => row.startsWith('csrftoken='))
		?.split('=')[1];
	return cookieValue || '';
};
