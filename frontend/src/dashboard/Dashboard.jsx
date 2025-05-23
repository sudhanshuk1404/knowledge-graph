import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  // Define the available tools
  const tools = [
    {
      id: 'customer-dashboard',
      name: 'Customer Dashboard ',
      description: 'View details of individual customers, like call records, call transcripts etc.',
      icon: '👨‍👩‍👦',
      path: '/tool/customer-dashboard',
      category: 'Customer details'
    },
    {
      id: 'knowledgegraph',
      name: 'Knowledge Graph Tool',
      description: 'Create, visualize, and manage knowledge graphs with an interactive interface.',
      icon: '🧠',
      path: '/tool/knowledgegraph',
      category: 'Graph Tools'
    },
    {
      id: 'schema-editor',
      name: 'Schema Editor',
      description: 'Design and edit data schemas with a visual, intuitive editor.',
      icon: '📝',
      path: '/tool/schema-editor',
      category: 'Schema Tools'
    }
    // Add more tools here in the future
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-container">
            <span className="logo-icon">🌿</span>
            <h1>Health Sutra</h1>
          </div>
          <nav className="main-nav">
            <a href="#" className="active">Dashboard</a>
            <a href="#">Documentation</a>
            <a href="#">Support</a>
          </nav>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome to Health Sutra dashboard</h2>
          <p>Select a tool from our collection to begin working with healthcare data</p>
        </div>
        
        <div className="tools-grid">
          {tools.map(tool => (
            <Link to={tool.path} key={tool.id} className="tool-card">
              <div className="tool-content">
                <div className="tool-icon-container">
                  <span className="tool-icon">{tool.icon}</span>
                </div>
                <div className="tool-info">
                  <span className="tool-category">{tool.category}</span>
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                </div>
              </div>
              <div className="tool-action">
                <span className="launch-text">Launch</span>
                <span className="launch-icon">→</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      
      <footer className="dashboard-footer">
        <p>© 2025 Suetra. All rights reserved</p>
      </footer>
    </div>
  );
};

export default Dashboard; 