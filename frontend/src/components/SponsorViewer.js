import React, { useEffect, useState } from "react";
import axios from "axios";
import './CSS/SponsorViewer.css';
export default function SponsorViewer() {
    const [sponsors, setSponsors] = useState([]); 
    const [selectedSponsor, setSelectedSponsor] = useState(null); 
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                const hostname = window.location.hostname;
                const response = await axios.get(`http://${hostname}:8000/api/sponsors/`);
                setSponsors(response.data);
            } catch (error) {
                console.error("Error fetching sponsors:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSponsors();
    }, []);
    const handleSponsorClick = (sponsor) => {
        setSelectedSponsor(sponsor);
    };
    const filteredSponsors = sponsors.filter((sponsor) =>
        sponsor.NAME.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (loading) {
        return <h1>Loading...</h1>;
    }
    return (
        <div className="sponsor-viewer">
            <h1>Sponsors</h1>
            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search sponsors by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-bar"
            />
            {/* Sponsor List */}
            <ul className="sponsor-list">
                {filteredSponsors.map((sponsor) => (
                    <li
                        key={sponsor.SPONSOR_ID}
                        onClick={() => handleSponsorClick(sponsor)}
                        className="sponsor-item"
                    >
                        {sponsor.NAME}
                    </li>
                ))}
            </ul>
            {/* Sponsor Details */}
            {selectedSponsor && (
                <div className="sponsor-details">
                    <h2>Sponsor Details</h2>
                    <p><strong>ID:</strong> {selectedSponsor.SPONSOR_ID}</p>
                    <p><strong>PT Value:</strong> {selectedSponsor.PT_VALUE}</p>
                    <p><strong>Description:</strong> {selectedSponsor.DESCRIPTION}</p>
                    <p><strong>Creation Date:</strong> {selectedSponsor.CREATION_DATE}</p>
                    <button onClick={() => setSelectedSponsor(null)} className="close-button">
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}