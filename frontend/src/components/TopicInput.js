import React, { useState, useEffect } from 'react';
import './TopicInput.css';

const TopicInput = ({ onStartDebate, onStopDebate, isDebating }) => {
  const [topic, setTopic] = useState('');
  const [isInputValid, setIsInputValid] = useState(false);

  // Validate input whenever topic changes
  useEffect(() => {
    setIsInputValid(topic.trim().length > 0);
  }, [topic]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isInputValid && !isDebating) {
      onStartDebate(topic);
    }
  };

  const handleStop = () => {
    onStopDebate();
  };

  return (
    <div className="topic-input-container">
      <form onSubmit={handleSubmit} className="topic-form">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a debate topic..."
          disabled={isDebating}
          className="topic-input"
        />
        
        {isDebating ? (
          <button 
            type="button" 
            onClick={handleStop} 
            className="stop-button"
          >
            Stop Debate
          </button>
        ) : (
          <button 
            type="submit" 
            disabled={!isInputValid} 
            className="start-button"
          >
            Start Debate
          </button>
        )}
      </form>
      
      <div className="topic-instructions">
        {!isDebating && (
          <p>Enter any topic, question, or idea you'd like the AI bots to debate.</p>
        )}
        {isDebating && (
          <p>Debate in progress. Click "Stop Debate" to end the conversation at any time.</p>
        )}
      </div>
    </div>
  );
};

export default TopicInput;
