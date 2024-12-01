// Load dashboard depending on user type

import Navbar from "../layout/Navbar";
import React from "react";
import { useAuth } from "../hooks/AuthProvider";
import DriverNav from "../layout/DriverNav";
import DriverDash from "../components/DriverDash";
import SponsorNav from "../layout/SponsorNav";
import SponsorDash from "../components/SponsorDash";
import AdminNav from "../layout/AdminNav";
import AdminDash from "../components/AdminDash";

const Dashboard = () => {
    const { user } = useAuth();
    const userType = user.type;

    // Driver
    if (userType == "driver") {
        return (
            <>
                <Navbar />
                <DriverNav />
                <DriverDash />
            </>
        )
    }

    // Sponsor
    else if (userType == "sponsor") {
        return (
            <>
                <Navbar />
                <SponsorNav />
                <SponsorDash />
            </>
        )
    }

    //Admin
    else {
        return (
            <>
            <Navbar />
            <AdminNav />
            <AdminDash />
            </>
        )
    }
}

export default Dashboard;