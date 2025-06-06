// Mock implementation for local testing without actual API calls
const formatSSE = (data) => `data: ${JSON.stringify(data)}\n\n`;

exports.handler = async function(event, context) {
  // Parse request
  const queryParams = event.queryStringParameters || {};
  const { topic, sessionId } = queryParams;
  
  if (!topic || !sessionId) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Missing required parameters' })
    };
  }
  
  // Set up SSE response headers
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  };
  
  // Mock debate responses
  const mockResponses = {
    bot1: [
      "I strongly support this topic for several key reasons. First, the evidence clearly shows positive outcomes when implemented correctly. Studies have consistently demonstrated improvements in efficiency, satisfaction, and overall results.",
      "Looking at the historical context, similar initiatives have proven successful in comparable situations. The benefits extend beyond immediate results to create lasting positive change.",
      "When we examine the ethical dimensions, supporting this position aligns with widely accepted principles of fairness and equity. It creates opportunities for advancement while minimizing potential harms."
    ],
    bot2: [
      "I must disagree with this position based on several critical concerns. The proposed approach overlooks significant challenges in practical implementation. Evidence from similar attempts shows mixed results at best.",
      "From an economic perspective, the costs frequently outweigh the benefits when all factors are properly accounted for. Hidden expenses and maintenance requirements create ongoing burdens that aren't initially apparent.",
      "The ethical implications also raise serious questions. This approach may inadvertently create or reinforce inequalities in access and outcomes. Historical precedents demonstrate that similar initiatives have often had unintended consequences."
    ]
  };
  
  // Set up response streaming
  return {
    statusCode: 200,
    headers,
    body: new Promise(async (resolve) => {
      let responseText = '';
      
      try {
        // Simulate streaming with delays
        
        // First turn - Bot 1 (Pro argument)
        responseText += formatSSE({ type: 'message', role: 'bot1', content: '' });
        
        const bot1Response = mockResponses.bot1[0];
        for (let i = 0; i < bot1Response.length; i++) {
          await new Promise(r => setTimeout(r, 50)); // Simulate typing delay
          responseText += formatSSE({ 
            type: 'message', 
            role: 'bot1', 
            content: bot1Response.substring(0, i + 1) 
          });
        }
        
        await new Promise(r => setTimeout(r, 1000)); // Pause between bots
        
        // Second turn - Bot 2 (Con argument)
        responseText += formatSSE({ type: 'message', role: 'bot2', content: '' });
        
        const bot2Response = mockResponses.bot2[0];
        for (let i = 0; i < bot2Response.length; i++) {
          await new Promise(r => setTimeout(r, 50)); // Simulate typing delay
          responseText += formatSSE({ 
            type: 'message', 
            role: 'bot2', 
            content: bot2Response.substring(0, i + 1) 
          });
        }
        
        // Indicate that the debate is complete
        responseText += formatSSE({ type: 'done', message: 'Debate complete' });
        resolve(responseText);
      } catch (error) {
        console.error('Error in mock debate stream:', error);
        responseText += formatSSE({ 
          type: 'error', 
          message: 'An error occurred during the debate',
          error: error.message
        });
        responseText += formatSSE({ type: 'done', message: 'Debate ended due to error' });
        resolve(responseText);
      }
    })
  };
};
