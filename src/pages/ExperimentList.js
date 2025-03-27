// src/pages/ExperimentList.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/experiments.css';

const ExperimentList = () => {
  const experiments = [
    { id: 'titration', name: 'Acid-Base Titration', subject: 'Chemistry' },
    { id: 'permanganometry', name: 'Permanganometry', subject: 'Chemistry' },
    { id: 'pendulum', name: 'Simple Pendulum', subject: 'Physics' },
    { id: 'springoscillation', name: 'Spring Oscillation', subject: 'Physics' }
  ];

  return (
    <div className="experiment-list">
      <h1>Available Experiments</h1>
      <div className="experiments-grid">
        {experiments.map((experiment) => (
          <div key={experiment.id} className="experiment-card">
            <h2>{experiment.name}</h2>
            <p>Subject: {experiment.subject}</p>
            <Link to={`/experiments/${experiment.id}`} className="btn">Start Experiment</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperimentList;