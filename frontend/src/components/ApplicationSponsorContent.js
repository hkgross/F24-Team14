import React, { useEffect, useState } from "react";
import useDjangoData from '../hooks/useDjangoData';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

export default function ApplicationFormContent() {
    const navigate = useNavigate();
    const { data: applications, loading, error } = useDjangoData('applications/sponsor/');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
	const [error2, setError] = useState('');

    if (loading) return console.log("loading...");
    if (error) return console.error(error.message);
    if (!applications) return console.log("no data");
    console.log(applications);

    

    const handleApplicationAction = async (e, email, action) => {
        e.preventDefault();
        setMessage('');
        setError('');
    
        try {
            const response = await axios.post('http://localhost:8000/applications/application-choice/', {
                email: email,
                action: action, // Pass the action (accept or reject)
            });
            console.log(response.data);
            setMessage(response.data.message);
        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data.error || 'An unexpected error occurred');
        }
    };

    const listItems = applications.map(application =>
        <li>
            <div class="card_sponsor">
                <div class="container">
                    <div class='flexbox-container-sponsor'>
                        <div>
                            <h4><b>{'User ID: ' + application.ACCOUNT_ID_id}</b></h4>
                            <h4><b>{'User Email: ' + application.USER_EMAIL}</b></h4>
                            <p>{application.HIRING_DESC}</p>
                            <>{'Status: ' + application.STATUS}</>
                            <form onSubmit={(e) => handleApplicationAction(e, application.USER_EMAIL, 'accept')}>
                                <input type="submit" value="Accept" />
                            </form>
                            <form onSubmit={(e) => handleApplicationAction(e, application.USER_EMAIL, 'reject')}>
                                <input type="submit" value="Reject" />
                            </form>
                        </div>
                        <div>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    )
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
