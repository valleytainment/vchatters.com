const { getSessionController } = require('./debate-orchestrator');

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
    const controller = getSessionController(sessionId);
    
    if (controller) {
      controller.abort();
      
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
