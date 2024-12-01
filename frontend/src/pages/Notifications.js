import Navbar from "../layout/Navbar";
import React from "react";
import { useAuth } from "../hooks/AuthProvider";
import DriverNav from "../layout/DriverNav";
import SponsorNav from "../layout/SponsorNav";
import AdminNav from "../layout/AdminNav";
import NotificationContent from "../components/NotificationContent";

export default function Notifications() {
    const { user } = useAuth();
    const userType = user.type;

    // Driver
    if (userType == "driver") {
        return (
            <>
                <Navbar />
                <DriverNav />
                <NotificationContent />
            </>
        )
    }

    // Sponsor
    else if (userType == "sponsor") {
        return (
            <>
                <Navbar />
                <SponsorNav />
                <NotificationContent />
            </>
        )
    }

    // Admin
    else {
        return (
            <>
                <Navbar />
                <AdminNav />
                <NotificationContent />
            </>
        )
    }
}