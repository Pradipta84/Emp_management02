import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const timeAgo = (dateInput) => {
    if (!dateInput) return '';
    if (typeof dateInput === 'string' && dateInput.includes('ago')) return dateInput;

    const date = new Date(dateInput);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
};

function ActivityFeed({ isOpen, onClose }) {
    const [activities, setActivities] = useState([]);
    const [, setCurrentTime] = useState(Date.now()); // Dummy state to trigger re-renders

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 10000); // update relative times every 10 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
        const socket = io(API_BASE_URL);

        socket.on('initial_activities', (data) => {
            setActivities(data);
        });

        socket.on('activity', (newActivity) => {
            setActivities((prev) => {
                const updatedList = [newActivity, ...prev];
                if (updatedList.length > 10) {
                    return updatedList.slice(0, 10);
                }
                return updatedList;
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);
    return (
        <>
            <div className={`activity-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`activity-feed-container ${isOpen ? 'open' : ''}`}>
                <div className="activity-header">
                    <h3>Activity History</h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span className="badge-pulse">Live</span>
                        <button className="btn-close" onClick={onClose} style={{background:'transparent', border:'none', color:'#94a3b8', fontSize:'24px', cursor:'pointer', lineHeight:1}}>&times;</button>
                    </div>
                </div>
            <div className="activity-list">
                {activities.map((act) => (
                    <div key={act.id} className="activity-item">
                        <div className={`activity-icon icon-${act.type}`}></div>
                        <div className="activity-content">
                            <p className="activity-text">
                                {act.action} <strong>{act.user}</strong>
                            </p>
                            <span className="activity-time">{timeAgo(act.timestamp || act.time)}</span>
                        </div>
                    </div>
                ))}
            </div>
            </div>
        </>
    );
}

export default ActivityFeed;
