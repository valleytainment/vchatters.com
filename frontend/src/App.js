import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import TopicInput from './components/TopicInput';
import DebateChat from './components/DebateChat';

function App() {
  const [topic, setTopic] = useState('');
  const [messages, setMessages] = useState([]);
  const [isDebating, setIsDebating] = useState(false);
  const eventSourceRef = useRef(null);
  const abortControllerRef = useRef(null);

  const startDebate = async (inputTopic) => {
    if (!inputTopic.trim()) return;

    setTopic(inputTopic);
    setMessages([]);
    setIsDebating(true);

    // Initialize AbortController for this session
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Start the debate
      const response = await fetch('/api/debate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: inputTopic, action: 'start' }),
        signal: signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const sessionId = data.sessionId;

      // Set up SSE connection
      eventSourceRef.current = new EventSource('/api/debate-stream');

      eventSourceRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          setMessages((prevMessages) => [...prevMessages, { 
            id: data.id, 
            role: data.role, 
            content: data.content 
          }]);
        } else if (data.type === 'end') {
          setIsDebating(false);
          closeEventSource();
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error('EventSource failed:', error);
        setIsDebating(false);
        closeEventSource();
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Debate initiation aborted by user.');
      } else {
        console.error('Failed to start debate:', error);
      }
      setIsDebating(false);
      closeEventSource();
    }
  };

  const stopDebate = async () => {
    if (isDebating) {
      setIsDebating(false);
      
      // Abort any ongoing fetch requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      // Close the SSE connection
      closeEventSource();
      
      // Send stop signal to backend
      try {
        await fetch('/api/debate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'stop' }),
        });
      } catch (error) {
        console.error('Failed to send stop signal to backend:', error);
      }
    }
  };

  const closeEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      closeEventSource();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Debate Bot</h1>
        <p className="app-description">
          Enter a topic and watch two AI bots debate it in real-time
        </p>
      </header>
      <main className="app-main">
        <TopicInput 
          onStartDebate={startDebate} 
          onStopDebate={stopDebate} 
          isDebating={isDebating} 
        />
        <DebateChat 
          messages={messages} 
          isDebating={isDebating} 
        />
      </main>
      <footer className="app-footer">
        <p>Using OpenAI's ChatGPT and Google's Gemini for debate</p>
      </footer>
    </div>
  );
}

export default App;
