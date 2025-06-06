const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key'
});

// Initialize Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || 'mock-key');

// Active debate sessions with their abort controllers
const activeSessions = new Map();

// Main debate orchestration function
exports.handler = async function(event, context) {
  // Parse request
  const method = event.httpMethod;
  const queryParams = event.queryStringParameters || {};
  const { sessionId, action } = queryParams;
  
  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }
  
  // Handle stop action
  if (method === 'POST' && action === 'stop' && sessionId) {
    if (activeSessions.has(sessionId)) {
      const controller = activeSessions.get(sessionId);
      controller.abort();
      activeSessions.delete(sessionId);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ status: 'stopped' })
      };
    }
    
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Session not found' })
    };
  }
  
  // All other requests are not handled by this function
  return {
    statusCode: 400,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ error: 'Invalid request' })
  };
};

// Create a new abort controller for a session
exports.createSessionController = (sessionId) => {
  const controller = new AbortController();
  activeSessions.set(sessionId, controller);
  return controller;
};

// Remove a session controller
exports.removeSessionController = (sessionId) => {
  if (activeSessions.has(sessionId)) {
    activeSessions.delete(sessionId);
  }
};

// Get OpenAI client
exports.getOpenAIClient = () => openai;

// Get Google Gemini client
exports.getGeminiClient = () => genAI;

// Get abort controller for a session
exports.getSessionController = (sessionId) => {
  return activeSessions.get(sessionId);
};
