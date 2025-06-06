import React, { useRef, useEffect } from 'react';
import './DebateChat.css';
import MessageBubble from './MessageBubble';

const DebateChat = ({ messages, isDebating }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="debate-chat-container">
      <div className="debate-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Enter a topic above and click "Start Debate" to begin.</p>
            <p>Two AI bots will debate the topic in real-time - one arguing for and one against.</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
              />
            ))}
            {isDebating && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default DebateChat;
