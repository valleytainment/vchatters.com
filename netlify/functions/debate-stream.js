const { Handler } = require('@netlify/functions');
const { v4: uuidv4 } = require('uuid');

// Store active SSE connections
const connections = new Map();

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // This is where we'd normally get the sessionId from query params
  // For simplicity in this demo, we'll create a new stream for each connection
  const streamId = uuidv4();

  // Create a new stream
  return {
    statusCode: 200,
    headers,
    body: new Promise((resolve) => {
      // Store the resolver function to be called when the connection should be closed
      connections.set(streamId, resolve);

      // Set up a heartbeat to keep the connection alive
      const heartbeatInterval = setInterval(() => {
        resolve(`event: heartbeat\ndata: ${new Date().toISOString()}\n\n`);
        
        // Create a new promise for the next heartbeat
        const newPromise = new Promise((newResolve) => {
          connections.set(streamId, newResolve);
        });
        
        resolve = newPromise;
      }, 30000); // Send heartbeat every 30 seconds

      // Clean up if the client disconnects
      context.awslambda?.response.once('finish', () => {
        clearInterval(heartbeatInterval);
        connections.delete(streamId);
      });

      // Initial connection message
      resolve(`event: connected\ndata: ${JSON.stringify({ id: streamId })}\n\n`);
      
      // Create a new promise for the next event
      const newPromise = new Promise((newResolve) => {
        connections.set(streamId, newResolve);
      });
      
      resolve = newPromise;
    }),
    isBase64Encoded: false,
  };
};

// Export a function to send events to active connections
exports.sendEvent = (streamId, eventType, data) => {
  const resolver = connections.get(streamId);
  if (resolver) {
    resolver(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
    
    // Create a new promise for the next event
    const newPromise = new Promise((newResolve) => {
      connections.set(streamId, newResolve);
    });
    
    return newPromise;
  }
  return null;
};
