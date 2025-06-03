import React, { useState, useEffect, useRef } from 'react';
import './DebateChat.css';
import MessageBubble from './MessageBubble';

const DebateChat = ({ messages, isDebating }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="debate-chat-container">
      <div className="messages-container">
        {messages.length === 0 && !isDebating ? (
          <div className="empty-state">
            <p>Enter a topic above and start the debate to see AI bots discuss it in real-time</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <MessageBubble 
                key={index} 
                role={msg.role} 
                content={msg.content} 
              />
            ))}
            {isDebating && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default DebateChat;
