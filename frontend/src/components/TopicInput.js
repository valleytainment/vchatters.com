import React, { useState } from 'react';
import './TopicInput.css';

const TopicInput = ({ onStartDebate, onStopDebate, isDebating }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim() && !isDebating) {
      onStartDebate(topic);
    }
  };

  return (
    <div className="topic-input-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter debate topic..."
          disabled={isDebating}
          className="topic-input"
        />
        <div className="button-container">
          <button 
            type="submit" 
            disabled={!topic.trim() || isDebating}
            className={`debate-button start-button ${(!topic.trim() || isDebating) ? 'disabled' : ''}`}
          >
            Start Debate
          </button>
          <button 
            type="button" 
            onClick={onStopDebate}
            disabled={!isDebating}
            className={`debate-button stop-button ${!isDebating ? 'disabled' : ''}`}
          >
            Stop Debate
          </button>
        </div>
      </form>
    </div>
  );
};

export default TopicInput;
