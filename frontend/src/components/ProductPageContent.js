import React, { useEffect, useState } from 'react';
import Item from './Item';
import "./CSS/Catalog.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import useDjangoData from '../hooks/useDjangoData';
import useGetDriverPoints from '../hooks/useGetDriverPoints';
import { useAuth } from "../hooks/AuthProvider"; 


export default function CatalogContent() {
    const [data, setData] = useState(null);
    const [loadingapps, setLoadingapps] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const { data: sponsors, loading, error2 } = useDjangoData('api/sponsors/');
    // const [selectedSponsor, setSponsor] = useState(null);
    const { pointsLog, loading2, error3 } = useGetDriverPoints();
    const { user } = useAuth();

    


    const handlePurchase = async (e, sponsor) => {
        
            e.preventDefault();
            // setMessage('');
            // setError('');
            // Check if there is a current user in local storage
            const storedUser = localStorage.getItem("user");
            if (!storedUser) {
                return null;
            }

            // Get access token
            const userData = JSON.parse(storedUser);
            const accessToken = userData.access;
            const userName = userData.user;
            try {
                var hostname = window.location.hostname;
                const response = await axios.post('http://' + hostname + ':8000/catalog/' + id + '/', {
                    token: accessToken,
                    sponsor: searchParams.get('sponsor')
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });

            // Success
            if (response.status === 202) {
                alert("Success! Product has been added to your iTunes account (if this were a real product)");
                const hostname = window.location.hostname;
                const response = await axios.post('http://' + hostname + ':8000/notifications/updatePurchaseNot/', {
                userName: userName,
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
                return response.data;
            }
            else {
                alert("Error: ", response.status);
                console.error("Error: ", response.status);
                const hostname = window.location.hostname;
                const response = await axios.post('http://' + hostname + ':8000/notifications/updatePurchaseErrorNot/', {
                userName: userName,
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
                return null;
            }

            } catch (error) {
                alert("Error: " + error.response.data.error);
                console.error("Error: ", error);
                return null;
            }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                var hostname = window.location.hostname;
                const response = await axios.get('http://' + hostname + ':8000/catalog/' + id + '?sponsor=' + searchParams.get('sponsor'),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCsrfToken(),
                        }
                    });
                // Remove
                // console.log(response.data);
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
    }, []);

    

    if (loading) return (<h1>Loading</h1>);
    if (error2) return console.error(error.message);
    if (!sponsors) return console.log("no data");
    console.log(sponsors);
    console.log(pointsLog);
    let pointsTotal = 0;
    if(pointsLog["total"]) {
        for(var i = 0; i < sponsors.length; i++){
            if(sponsors[i]["SPONSOR_ID"] == searchParams.get('sponsor')) {
                pointsTotal = pointsLog["total"][sponsors[i]["NAME"]];
            }
        }
    }
    if (data != null) {
        let product = data.results[0];
        return <div>



            <div>
                <h3>Points: {pointsTotal}</h3>
                <div style={{ width: '50%', display: 'table', marginLeft: '20%', marginRight: '40%' }}>
                    <div style={{ display: 'table-row', verticalAlign: 'top' }}>
                        <div style={{ display: 'table-cell', verticalAlign: 'top' }}> <img src={product.artworkUrl100.slice(0, -13) + '600x600bb.jpg'} alt={product.trackName} /> </div>
                        <div style={{ display: 'table-cell', verticalAlign: 'middle', paddingLeft: '5%' }}>
                            <h1>{product.trackName}</h1>
                            <h2>{product.artistName}</h2>
                            <div>{product.kind}</div>
                            {/* .01 needs to be changed to get diff point value from sponsor */}
                            <h3>Point Cost: {product.trackPrice / .01}</h3>
                            <h3>Points remaining if purchased: {pointsTotal - (product.trackPrice / .01)}</h3>
                            {/* CHANGE THIS */}
                            <form onSubmit={(e) => handlePurchase(e, 2)}>
                                <input type="submit" value="Purchase" />
                            </form>
                            <div className="card-text">{product.longDesc}</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>;
    }
    else {
        return <div></div>;
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
