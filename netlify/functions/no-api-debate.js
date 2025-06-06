// No-API mode handler for debate stop action
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
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ status: 'stopped' })
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
