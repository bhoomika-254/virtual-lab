import React, { useEffect, useState } from 'react';
import '../styles/science-elements.css';

const ScienceElements = () => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const generateElements = () => {
      const svgShapes = [
        'M12 2L2 7l10 5 10-5-10-5z', // Molecule
        'M12 2v20l8-5-8-15z', // Flask
        'M16 3H8l-6 8 6 8h8l6-8-6-8z', // Hexagon
        'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z', // Atom-like circle
        'M21 11l-6-6-2 2 4 4H3v2h14l-4 4 2 2 6-6z', // Test tube
        'M5 9.2h14V7H5v2zm14 3.5H5v-1h14v1zm0 2.5H5v2h14v-2z', // Beaker
        'M19.36 10.04l1.53-1.53-1.41-1.41-1.53 1.53-2.61-2.61a.996.996 0 0 0-1.41 0L2.59 16.38a.996.996 0 0 0 0 1.41l2.96 2.96c.39.39 1.02.39 1.41 0l9.15-9.15 2.25 2.25z' // Lab equipment
      ];

      const newElements = [];
      const gridSize = 20; // Increased grid size for more comprehensive coverage
      const excludeZone = {
        left: 20, // More precise exclusion of content area
        right: 78,
        top: 26,
        bottom: 70
      };

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          // Calculate percentage position
          const left = (col / (gridSize - 1)) * 100;
          const top = (row / (gridSize - 1)) * 100;

          // Check if the element is outside the exclude zone
          const isOutsideExcludeZone = 
            left < excludeZone.left || left > excludeZone.right ||
            top < excludeZone.top || top > excludeZone.bottom;

          if (isOutsideExcludeZone) {
            const path = svgShapes[Math.floor(Math.random() * svgShapes.length)];
            
            newElements.push({
              id: `${row}-${col}`,
              path,
              left,
              top,
              size: Math.random() * 30 + 20, // Adjusted size range
              animationDelay: Math.random() * 5,
              rotation: Math.random() * 360
            });
          }
        }
      }

      setElements(newElements);
    };

    generateElements();
  }, []);

  return (
    <div className="science-elements-background">
      {elements.map((element) => (
        <svg
          key={element.id}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="science-element"
          style={{
            position: 'absolute',
            left: `${element.left}%`,
            top: `${element.top}%`,
            width: `${element.size}px`,
            height: `${element.size}px`,
            animationDelay: `${element.animationDelay}s`,
            transform: `rotate(${element.rotation}deg)`
          }}
        >
          <path d={element.path} fill="rgba(52, 152, 219, 0.2)" /> {/* Matches pastel blue dark color */}
        </svg>
      ))}
    </div>
  );
};

export default ScienceElements;