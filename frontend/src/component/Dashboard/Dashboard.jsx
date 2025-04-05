import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import { FaUsers, FaBell, FaMapMarkerAlt, FaUserShield } from 'react-icons/fa';
const API_URL = import.meta.env.VITE_API_URL;
const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAlerts: 0,
    recentAlerts: [],
    recentUsers: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        console.log('Dashboard data:', data); // Add this to debug
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatBox = ({ title, value, icon, color, onClick }) => (
    <div 
      className="stat-box" 
      onClick={onClick} 
      role="button"
      data-tooltip={`Click to view ${title.toLowerCase()}`}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
      tabIndex={0}
    >
      <div className="stat-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );

  const handleUserBoxClick = () => {
    navigate('/users');
  };

  const handleAlertsBoxClick = () => {
    navigate('/map'); // Navigate to map page
  };

  // Helper function to format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          {/* <p>Welcome to your SOS Alert System dashboard</p> */}
        </div>

        <div className="stats-grid">
          <StatBox
            title="Total Users"
            value={stats.totalUsers}
            icon={<FaUsers />}
            color="#4CAF50"
            onClick={handleUserBoxClick}
          />
          <StatBox
            title="Active Users"
            value={stats.activeUsers}
            icon={<FaUserShield />}
            color="#2196F3"
          />
          <StatBox
            title="Total Alerts"
            value={stats.totalAlerts}
            icon={<FaBell />}
            color="#F44336"
            onClick={handleAlertsBoxClick}
          />
          {/* <StatBox
            title="Emergency Contacts"
            value={stats.emergencyContacts}
            icon={<FaMapMarkerAlt />}
            color="#FF9800"
          /> */}
        </div>

        <div className="dashboard-cards">
          <div className="card recent-alerts">
            <h2>Recent Emergency Alerts</h2>
            <div className="alert-list">
              {stats.recentAlerts && stats.recentAlerts.length > 0 ? (
                stats.recentAlerts.map((alert, index) => (
                  <div key={index} className="alert-item">
                    <div className="alert-icon emergency">🚨</div>
                    <div className="alert-details">
                      <h4>Emergency Alert {alert.status && `- ${alert.status}`}</h4>
                      {alert.location && (
                        <p>Location: {`${alert.location.coordinates[1]}, ${alert.location.coordinates[0]}`}</p>
                      )}
                      {alert.message && <p>{alert.message}</p>}
                      <small>{timeAgo(alert.timestamp)}</small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No recent alerts</div>
              )}
            </div>
          </div>

          <div className="card user-activity">
            <h2>Recent User Registrations</h2>
            <div className="activity-list">
              {stats.recentUsers && stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((user, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">👤</div>
                    <div className="activity-details">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                      <small>{timeAgo(user.createdAt)}</small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No recent registrations</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .dashboard-header {
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .dashboard-header h1 {
          margin: 0;
          color: #333;
          font-size: 24px;
        }

        .dashboard-header p {
          margin: 5px 0 0;
          color: #666;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-box {
          background: white;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
          cursor: pointer;
          position: relative;
        }

        .stat-box:hover {
          transform: translateY(-5px);
          background-color: #f8f9fa;
        }

        .stat-box:active {
          transform: translateY(0);
          background-color: #f0f0f0;
        }

        .stat-box:focus {
          outline: 2px solid #4CAF50;
          outline-offset: 2px;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          color: white;
        }

        .stat-content h3 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }

        .stat-content p {
          margin: 5px 0 0;
          color: #666;
        }

        .dashboard-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .card h2 {
          margin: 0 0 20px;
          color: #333;
          font-size: 18px;
        }

        .alert-list, .activity-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .alert-item, .activity-item {
          display: flex;
          align-items: center;
          padding: 10px;
          border-radius: 8px;
          background: #f8f9fa;
          transition: transform 0.2s ease;
        }

        .alert-item:hover, .activity-item:hover {
          transform: translateX(5px);
          background: #f0f0f0;
        }

        .alert-icon, .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 20px;
        }

        .alert-icon.emergency {
          background: #ffebee;
          color: #f44336;
          animation: pulse 2s infinite;
        }

        .activity-icon {
          background: #e3f2fd;
          color: #2196F3;
        }

        .alert-details, .activity-details {
          flex: 1;
        }

        .alert-details h4, .activity-details h4 {
          margin: 0;
          color: #333;
          font-size: 14px;
        }

        .alert-details p, .activity-details p {
          margin: 5px 0;
          color: #666;
          font-size: 12px;
        }

        .alert-details small, .activity-details small {
          color: #999;
          font-size: 11px;
        }

        .no-data {
          text-align: center;
          color: #666;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-cards {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        .stat-box::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          padding: 5px 10px;
          background: rgba(0,0,0,0.8);
          color: white;
          border-radius: 4px;
          font-size: 12px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .stat-box:hover::after {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
