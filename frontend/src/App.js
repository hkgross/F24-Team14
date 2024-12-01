import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Sponsors from "./pages/Sponsors"
import Accounts from "./pages/Accounts"
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/AccountSettings";
import AuthProvider from "./hooks/AuthProvider";
import PrivateRoute from "./routing/PrivateRoute";
import ApplicationForm from './pages/ApplicationForm';
import ApplicationSponsor from './pages/ApplicationSponsor';
import AppStatus from './pages/AppStatus';
import Logout from './pages/Logout';
import SponsorPoints from './pages/SponsorPoints';
import TestMe from './pages/TestMe';
import CreateAccount from './pages/CreateAccount';
import Catalog from './pages/Catalog';
import ProductPage from './pages/ProductPage';
import AdminAudit from './pages/AdminAudit';
import SponsorAudit from './pages/SponsorAudit';
import DriverPoints from './pages/DriverPoints';
import PointValueForm from './pages/PointValueForm'
import SponsorDirectory from './pages/SponsorDirectory';
import Notifications from './pages/Notifications';
import AdminDirectory from './pages/AdminDirectory';
import PassReset from './pages/PassWordReset';
import Viewer from './pages/AdminSponView';
import DriverSponsorViewer from './pages/DriverSponsorChecker';
import SponsorOrg from './pages/SponsorOrg';
import CatPrefs from './pages/CatPrefs';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <AuthProvider>
          <Routes>
            <Route index element={<Home />} />
            <Route path="about" element={<About />}/>
            <Route path="login" element={<Login />} />
            <Route path="sponsors" element={<Sponsors />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="applications/status" element={<AppStatus />} />
            <Route path="testme" element={<TestMe />} />
            <Route path="create" element={<CreateAccount />} />
            <Route element={< PrivateRoute />}>
              <Route path="applications/:id" element={<ApplicationForm />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="settings" element={<Settings />} />
              <Route path="pointsform" element={<SponsorPoints />} />
              <Route path="reports/admin" element={<AdminAudit />} />
              <Route path="reports/sponsor" element={<SponsorAudit />} />
              <Route path="points" element={<DriverPoints />}></Route>
              <Route path="sponviewer/driver" element={<DriverSponsorViewer />}></Route>
              <Route path="directory/sponsor" element={<SponsorDirectory />}></Route>
              <Route path="notifications" element={<Notifications />}></Route>
              <Route path="directory/admin" element={<AdminDirectory />}></Route>
              <Route path="sponviewer/admin" element={<Viewer />}></Route>
              <Route path="sponsor-organization" element={<SponsorOrg />}></Route>
              <Route path="catalog/prefs/:id" element={<CatPrefs />} />
              <Route path="applications/sponsor" element={<ApplicationSponsor />} />
            </Route>
            <Route path="logout" element={<Logout />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="catalog/:id" element={<ProductPage />} />
            <Route path="pointvalue" element={<PointValueForm />} />
            <Route path="password-reset" element={<PassReset />} />
            
          </Routes>
        </AuthProvider>
      </div>
    </BrowserRouter>
  );
}
export default App;