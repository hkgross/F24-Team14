import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useDjangoData from '../hooks/useDjangoData';
import { useAuth } from "../hooks/AuthProvider";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export default function PointValueContent() {
	const navigate = useNavigate();
    const [pointvalue, setPointValue] = useState("");

	
		const handleSubmit = async (e) => {
			e.preventDefault();
			const data = { 
				POINT_VALUE: pointvalue
			};
			
			// try {
			// 	const hostname = window.location.hostname;
			// 	const csrfToken = getCsrfToken();
				
			// 	console.log("Data to submit:", data);
			// 	console.log("CSRF Token:", csrfToken);
				
			// 	const response = await axios.post(`http://${hostname}:8000/`, data, {
			// 		headers: {
			// 			'Content-Type': 'application/json',
			// 			'X-CSRFToken': csrfToken,
			// 		}
			// 	});
				
			// 	if (response.status === 200) {
			// 		navigate(`/`);
			// 	} else {
			// 		console.error('Error submitting the application');
			// 	}
				
			// } catch (error) {
			// 	console.error('Error:', error);
			// }
		};

	return (
		<form onSubmit={handleSubmit}>
			<label htmlFor="desc"></label>Changing Point Conversion Value (e.g. if point value= .01, 1 point is worth 1 cent)<br />
			<input
				type="text"
				id="desc"
				name="desc"
				value={pointvalue}
				onChange={(e) => setPointValue(e.target.value)}
			/><br />
			<input type="submit" value="Submit" />
		</form>
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
