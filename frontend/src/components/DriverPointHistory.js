import useGetDriverPoints from "../hooks/useGetDriverPoints"

export default function DriverPointHistory() {
    const { pointsLog, loading, error } = useGetDriverPoints();
    
    // Loading
    if (loading) {
        return <h1>Loading...</h1>
    }

    // Error
    if (error) {
        return <h1>{error}</h1>
    }

    const history = pointsLog?.history || [];

    return (
        <div className="font-karla dashboard">
            <div className="dash-main-container">
                <h1>Current Points: {pointsLog.points}</h1>
                <br></br>
                <h1>Points History</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Point Change</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Item ID</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((entry) => (
                            <tr key={entry.HISTORY_ID} >
                                <td>{entry.POINT_CHANGE}</td>
                                <td>{entry.POINT_CHANGE_DATE}</td>
                                <td>{entry.STATUS}</td>
                                <td>{entry.ITEM_ID}</td>
                                <td>{entry.REASON}</td>
                            </tr>
                        ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}