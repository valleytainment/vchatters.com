import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ message }) => {
  const { role, content } = message;
  
  // Determine the appropriate CSS class based on the message role
  const getBubbleClass = () => {
    switch (role) {
      case 'user':
        return 'user-message';
      case 'bot1':
        return 'bot1-message';
      case 'bot2':
        return 'bot2-message';
      default:
        return 'user-message';
    }
  };
  
  // Get the display name based on the role
  const getDisplayName = () => {
    switch (role) {
      case 'user':
        return 'You';
      case 'bot1':
        return 'Pro Bot (OpenAI)';
      case 'bot2':
        return 'Con Bot (Gemini)';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`message-bubble ${getBubbleClass()}`}>
      <div className="message-header">
        <span className="message-sender">{getDisplayName()}</span>
      </div>
      <div className="message-content">
        {content}
      </div>
    </div>
  );
};

export default MessageBubble;
