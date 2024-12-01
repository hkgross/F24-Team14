import useGetAuditLog from "../hooks/useGetAuditLog";
import useGetDriverPoints from "../hooks/useGetDriverPoints";
import useGetSales from "../hooks/useGetSales";
import React, { useState } from 'react';
import axios from "axios";
import useGetSalesBySponsor from "../hooks/useGetSalesBySponsor";
import useDjangoData from '../hooks/useDjangoData';
import useGetInvoice from "../hooks/useGetInvoice";
import useGetDriverSales from "../hooks/useGetDriverSales";


export default function AdminAuditLog() {
    const { audit, loading: loading1, error: error1 } = useGetAuditLog();
    const { pointsLog, loading: loading2, error: error2 } = useGetDriverPoints();
    const { sponsorSalesLog, loading: loading3, error: error3 } = useGetSalesBySponsor();
    const [visible, setVisible] = useState(null);
    const [pointsUpdate, setPointsUpdate] = useState(null);
    const [auditUpdate, setAuditUpdate] = useState(null);
    const [sponsorSalesUpdate, setSponsorSalesUpdate] = useState(null);
    const [driverSalesUpdate, setDriverSalesUpdate] = useState(null);
    const {data: sponsors, loading: loading4, error4} = useDjangoData('api/sponsors/');
    const [selectedSponsor, setSponsor] = useState(null);
    const [invoiceUpdate, setInvoiceUpdate] = useState(null);
    const { invoiceLog, loading: loading5, error: error5 } = useGetInvoice();
    const { driverSalesLog, loading: loading6, error: error6 } = useGetDriverSales();

    // Check both hooks 
    const isLoading = loading1 || loading2 || loading3 || loading4 || loading5 || loading6;

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
    if (error4) {
        return <h1>{error4}</h1>
    }
    if (error5) {
        return <h1>{error5}</h1>
    }
    if (error6) {
        return <h1>{error6}</h1>
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
        // sales by driver
        if (visible === 'driver_sales') {
            const name = formData.get('search');
            const sponsor = selectedSponsor;
            const start = formData.get('start-date');
            const end = formData.get('end-date');
            const type = formData.get("report-type");

            // Axios post request
            const response = axios.post('http://'+hostname+':8000/' + '/points/sales/driver/', 
                { 
                    Name: name,
                    Sponsor: sponsor === null ? "": sponsor,
                    Start: start,
                    End: end,
                    Type: type
                }, 
                { headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${accessToken}`
                }
            })
                .then(response => {
                    setDriverSalesUpdate(response.data);
                })
                .catch(error => {
                    console.error(error)
                })
        }
        if (visible === 'sponsor_sales') {
            const start = formData.get('start-date');
            const end = formData.get('end-date');
            const sponsor = selectedSponsor;
            const type = formData.get('report-type');

            // Axios post request
            const response = axios.post('http://'+hostname+':8000/' + '/points/sales/sponsor/', 
                { 
                    Sponsor: sponsor === null ? "": sponsor,
                    Start: start,
                    End: end,
                    Type: type
                }, 
                { headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${accessToken}`
                }
            })
                .then(response => {
                    setSponsorSalesUpdate(response.data);
                })
                .catch(error => {
                    console.error(error)
                })
        }
        if (visible === 'invoice') {
            const start = formData.get('start-date');
            const end = formData.get('end-date');
            const sponsor = selectedSponsor;
            // const driver = formData.get('driver')

            // Axios post request
            const response = axios.post('http://'+hostname+':8000/' + '/points/sales/invoice/', 
                { 
                    
                    Sponsor: sponsor === null ? "": sponsor,
                    Start: start,
                    End: end
                }, 
                { headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${accessToken}`
                }
            })
                .then(response => {
                    setInvoiceUpdate(response.data);
                })
                .catch(error => {
                    console.error(error)
                })
        }

    }
    let handleSponsorChange = (e) => {
        setSponsor(e.target.value);
    }
    // Display points
    const pointsData = pointsUpdate || pointsLog;

    // Display audit
    const auditData = auditUpdate || audit;
    const sponsorSalesData = sponsorSalesUpdate || sponsorSalesLog;
    const invoiceData = invoiceUpdate || invoiceLog;

    // Display driver sales
    const driverSalesData = driverSalesUpdate || driverSalesLog;

    return (
        <div className="dashboard font-karla">
            <div className="dash-main-container">
                <div>
                    <button type="button" onClick={() => toggleHidden('audit')}>Audit Log</button>
                    <button type="button" onClick={() => toggleHidden('points')}>Driver Point Tracking</button>
                    <button type="button" onClick={() => toggleHidden('sponsor_sales')}>Sales by Sponsor</button>
                    <button type="button" onClick={() => toggleHidden('driver_sales')}>Sales by Driver</button>
                    <button type="button" onClick={() => toggleHidden('invoice')}>Invoice</button>
                </div>
                {visible && (
                    <button
                        type="button"
                        onClick={() => 
                            visible === 'audit'
                            ? exportCSV('audit_log.csv', auditData)
                            : visible === 'points' 
                            ? exportCSV('points.csv', pointsData)
                            : visible === 'sponsor_sales'
                            ? exportCSV('sponsor_sales.csv', sponsorSalesData)
                            : visible === 'driver_sales'
                            ? exportCSV('driver_sales.csv', driverSalesData)
                            : {}
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
                                    <th>Account_Sponsor ID</th>
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
                                        <td>{entry.HIST_ACC_SPONSOR_ID}</td>
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
                {visible === 'sponsor_sales' && (
                    <div>
                        <form onSubmit={applyFilters} className="filters basic-flex">
                            <select onChange={handleSponsorChange}> 
                                <option value="">Select a Sponsor</option>
                                {sponsors.map((sponsor) => <option value={sponsor.SPONSOR_ID}>{sponsor.NAME}</option>)}
                            </select>
                            <div className="filter-field">
                                <label for="report-type">Report Type:</label>
                                <select name="report-type">
                                    <option value="summary">Summary</option>
                                    <option value="detail">Detail</option>
                                </select>
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
                                    {/* <th>Sponsor ID</th> */}
                                    <th>Sponsor Name</th>
                                    <th>Driver ID</th>
                                    <th>Driver Name</th>
                                    <th>Start of Period</th>
                                    <th>End of Period</th>
                                    <th>Total Sales (USD)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sponsorSalesData.map((entry) => (
                                    <tr key={entry.ID}>
                                        <td>{entry.NAME}</td>
                                        <td>{entry.DRIVER_ID}</td>
                                        <td>{entry.DRIVER_NAME}</td>
                                        <td>{entry.START_DATE}</td>
                                        <td>{entry.END_DATE}</td>
                                        <td>${entry.TOTAL_SALES}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {visible === 'driver_sales' && (
                    <div>
                        <form onSubmit={applyFilters} className="filters basic-flex">
                            <div className="filter-field">
                                <label for="search">Search Driver: </label>
                                <input type="text" placeholder="Enter name..." name="search"></input>
                            </div>
                            <div className="filter-field">
                            <div className="filter-field">
                                <select onChange={handleSponsorChange}> 
                                    <option value="">Select a Sponsor</option>
                                    {sponsors.map((sponsor) => <option value={sponsor.SPONSOR_ID}>{sponsor.NAME}</option>)}
                                </select>
                            </div>
                            <div className="filter-field">
                                <label for="report-type">Report Type:</label>
                                <select name="report-type">
                                    <option value="summary">Summary</option>
                                    <option value="detail">Detail</option>
                                </select>
                            </div>    
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
                                    <th>Sponsor Name</th>
                                    <th>Driver Name</th>
                                    <th>Start of Period</th>
                                    <th>End of Period</th>
                                    <th>Total Sales (USD)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {driverSalesData.map((entry) => (
                                    <tr key={entry.ID}>
                                        <td>{entry.NAME}</td>
                                        <td>{entry.DRIVER}</td>
                                        <td>{entry.START_DATE}</td>
                                        <td>{entry.END_DATE}</td>
                                        <td>${entry.TOTAL_SALES}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {visible === 'invoice' && (
                    <div>
                        <form onSubmit={applyFilters} className="filters basic-flex">
                            <select onChange={handleSponsorChange}> 
                                <option value="">Select a Sponsor</option>
                                        {/* Mapping through each fruit object in our fruits array
                                    and returning an option element with the appropriate attributes / values.
                                    */}
                                {sponsors.map((sponsor) => <option value={sponsor.SPONSOR_ID}>{sponsor.NAME}</option>)}
                            </select>
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
                                    {/* <th>Sponsor ID</th> */}
                                    <th>Sponsor</th>
                                    <th>Driver</th>
                                    <th>Start of Period</th>
                                    <th>End of Period</th>
                                    <th>Total Fee Due (USD)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceData.map((entry) => (
                                    <tr key={entry.INVOICE_ID}>
                                        <td>{entry.SPONSOR_NAME}</td>
                                        <td>{entry.ACCOUNT_NAME}</td>
                                        <td>{entry.START_DATE}</td>
                                        <td>{entry.END_DATE}</td>
                                        <td>${entry.TOTAL_FEE}</td>
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