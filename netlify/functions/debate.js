const { Handler } = require('@netlify/functions');
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin SDK
// In production, these would be environment variables set in Netlify
const serviceAccount = {
  projectId: process.env.FIRESTORE_PROJECT_ID || "ai-debate-bot",
  privateKey: process.env.FIRESTORE_PRIVATE_KEY || "dummy-key",
  clientEmail: process.env.FIRESTORE_CLIENT_EMAIL || "dummy@example.com",
};

// Only initialize Firebase if it hasn't been initialized yet
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.log('Firebase admin initialization error:', error.stack);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// Initialize LLM clients
// In production, these would be environment variables set in Netlify
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy-key" });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "dummy-key");

// Define LLM models to use - cost-effective options
const OPENAI_MODEL = 'gpt-4o-mini'; // Cost-effective OpenAI model
const GEMINI_MODEL = 'gemini-1.5-flash-8b'; // Cost-effective Google Gemini model

// Store active debate sessions and their AbortControllers
const activeDebates = new Map();

// Main handler for debate function
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { topic, action, sessionId: clientSessionId } = JSON.parse(event.body || '{}');

    if (action === 'start') {
      const sessionId = uuidv4(); // Generate a unique session ID for each debate
      
      console.log(`Starting new debate session ${sessionId} on topic: ${topic}`);
      
      // Store active session details
      activeDebates.set(sessionId, {
        topic,
        messages: [],
        currentTurn: 'bot1', // Bot A starts
        abortController: new AbortController(),
      });

      // If Firebase is initialized, store the session
      if (db) {
        try {
          await db.collection('debates').doc(sessionId).set({
            topic,
            messages: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (dbError) {
          console.error('Firestore error:', dbError);
          // Continue even if DB fails - we'll use in-memory storage
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          sessionId, 
          message: 'Debate started. Connect to the SSE stream to receive updates.' 
        })
      };
    } 
    else if (action === 'stop') {
      // If specific sessionId provided
      if (clientSessionId && activeDebates.has(clientSessionId)) {
        const session = activeDebates.get(clientSessionId);
        session.abortController.abort();
        activeDebates.delete(clientSessionId);
        console.log(`Debate session ${clientSessionId} stopped.`);
      } else {
        // If no specific session ID, stop all (for simplicity)
        activeDebates.forEach((session, id) => {
          session.abortController.abort();
        });
        activeDebates.clear();
        console.log('All active debates stopped.');
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Debate stopped.' })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action.' })
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error.' })
    };
  }
};
