// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';
import ScienceElements from '../components/ScienceElements';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="background-animation"></div>
      <ScienceElements />
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to VirtualLab</h1>
          <h2>Learn Science Through Interactive Virtual Experiments</h2>
          <p>Experience hands-on learning without physical constraints.</p>
          <br></br>
          <div className="hero-buttons">
            <Link to="/experiments" className="btn">Get Started</Link>
            <Link to="/about" className="btn">Learn More</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;