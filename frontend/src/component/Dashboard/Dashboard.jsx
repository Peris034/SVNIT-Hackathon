import React from 'react';
import Navbar from '../Navbar';

const Dashboard = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Navbar />
      <div>
        <h1>Dashboard Page</h1>
        <p>This is the Dashboard page.</p>
      </div>
    </div>
  );
};

export default Dashboard;
