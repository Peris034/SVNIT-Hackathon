import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import Dashboard from "./component/Dashboard/Dashboard";
import Account from "./component/Account/Account";
import Logindetail from "./component/Account/Logindetail";
import Signup from "./component/Auth/Signup";
// import Users from "./component/Users/Users";
import Map from "./component/Map/Map";
import Incident from "./component/Incident/Incident";
// import Incidents from "./component/Incident/Incidents";
import SosButton from './component/Sos/SosButton';
import Emergency from './component/Emergency/Emergency';
// import NewsFeed from './component/News/NewsFeed';
import notificationService from './firebase/notification.service';
// import Post from './component/Post/Post';
// import Adminpost from './component/Post/Adminpost';

export default function App() {
  useEffect(() => {
    notificationService.registerServiceWorker();
    notificationService.requestPermission().then((token) => {
      // if (token) console.log("Token received:", token);
    });

    notificationService.onMessageListener((payload) => {
      const { title, body } = payload.notification;
      toast.info(`${title}: ${body}`, { position: "top-right", autoClose: 5000 });
    });
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/users" element={<Users />} /> */}
        <Route path="/map" element={<Map />} />
        <Route path="/incident" element={<Incident />} />
        {/* <Route path="/incidents" element={<Incidents />} /> */}
        <Route path="/sos" element={<SosButton />} />
        <Route path="/emergency" element={<Emergency />} />
        {/* <Route path="/news" element={<NewsFeed />} /> */}
        {/* <Route path="/post" element={<Post />} /> */}
        {/* <Route path="/adminpost" element={<Adminpost />} /> */}
        <Route path="/account" element={<Account />}>
          <Route index element={<Navigate to="logindetail" />} />
          <Route path="logindetail" element={<Logindetail />} />
        </Route>
      </Routes>
      <ToastContainer />
    </Router>
  );
}
