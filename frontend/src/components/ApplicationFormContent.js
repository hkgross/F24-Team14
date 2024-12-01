import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useDjangoData from '../hooks/useDjangoData';
import { useAuth } from "../hooks/AuthProvider";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export default function ApplicationFormContent() {
	const navigate = useNavigate();
	let { id } = useParams();  // 'id' corresponds to 'sponsor_id' in URL
	const { data: sponsordata, loadingsponsor, error } = useDjangoData('applications/' + id);
	const [hiringDesc, setHiringDesc] = useState("");
	const { user, fetchUserInfo, refreshAccessToken } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
	const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
	const [error2, setError] = useState('');
	const [disabled, setDisabled] = useState(false);

	

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

	
	
	// const sponsorId = this.props.match.id
	
	// const { user } = useAuth();
	const userid= userData.ACCOUNT_ID;
	const userEmail = userData.EMAIL;

	if (loadingsponsor) return console.log("loading...");
	if (error) return console.error(error.message);
	if (!sponsordata) return console.log("no data");
	let sponsorName = sponsordata.sponsor
	if(user != null) {
		const handleSubmit = async (e) => {
			setDisabled(true);
			e.preventDefault();
			const data = { 
				HIRING_DESC: hiringDesc, 
				SPONSOR_ID: id, 
				ACCOUNT_ID: userid, 
				USER_EMAIL: userEmail 
			};

			console.log("User ID:", userid);
			console.log("User Email:", userEmail);
			console.log("Hiring Description:", hiringDesc);
			
			try {
				const hostname = window.location.hostname;
				const csrfToken = getCsrfToken();
				
				console.log("Data to submit:", data);
				console.log("CSRF Token:", csrfToken);
				
				const response = await axios.post(`http://${hostname}:8000/applications/${id}/`, data, {
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': csrfToken,
					}
				});
				
				if (response.status === 200) {
					alert('Your application has been submitted successfully! Confirmation email sent to you!');
					navigate(`/`);
				} else {
					console.error('Error submitting the application');
				}
				
			} catch (error) {
				console.error('Error:', error);
			}
		};

	// const handleSubmitAgain = async (e) => {
    //     e.preventDefault();
    //     setMessage('');  

    //     try {
    //         const response = await axios.post('http://localhost:8000/authentication/application-choice/', {
    //             email: email,
    //         });
    //         console.log(response.data);
    //         setMessage(response.data.message); // Set success message

    //     } catch (error) {
    //         console.error('Error:', error);
    //         setError(error.response?.data.error || 'An unexpected error occurred'); // Set error message

    //     }
    // };

	return (
		<form onSubmit={handleSubmit}>
			<p>Submitting Application for Sponsor: {sponsorName}</p>
			<label htmlFor="desc">Why do you think you should be accepted to the rewards program?:</label><br />
			<input
				type="text"
				id="desc"
				name="desc"
				value={hiringDesc}
				onChange={(e) => setHiringDesc(e.target.value)}
			/><br />
			<input disabled={disabled} type="submit" value="Submit" />
		</form>
	);
}
else{
	return <h>Please login!</h>
}
};

// Helper function to get CSRF token
const getCsrfToken = () => {
	const cookieValue = document.cookie
		.split('; ')
		.find((row) => row.startsWith('csrftoken='))
		?.split('=')[1];
	return cookieValue || '';
};
