import React, { useState, useRef, useEffect } from 'react';
import ChemistryEquipment from './ChemistryEquipment';
import '../../styles/experiments.css';
import '../../styles/select-style.css';

function Titration() {
  // Predefined solution options
  const buretteSolutions = [
    { name: 'NaOH (0.1M)', concentration: 0.1 },
    { name: 'NaOH (0.5M)', concentration: 0.5 },
    { name: 'KOH (0.1M)', concentration: 0.1 }
  ];

  const flaskSolutions = [
    { name: 'HCl (0.1M)', concentration: 0.1 },
    { name: 'HCl (0.5M)', concentration: 0.5 },
    { name: 'H2SO4 (0.1M)', concentration: 0.1 }
  ];

  const indicators = [
    'Phenolphthalein',
    'Methyl Orange',
    'Bromothymol Blue'
  ];

  const [burette, setBurette] = useState({
    initialVolume: 50.0,
    currentVolume: 50.0,
    solution: buretteSolutions[0],
    isFlowing: false
  });
  
  const [flask, setFlask] = useState({
    volume: 100,
    solution: flaskSolutions[0],
    indicator: indicators[0],
    color: 'clear',
    endpointReached: false
  });
  
  const [experimentStatus, setExperimentStatus] = useState('setup');
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dropSpeed, setDropSpeed] = useState(200); // milliseconds between drops
  const timerRef = useRef(null);
  
  // Endpoint is when 25mL of base has been added (for this simplified experiment)
  const endpointVolume = 25.0;
  
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 0.1);
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);
  
  useEffect(() => {
    if (burette.isFlowing) {
      const interval = setInterval(() => {
        setBurette(prev => {
          const newVolume = Math.max(prev.currentVolume - 0.1, 0);
          const volumeAdded = prev.initialVolume - newVolume;
          
          // Update flask color based on volume added
          updateFlaskColor(volumeAdded);
          
          // Check if we need to stop automatically
          if (newVolume <= 0) {
            setExperimentStatus('completed');
            setTimerRunning(false);
            return { ...prev, currentVolume: 0, isFlowing: false };
          }
          
          return { ...prev, currentVolume: newVolume };
        });
      }, dropSpeed);
      
      return () => clearInterval(interval);
    }
  }, [burette.isFlowing, dropSpeed]);
  
  const updateFlaskColor = (volumeAdded) => {
    let newColor = 'clear';
    let endpointReached = false;
    
    // We're close to the endpoint
    if (volumeAdded >= endpointVolume - 0.5 && volumeAdded < endpointVolume) {
      newColor = 'very-light-pink';
    } 
    // We've reached the endpoint!
    else if (volumeAdded >= endpointVolume && volumeAdded < endpointVolume + 2) {
      newColor = 'light-pink';
      endpointReached = true;
    } 
    // We've gone past the endpoint
    else if (volumeAdded >= endpointVolume + 2) {
      newColor = 'dark-pink';
      endpointReached = true;
    }
    
    setFlask(prev => ({ ...prev, color: newColor, endpointReached }));
  };
  
  const handleStart = () => {
    setExperimentStatus('running');
    setBurette(prev => ({ ...prev, isFlowing: true }));
    setTimerRunning(true);
  };
  
  const handleStop = () => {
    setBurette(prev => ({ ...prev, isFlowing: false }));
    setTimerRunning(false);
    setExperimentStatus('completed');
  };
  
  const handleReset = () => {
    setBurette({
      initialVolume: 50.0,
      currentVolume: 50.0,
      solution: buretteSolutions[0],
      isFlowing: false
    });
    
    setFlask({
      volume: 100,
      solution: flaskSolutions[0],
      indicator: indicators[0],
      color: 'clear',
      endpointReached: false
    });
    
    setExperimentStatus('setup');
    setTimerRunning(false);
    setElapsedTime(0);
  };
  
  const calculateAccuracy = () => {
    if (experimentStatus !== 'completed') return null;
    
    const volumeAdded = burette.initialVolume - burette.currentVolume;
    const errorPercentage = Math.abs((volumeAdded - endpointVolume) / endpointVolume * 100).toFixed(2);
    let accuracy = 'Excellent!';
    
    if (errorPercentage > 5) {
      accuracy = 'Needs improvement';
    } else if (errorPercentage > 2) {
      accuracy = 'Good';
    } else if (errorPercentage > 1) {
      accuracy = 'Very good';
    }
    
    return {
      volumeAdded: volumeAdded.toFixed(1),
      expectedVolume: endpointVolume.toFixed(1),
      errorPercentage,
      accuracy
    };
  };
  
  return (
    <div className="titration-experiment">
      <div className="experiment-controls">
        <div className="experiment-info">
          <h3>Acid-Base Titration</h3>
          <p>Goal: Determine the endpoint of titration by observing the color change.</p>
          
          {/* Solution Selection Dropdowns */}
          <div className="solution-selection">
            <div className="solution-dropdown">
              <label htmlFor="burette-solution">Burette Solution:</label>
              <div className="custom-select">
                <select 
                  id="burette-solution"
                  value={burette.solution.name} 
                  onChange={(e) => setBurette(prev => ({
                    ...prev, 
                    solution: buretteSolutions.find(sol => sol.name === e.target.value)
                  }))}
                  disabled={experimentStatus !== 'setup'}
                >
                  {buretteSolutions.map((sol) => (
                    <option key={sol.name} value={sol.name}>
                      {sol.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="solution-dropdown">
              <label htmlFor="flask-solution">Flask Solution:</label>
              <div className="custom-select">
                <select 
                  id="flask-solution"
                  value={flask.solution.name} 
                  onChange={(e) => setFlask(prev => ({
                    ...prev, 
                    solution: flaskSolutions.find(sol => sol.name === e.target.value)
                  }))}
                  disabled={experimentStatus !== 'setup'}
                >
                  {flaskSolutions.map((sol) => (
                    <option key={sol.name} value={sol.name}>
                      {sol.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="solution-dropdown">
              <label htmlFor="indicator">Indicator:</label>
              <div className="custom-select">
                <select 
                  id="indicator"
                  value={flask.indicator} 
                  onChange={(e) => setFlask(prev => ({
                    ...prev, 
                    indicator: e.target.value
                  }))}
                  disabled={experimentStatus !== 'setup'}
                >
                  {indicators.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Drop Speed Control */}
        {experimentStatus === 'setup' && (
          <div className="drop-speed-control">
            <label>Drop Speed (ms between drops):</label>
            <input 
              type="range" 
              min="50" 
              max="1000" 
              value={dropSpeed}
              onChange={(e) => setDropSpeed(Number(e.target.value))}
            />
            <span>{dropSpeed} ms</span>
          </div>
        )}
        
        <div className="control-buttons">
          {experimentStatus === 'setup' && (
            <button 
              className="control-button start-button" 
              onClick={handleStart}
            >
              Start Titration
            </button>
          )}
          
          {experimentStatus === 'running' && (
            <button 
              className="control-button stop-button"
              onClick={handleStop}
            >
              Stop Titration
            </button>
          )}
          
          {experimentStatus === 'completed' && (
            <button 
              className="control-button reset-button"
              onClick={handleReset}
            >
              Reset Experiment
            </button>
          )}
        </div>
        
        <div className="readings">
          <div className="reading">
            <span className="reading-label">Burette Volume:</span>
            <span className="reading-value">{burette.currentVolume.toFixed(1)} mL</span>
          </div>
          <div className="reading">
            <span className="reading-label">Time Elapsed:</span>
            <span className="reading-value">{elapsedTime.toFixed(1)} s</span>
          </div>
        </div>
        
        {experimentStatus === 'completed' && (
          <div className="results">
            <h4>Experiment Results</h4>
            {calculateAccuracy() && (
              <>
                <div className="result-item">
                  <span>Volume Added:</span>
                  <span>{calculateAccuracy().volumeAdded} mL</span>
                </div>
                <div className="result-item">
                  <span>Expected Volume:</span>
                  <span>{calculateAccuracy().expectedVolume} mL</span>
                </div>
                <div className="result-item">
                  <span>Error Percentage:</span>
                  <span>{calculateAccuracy().errorPercentage}%</span>
                </div>
                <div className="result-item accuracy">
                  <span>Accuracy:</span>
                  <span>{calculateAccuracy().accuracy}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="experiment-visualization">
        <ChemistryEquipment 
          buretteVolume={burette.currentVolume}
          flaskColor={flask.color}
          isFlowing={burette.isFlowing}
          maxVolume={burette.initialVolume}
        />
      </div>
    </div>
  );
}

export default Titration;