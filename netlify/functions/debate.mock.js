// Mock implementation for local testing without actual API calls
const mockDebateResponses = {
  bot1: [
    "I strongly support this topic for several key reasons. First, the evidence clearly shows positive outcomes when implemented correctly. Studies have consistently demonstrated improvements in efficiency, satisfaction, and overall results. Additionally, this approach addresses many of the challenges we currently face in this area.",
    "Looking at the historical context, similar initiatives have proven successful in comparable situations. The benefits extend beyond immediate results to create lasting positive change. Furthermore, the economic analysis indicates a favorable cost-benefit ratio when considering both short and long-term impacts.",
    "When we examine the ethical dimensions, supporting this position aligns with widely accepted principles of fairness and equity. It creates opportunities for advancement while minimizing potential harms. The adaptability of this approach also means it can be tailored to different contexts and needs."
  ],
  bot2: [
    "I must disagree with this position based on several critical concerns. The proposed approach overlooks significant challenges in practical implementation. Evidence from similar attempts shows mixed results at best, with many cases failing to achieve their stated objectives. We need to consider the unintended consequences that often emerge.",
    "From an economic perspective, the costs frequently outweigh the benefits when all factors are properly accounted for. Hidden expenses and maintenance requirements create ongoing burdens that aren't initially apparent. Alternative approaches offer more sustainable and effective solutions to the same problems.",
    "The ethical implications also raise serious questions. This approach may inadvertently create or reinforce inequalities in access and outcomes. Historical precedents demonstrate that similar initiatives have often benefited certain groups while disadvantaging others. We should instead focus on more inclusive and balanced alternatives."
  ]
};

let currentTurnIndex = 0;

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
