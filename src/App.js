// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import ExperimentSelector from './components/ExperimentSelector';
import Titration from './experiments/chemistry/Titration';
import Permanganometry from './experiments/chemistry/Permanganometry';
import Pendulum from './experiments/physics/Pendulum';
import SpringOscillation from './experiments/physics/SpringOscillation';
import AIAssistant from './components/AIAssistant';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ExperimentList from './pages/ExperimentList';
import { generateAIResponse } from './utils/aiHelpers';
import { getGeminiResponse, generateGeminiPrompt } from './utils/geminiService';
import './styles/main.css';

function App() {
  const [currentExperiment, setCurrentExperiment] = useState(null);
  const [aiMessages, setAiMessages] = useState([]);
  const [experimentState, setExperimentState] = useState({ status: 'setup' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const experiments = [
    { id: 'titration', name: 'Acid-Base Titration', subject: 'Chemistry', component: Titration },
    { id: 'pendulum', name: 'Simple Pendulum', subject: 'Physics', component: Pendulum },
    { id: 'permanganometry', name: 'Permanganometry', subject: 'Chemistry', component: Permanganometry},
    { id: 'springoscillation', name:'SpringOscillation', subject:'Physics', component: SpringOscillation}
  ];

  const handleSelectExperiment = (experimentId) => {
    const selected = experiments.find(exp => exp.id === experimentId);
    setCurrentExperiment(selected);
    setExperimentState({ status: 'setup' });

    // Reset AI messages when switching experiments
    setAiMessages([{
      text: `Welcome to the ${selected.name} experiment! How can I help you?`,
      isUser: false
    }]);
  };

  const handleExperimentStateChange = (newState) => {
    setExperimentState(newState);
  };

  const handleAiQuestion = async (question) => {
    // Add user question to messages
    const updatedMessages = [...aiMessages, { text: question, isUser: true }];
    setAiMessages(updatedMessages);

    // Temporarily show "thinking" message
    setAiMessages([...updatedMessages, { text: "Thinking...", isUser: false, isLoading: true }]);

    try {
      let response;

      // First try to use the predefined responses from aiHelpers
      const localResponse = currentExperiment ? 
        generateAIResponse(currentExperiment.id, question) : null;

      // If we didn't get a specific response from aiHelpers, use Gemini API
      if (localResponse && !localResponse.includes("I'm here to help with your")) {
        response = localResponse;
      } else {
        // Use Gemini API for more complex or undefined questions
        const prompt = generateGeminiPrompt(
          currentExperiment?.id, 
          currentExperiment?.name, 
          question, 
          // Only include the last 6 messages for context to save tokens
          updatedMessages.slice(-6)
        );

        response = await getGeminiResponse(prompt);
      }

      // Remove the "thinking" message and add the real response
      setAiMessages([
        ...updatedMessages, 
        { text: response, isUser: false }
      ]);

    } catch (error) {
      console.error('Error getting AI response:', error);
      // Update with error message
      setAiMessages([
        ...updatedMessages,
        { text: "I'm sorry, I couldn't process your question. Please try again.", isUser: false }
      ]);
    }
  };

  const handleLogin = (username, password) => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user exists
    const user = userData.find(user => user.username === username && user.password === password);
    
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleRegister = (username, password, email) => {
    // Get existing users
    const userData = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if username already exists
    if (userData.some(user => user.username === username)) {
      return false;
    }
    
    // Add new user
    const newUser = { username, password, email };
    userData.push(newUser);
    
    // Save back to localStorage
    localStorage.setItem('users', JSON.stringify(userData));
    
    // Auto login after registration
    setIsLoggedIn(true);
    setCurrentUser(newUser);
    
    return true;
  };

  const LabContent = () => (
    <div className="experiment-area">
      <ExperimentSelector 
        experiments={experiments} 
        onSelect={handleSelectExperiment} 
      />

      {currentExperiment ? (
        <div className="current-experiment">
          <h2>{currentExperiment.name}</h2>
          <div className="experiment-container">
            <currentExperiment.component 
              onStateChange={handleExperimentStateChange}
            />
          </div>
        </div>
      ) : (
        <div className="welcome-message">
          <h2>Welcome to Virtual Labs</h2>
          <p>Select an experiment from the menu to begin your virtual lab experience.</p>
        </div>
      )}

      {currentExperiment && (
        <AIAssistant 
          messages={aiMessages}
          onSendQuestion={handleAiQuestion}
          experimentName={currentExperiment.name}
          experimentId={currentExperiment.id}
          experimentState={experimentState}
        />
      )}
    </div>
  );

  return (
    <Router>
      <div className="app h-screen w-screen flex flex-col overflow-hidden">
        <NavBar isLoggedIn={isLoggedIn} onLogout={handleLogout} username={currentUser?.username} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onRegister={handleRegister} />} />
            <Route 
              path="/experiments" 
              element={isLoggedIn ? <ExperimentList experiments={experiments} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/lab" 
              element={isLoggedIn ? <LabContent /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;