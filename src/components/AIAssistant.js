import React, { useState, useRef, useEffect } from 'react';
import { generateAIResponse, generateContextualHint } from '../utils/aiHelpers';
import '../styles/AIAssistant.css'; // Ensure you have corresponding CSS

function AIAssistant({ 
  messages, 
  onSendQuestion, 
  experimentName, 
  experimentId, 
  experimentState 
}) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    
    if (trimmedInput) {
      setIsLoading(true);
      try {
        // Optional: Add AI response generation if needed
        // const aiResponse = await generateAIResponse(trimmedInput);
        
        onSendQuestion(trimmedInput);
        setInputValue('');
      } catch (error) {
        console.error('Error sending question:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Auto-scroll to bottom of messages with enhanced behavior
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }, [messages]);

  // Memoize contextual hint to prevent unnecessary re-renders
  const contextualHint = React.useMemo(() => {
    return experimentId && experimentState
      ? generateContextualHint(experimentId, experimentState)
      : null;
  }, [experimentId, experimentState]);

  // Keyboard accessibility for submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <h3>AI Lab Assistant</h3>
        <span className="ai-badge">AI Powered</span>
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div
            key={`message-${index}`}
            className={`message ${msg.isUser ? 'user-message' : 'ai-message'}`}
          >
            <span className="message-content">{msg.text}</span>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai-message">
            <span className="message-content typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {contextualHint && (
        <div className="contextual-hint">
          <span className="hint-icon">💡</span>
          <p>{contextualHint}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="question-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask about the ${experimentName} experiment...`}
          className="question-input"
          disabled={isLoading}
          aria-label="Ask AI Assistant"
        />
        <button
          type="submit"
          className="send-button"
          disabled={isLoading || !inputValue.trim()}
          aria-label="Send question"
        >
          {isLoading ? 'Thinking...' : 'Ask'}
        </button>
      </form>
    </div>
  );
}

export default React.memo(AIAssistant);