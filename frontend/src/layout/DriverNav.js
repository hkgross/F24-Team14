import React from "react";
import { useAuth } from "../hooks/AuthProvider";
import dash from "../assets/dashboard.png"
import company from "../assets/company.png"
import catalog from "../assets/catalog.png"
import point from "../assets/point.png"
import notification from "../assets/notification.png"
import settings from "../assets/settings.png"
import logout from "../assets/logout.png"


export default function DriverNav() {
    const { user } = useAuth();
    
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
                <a href="/sponviewer/driver">My Sponsors</a>
            </div>
            <div className="dash-element">
                <img src={catalog} className="dash-icon"></img>
                <a href="/catalog/">Catalog</a>
            </div>
            <div className="dash-element">
                <img src={point} className="dash-icon"></img>
                <a href="/points">Points</a>
            </div>
            <div className="dash-element">
                <img src={notification} className="dash-icon"></img>
                <a href="/notifications">Notifications</a>
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