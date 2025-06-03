import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ role, content }) => {
  const isBot1 = role === 'bot1';
  const isBot2 = role === 'bot2';
  const isUser = role === 'user';

  const getBubbleClass = () => {
    if (isBot1) return 'message-bubble bot1';
    if (isBot2) return 'message-bubble bot2';
    if (isUser) return 'message-bubble user';
    return 'message-bubble';
  };

  const getSenderLabel = () => {
    if (isBot1) return 'ChatGPT (Pro)';
    if (isBot2) return 'Gemini (Con)';
    if (isUser) return 'You';
    return '';
  };

  return (
    <div className={`message-container ${isUser ? 'user-container' : ''}`}>
      <div className="sender-label">{getSenderLabel()}</div>
      <div className={getBubbleClass()}>
        <p>{content}</p>
      </div>
    </div>
  );
};

export default MessageBubble;
