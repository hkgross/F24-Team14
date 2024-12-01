import useGetAuditLog from "../hooks/useGetAuditLog";
import useGetDriverPoints from "../hooks/useGetDriverPoints";
import useGetSales from "../hooks/useGetSales";
import React, { useState } from 'react';
import axios from "axios";

export default function SponsorAuditLog() {
    const { audit, loading: loading1, error: error1 } = useGetAuditLog();
    const { pointsLog, loading: loading2, error: error2 } = useGetDriverPoints();
    const { salesLog, loading: loading3, error: error3 } = useGetSales();
    const [visible, setVisible] = useState(null);
    const [pointsUpdate, setPointsUpdate] = useState(null);
    const [auditUpdate, setAuditUpdate] = useState(null);

    // Check both hooks 
    const isLoading = loading1 || loading2 || loading3;

    // Loading
    if (isLoading) {
        return <h1>Loading...</h1>
    }

    // Error
    if (error1) {
        return <h1>{error1}</h1>
    }
    if (error2) {
        return <h1>{error2}</h1>
    }
    if (error3) {
        return <h1>{error3}</h1>
    }
    

    // Toggle between audit report and points log
    const toggleHidden = (e) => {
        setVisible(visible === e ? null : e);
    }

    // Export
    const exportCSV = (filename, data) => {
        // Make CSV
        const rows = [];
        const headers = Object.keys(data[0]);
        rows.push(headers.join(','));

        // Loop through data
        for (const row of data) {
            const values = headers.map(header => {
                // Formatting
                const escaped = ('' + row[header]).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            // Combine values to string and push into array
            rows.push(values.join(','));
        }

        // Prep for download
        const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function applyFilters(e) {
        e.preventDefault();

        // Get query params from form
        const formData = new FormData(e.target);

        // Get token
        const storedUser = localStorage.getItem("user");
        const userData = JSON.parse(storedUser);
        const accessToken = userData.access;

        var hostname=window.location.hostname;

        // Points
        if (visible === 'points') {
            const name = formData.get('search');
            const start = formData.get('start-date');
            const end = formData.get('end-date');

            // Axios post request
            const response = axios.post('http://'+hostname+':8000/' + 'points/search/', 
                { 
                    Name: name,
                    Start: start,
                    End: end
                }, 
                { headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${accessToken}`
                }
            })
                .then(response => {
                    setPointsUpdate(response.data);
                })
                .catch(error => {
                    console.error(error)
                })
            }
        
        // Audit
        if (visible === 'audit') {
            const start = formData.get('start-date');
            const end = formData.get('end-date');

            // Axios post request
            const response = axios.post('http://'+hostname+':8000/' + 'audit/', 
                { 
                    Start: start,
                    End: end
                }, 
                { headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${accessToken}`
                }
            })
                .then(response => {
                    setAuditUpdate(response.data);
                })
                .catch(error => {
                    console.error(error)
                })
        }

    }

    // Display points
    const pointsData = pointsUpdate || pointsLog;

    // Display audit
    const auditData = auditUpdate || audit;

    return (
        <div className="dashboard font-karla">
            <div className="dash-main-container">
                <div>
                    <button type="button" onClick={() => toggleHidden('audit')}>Audit Log</button>
                    <button type="button" onClick={() => toggleHidden('points')}>Driver Point Tracking</button>
                    <button type="button" onClick={() => toggleHidden('sales')}>Sales</button>
                </div>
                {visible && (
                    <button
                        type="button"
                        onClick={() => 
                            visible === 'audit'
                            ? exportCSV('audit_log.csv', auditData)
                            : visible === 'points'
                            ? exportCSV('points.csv', pointsData)
                            : exportCSV('sales.csv', salesLog)
                        }
                    >
                        Export to CSV
                    </button>
                )}
                {visible === 'audit' && (
                    <div>
                        <form onSubmit={applyFilters} className="filters basic-flex">
                            <div className="filter-field">
                                <label for="start-date">Start Date:</label>
                                <input type="date" name="start-date" />
                                <br></br>
                                <label for="end-date">End Date:</label>
                                <input type="date" name="end-date" />
                            </div>
                                <div className="filter-field">
                                <button type="submit">Go</button>
                            </div>
                        </form>
                        <table>
                            <thead>
                                <tr>
                                    <th>Entry</th>
                                    <th>Date</th>
                                    <th>Sponsor ID</th>
                                    <th>Account ID</th>
                                    <th>Event Type</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditData.map((entry) => (
                                    <tr key={entry.EVENT_ID}>
                                        <td>{entry.EVENT_ID}</td>
                                        <td>{entry.EVENT_TIME}</td>
                                        <td>{entry.AUDIT_SPONSOR_ID}</td>
                                        <td>{entry.AUDIT_ACCOUNT_ID}</td>
                                        <td>{entry.EVENT_TYPE}</td>
                                        <td>{entry.DESCRIPTION}</td>
                                    </tr>
                                ))
                                }
                            </tbody>
                        </table>
                    </div>
                )}
                {visible === 'points' && (
                    <div>
                        <form onSubmit={applyFilters} className="filters basic-flex">
                            <div className="filter-field">
                                <label for="search">Search Driver: </label>
                                <input type="text" placeholder="Enter name..." name="search"></input>
                            </div>
                            <div className="filter-field">
                                <label for="start-date">Start Date:</label>
                                <input type="date" name="start-date" />
                                <br></br>
                                <label for="end-date">End Date:</label>
                                <input type="date" name="end-date" />
                            </div>
                                <div className="filter-field">
                                <button type="submit">Go</button>
                            </div>
                        </form>
                        <table>
                            <thead>
                                <tr>
                                    <th>Point Change</th>
                                    <th>Date</th>
                                    <th>Driver Name</th>
                                    <th>Status</th>
                                    <th>Item ID</th>
                                    <th>Reason</th>
                                    <th>Sponsor Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pointsData.map((entry) => (
                                    <tr key={entry.HISTORY_ID}>
                                        <td>{entry.POINT_CHANGE}</td>
                                        <td>{entry.POINT_CHANGE_DATE}</td>
                                        <td>{entry.DRIVER_NAME}</td>
                                        <td>{entry.STATUS}</td>
                                        <td>{entry.ITEM_ID}</td>
                                        <td>{entry.REASON}</td>
                                        <td>{entry.SPONSOR_NAME}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {visible === 'sales' && (
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Sale</th>
                                    <th>Date</th>
                                    <th>Driver Name</th>
                                    <th>Status</th>
                                    <th>Item ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesLog.map((entry) => (
                                    <tr key={entry.HISTORY_ID}>
                                        <td>{Math.abs(entry.POINT_CHANGE)}</td>
                                        <td>{entry.POINT_CHANGE_DATE}</td>
                                        <td>{entry.DRIVER_NAME}</td>
                                        <td>{entry.STATUS}</td>
                                        <td>{entry.ITEM_ID}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}