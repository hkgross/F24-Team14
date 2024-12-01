import React, {useState, useEffect} from 'react';
import dash from "../assets/dashboard.png"
import company from "../assets/company.png"
import catalog from "../assets/catalog.png"
import point from "../assets/point.png"
import notification from "../assets/notification.png"
import settings from "../assets/settings.png"
import logout from "../assets/logout.png"
import { useAuth, refreshAccessToken, fetchAccSponsorInfo} from "../hooks/AuthProvider";


export default function SponsorNav() {
    //console.log(user);
    const { user, refreshAccessToken, fetchAccSponsorInfo} = useAuth();
  const [loading2, setLoading2] = useState(true);
  const [accSponsorData, setAccSponsorData] = useState(null);


  useEffect(() => {
    const getUserData = async () => {
        try {
            setLoading2(true);

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
            setLoading2(false);
        }
    };

    getUserData();

}, []);
console.log(accSponsorData);
if(accSponsorData != null) {
    return (
        <div className="dash-sidebar font-karla">
            <div className="dash-element">
                <h3>{user.user}</h3>
            </div>
            <div className="dash-element">
                <img src={dash} className="dash-icon"></img>
                <a href="/dashboard">Dashboard</a>
            </div>
            <div className="dash-element">
                <img src={company} className="dash-icon"></img>
                <a href="/directory/sponsor">Company</a>
            </div>
            <div className="dash-element">
                <img src={catalog} className="dash-icon"></img>
                <a href={"/catalog/prefs/" + accSponsorData[0]["SPONSOR_ID"]}>Catalog</a>
            </div>
            <div className="dash-element">
                <img src={company} className="dash-icon"></img>
                <a href="/applications/sponsor">Applications</a>
            </div>
            <div className="dash-element">
                <img src={point} className="dash-icon"></img>
                <a href="/pointsform">Points</a>
            </div>
            <div className="dash-element">
                <img src={notification} className="dash-icon"></img>
                <a href="/reports/sponsor">Reports</a>
            </div>
            <div className="dash-element">
                <img src={notification} className="dash-icon"></img>
                <a>Notifications</a>
            </div>
            <div className="dash-element">
                <img src={settings} className="dash-icon"></img>
                <a href="/Settings">Account Settings</a>
            </div>
            <div className="dash-element">
                <img src={logout} className="dash-icon"></img>
                <a href="/logout">Logout</a>
            </div>
        </div>
    )
}
else {
    return <div></div>
};
}
