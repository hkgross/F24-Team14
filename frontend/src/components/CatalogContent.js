import React, { useEffect, useState } from 'react';
import Item from './Item';
import { useAuth } from '../hooks/AuthProvider';
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import useDjangoData from '../hooks/useDjangoData';
import useGetDriverPoints from '../hooks/useGetDriverPoints';
import "./CSS/Catalog.css";

export default function CatalogContent() {
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchParams] = useSearchParams();
    const { user, fetchAccSponsorInfo, refreshAccessToken } = useAuth();
    const { data: sponsors, loading, error2 } = useDjangoData('api/sponsors/');
    const [selectedSponsor, setSponsor] = useState(null);
    const { pointsLog, loading2, error3 } = useGetDriverPoints();
    const [accSponsorData, setAccSponsorData] = useState(null);
    const [loading3, setLoading3] = useState(true);

    // const [sponsor, setSponsor] = useState(null);

    useEffect(() => {
        const getUserData = async () => {
            try {
                setLoading3(true);

                // Refresh in case
                await refreshAccessToken();

                const data = await fetchAccSponsorInfo();
                if (data) {
                    setAccSponsorData(data);
                    // REMOVE LATER
                    // Check if data received
                    // console.log("data: ", data);
                }
            }
            catch (error) {
                console.error("Error", error);
            }
            finally {
                setLoading3(false);
            }
        };

        getUserData();

    }, []);


    const redirectSearch = () => {
        if (!searchTerm || searchTerm === '') {
            alert('Please enter a search term');
        } else {
            var hostname = window.location.hostname;

            window.location.href = 'http://' + hostname + ':3000/catalog?q=' + searchTerm.replaceAll(' ','+') +'&sponsor=' + selectedSponsor;

            // fetch(url)
            //     .then((response) => response.json())
            //     .then((data) => {
            //         setArtists(data);
            //     })
        }
    };

    let handleSponsorChange = (e) => {
        setSponsor(e.target.value)
    }

    useEffect(() => {
        const fetchData = async () => {
            // Check if there is a current user in local storage
            const storedUser = localStorage.getItem("user");
            if (!storedUser) {
                return null;
            }

            // Get access token
            const userData = JSON.parse(storedUser);
            const accessToken = userData.access;
            // const sponsor = 1;

            // Send token to backend
            if (!searchParams.get('q') || searchParams.get('q') === '' || !searchParams.get('sponsor') || searchParams.get('sponsor') === '') {
                // alert('Please enter a search term');
            } else {
                try {
                    // REPLACE WHEN DEPLOYING
                    var hostname = window.location.hostname;
                    
                    const response = await axios.post(`http://` +hostname+ `:8000/catalog/?q=${searchParams.get('q')}&sponsor=${searchParams.get('sponsor')}`, {
                        //const response = await axios.post('http://localhost:8000/authentication/profile/', {
                        token: accessToken,
                        // sponsor: 2
                    }, {
                        headers: { 'Content-Type': 'application/json' }
                    });
                    // Success
                    if (response.status === 200) {
                        console.log(response);
                        setData(response.data);
                    }
                    else {
                        console.error("Error: ", response.status);
                        // return null;
                    }

                } catch (error) {
                    console.error("Error: ", error);
                    // return null;
                }

            };
        };
        fetchData();
    }, []);
    let userSponsorList = []

    if (accSponsorData != null) {
        // console.log(accSponsorData);
        for (var i = 0; i < sponsors.length; i++) {
            for (var j = 0; j < accSponsorData.length; j++) {
                if (sponsors[i].SPONSOR_ID == accSponsorData[j].SPONSOR_ID) {
                    userSponsorList.push(sponsors[i])
                }
            }
        }
    }

    let itemsArray = []
    if (data != null) {
        itemsArray = data.results.map((item, index) => <a href ={"/catalog/" + item.trackId + '?sponsor=' + searchParams.get('sponsor')}><Item key={index} {...item} /></a>);
    }
    return <div>
        <input
            type="text"
            placeholder={"Enter search term"}
            onChange={e => setSearchTerm(e.target.value)}
        ></input>
        <button className="btn" onClick={(() => redirectSearch())}>Search</button>
        <hr></hr>
        <select value={selectedSponsor == null? searchParams.get('sponsor'):selectedSponsor} onChange={handleSponsorChange}>
                                <option value="">Select a Sponsor</option>
                                {sponsors != null ? userSponsorList.map((sponsor) => <option value={sponsor.SPONSOR_ID}>{sponsor.NAME}</option>): <div></div>}
                            </select>
        <div class="itemliststyle">{itemsArray}</div></div>;
};

// Helper function to get CSRF token
const getCsrfToken = () => {
    const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrftoken='))
        ?.split('=')[1];
    return cookieValue || '';
};
