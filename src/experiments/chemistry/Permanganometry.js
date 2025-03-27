import React, { useState, useRef, useEffect } from 'react';
import ChemistryEquipment from './ChemistryEquipment';
import '../../styles/experiments.css';
import '../../styles/select-style.css';

function Permanganometry() {
  // Predefined solution options
  const burretteSolutions = [
    { id: 'kmno4', label: 'KMnO₄ (0.02M)', molarity: 0.02 },
    { id: 'k2cr2o7', label: 'K₂Cr₂O₇ (0.1M)', molarity: 0.1 },
    { id: 'sodium-thiosulfate', label: 'Na₂S₂O₃ (0.1M)', molarity: 0.1 }
  ];

  const flaskSolutions = [
    { id: 'fe2', label: 'Fe²⁺ (0.1M) in H₂SO₄', molarity: 0.1 },
    { id: 'oxalate', label: 'Oxalate (0.05M)', molarity: 0.05 },
    { id: 'iodide', label: 'KI (0.1M)', molarity: 0.1 }
  ];

  const [burette, setBurette] = useState({
    initialVolume: 50.0,
    currentVolume: 50.0,
    solution: burretteSolutions[0],
    isFlowing: false,
    dropSpeed: 1, // Default speed
    drops: [] // New state to track drops
  });
  
  const [flask, setFlask] = useState({
    volume: 100,
    solution: flaskSolutions[0],
    color: 'clear',
    endpointReached: false
  });
  
  const [experimentStatus, setExperimentStatus] = useState('setup');
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const dropContainerRef = useRef(null);
  
  // Endpoint is when 20mL of titrant has been added (for this simplified experiment)
  const endpointVolume = 20.0;
  
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
          // Adjust flow rate based on drop speed
          const volumeDecrement = 0.1 * prev.dropSpeed;
          const newVolume = Math.max(prev.currentVolume - volumeDecrement, 0);
          const volumeAdded = prev.initialVolume - newVolume;
          
          // Create a new drop
          const newDrop = {
            id: Date.now(),
            color: prev.solution.id === 'kmno4' ? 'purple' : 'blue',
            speed: prev.dropSpeed
          };
          
          // Update drops array
          const updatedDrops = [
            ...prev.drops, 
            newDrop
          ];
          
          // Remove old drops to prevent memory buildup
          if (updatedDrops.length > 50) {
            updatedDrops.shift();
          }
          
          // Update flask color based on volume added
          updateFlaskColor(volumeAdded);
          
          // Check if we need to stop automatically
          if (newVolume <= 0) {
            setExperimentStatus('completed');
            setTimerRunning(false);
            return { 
              ...prev, 
              currentVolume: 0, 
              isFlowing: false,
              drops: [] 
            };
          }
          
          return { 
            ...prev, 
            currentVolume: newVolume,
            drops: updatedDrops 
          };
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [burette.isFlowing, burette.dropSpeed]);
  
  const updateFlaskColor = (volumeAdded) => {
    let newColor = 'clear';
    let endpointReached = false;
    
    // The permanganate initially decolorizes when added to the Fe²⁺ solution
    if (volumeAdded > 0 && volumeAdded < endpointVolume - 1) {
      newColor = 'very-light-yellow';
    } 
    // Just before the endpoint, we might see a flash of pink that quickly disappears
    else if (volumeAdded >= endpointVolume - 1 && volumeAdded < endpointVolume) {
      newColor = 'flash-pink';
    } 
    // We've reached the endpoint! First persistent pink color
    else if (volumeAdded >= endpointVolume && volumeAdded < endpointVolume + 1) {
      newColor = 'light-purple';
      endpointReached = true;
    } 
    // We've gone past the endpoint
    else if (volumeAdded >= endpointVolume + 1) {
      newColor = 'dark-purple';
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
      solution: burretteSolutions[0],
      isFlowing: false,
      dropSpeed: 1,
      drops: []
    });
    
    setFlask({
      volume: 100,
      solution: flaskSolutions[0],
      color: 'clear',
      endpointReached: false
    });
    
    setExperimentStatus('setup');
    setTimerRunning(false);
    setElapsedTime(0);
  };
  
  const handleBurretteSolutionChange = (e) => {
    const selectedSolution = burretteSolutions.find(sol => sol.id === e.target.value);
    setBurette(prev => ({ ...prev, solution: selectedSolution }));
  };
  
  const handleFlaskSolutionChange = (e) => {
    const selectedSolution = flaskSolutions.find(sol => sol.id === e.target.value);
    setFlask(prev => ({ ...prev, solution: selectedSolution }));
  };
  
  const handleDropSpeedChange = (e) => {
    setBurette(prev => ({ ...prev, dropSpeed: parseFloat(e.target.value) }));
  };
  
  const calculateResults = () => {
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
    
    // Calculate concentration based on redox equation
    const volumeAdded_L = volumeAdded / 1000;
    const permanganateMoles = (volumeAdded_L * burette.solution.molarity);
    const ferrusMoles = permanganateMoles * 5; // 1 mol KMnO₄ reacts with 5 mol Fe²⁺
    const ferrusConcentration = (ferrusMoles / 0.1).toFixed(4); // 100 mL = 0.1 L solution
    
    return {
      volumeAdded: volumeAdded.toFixed(1),
      expectedVolume: endpointVolume.toFixed(1),
      errorPercentage,
      accuracy,
      ferrusConcentration
    };
  };
  
  const renderDrops = () => {
    return burette.drops.map(drop => (
      <div 
        key={drop.id} 
        className="drop" 
        style={{
          backgroundColor: drop.color,
          animationDuration: `${1.5 / drop.speed}s`,
          opacity: drop.speed === 5 ? 0.7 : 1
        }}
      />
    ));
  };

  return (
    <div className="titration-experiment">
      <div className="experiment-controls">
        <div className="experiment-info">
          <h3>Permanganometry Redox Titration</h3>
          <p>Goal: Determine Fe²⁺ concentration by titrating with KMnO₄ until a persistent pink color appears.</p>
          
          <div className="solution-selection">
            <div className="solution-select">
              <label htmlFor="burette-solution">Burette Solution:</label>
              <select 
                id="burette-solution" 
                value={burette.solution.id}
                onChange={handleBurretteSolutionChange}
                disabled={experimentStatus !== 'setup'}
              >
                {burretteSolutions.map(sol => (
                  <option key={sol.id} value={sol.id}>
                    {sol.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="solution-select">
              <label htmlFor="flask-solution">Flask Solution:</label>
              <select 
                id="flask-solution" 
                value={flask.solution.id}
                onChange={handleFlaskSolutionChange}
                disabled={experimentStatus !== 'setup'}
              >
                {flaskSolutions.map(sol => (
                  <option key={sol.id} value={sol.id}>
                    {sol.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {experimentStatus === 'running' && (
            <div className="drop-speed-control">
              <label htmlFor="drop-speed">Drop Speed:</label>
              <select 
                id="drop-speed" 
                value={burette.dropSpeed}
                onChange={handleDropSpeedChange}
              >
                <option value={0.5}>Very Slow</option>
                <option value={1}>Normal</option>
                <option value={2}>Fast</option>
                <option value={5}>Very Fast</option>
              </select>
            </div>
          )}
        </div>
        
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
        
        <div className="drop-container" ref={dropContainerRef}>
          {burette.isFlowing && renderDrops()}
        </div>
        
        {experimentStatus === 'completed' && (
          <div className="results">
            <h4>Experiment Results</h4>
            {calculateResults() && (
              <>
                <div className="result-item">
                  <span>Volume Added:</span>
                  <span>{calculateResults().volumeAdded} mL</span>
                </div>
                <div className="result-item">
                  <span>Expected Volume:</span>
                  <span>{calculateResults().expectedVolume} mL</span>
                </div>
                <div className="result-item">
                  <span>Error Percentage:</span>
                  <span>{calculateResults().errorPercentage}%</span>
                </div>
                <div className="result-item">
                  <span>Fe²⁺ Amount:</span>
                  <span>{calculateResults().ferrusConcentration} mol</span>
                </div>
                <div className="result-item accuracy">
                  <span>Accuracy:</span>
                  <span>{calculateResults().accuracy}</span>
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

export default Permanganometry;