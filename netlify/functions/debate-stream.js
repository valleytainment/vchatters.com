const { createSessionController, removeSessionController, getOpenAIClient, getGeminiClient } = require('./debate-orchestrator');

// SSE helper function to format SSE messages
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
  
  // Create a new abort controller for this session
  const controller = createSessionController(sessionId);
  const signal = controller.signal;
  
  // Initialize OpenAI and Gemini clients
  const openai = getOpenAIClient();
  const genAI = getGeminiClient();
  
  // Set up response streaming
  return {
    statusCode: 200,
    headers,
    body: new Promise(async (resolve, reject) => {
      let responseText = '';
      
      try {
        // Start the debate with alternating turns
        
        // First turn - OpenAI (Pro argument)
        try {
          responseText += formatSSE({ type: 'message', role: 'bot1', content: 'I will argue in favor of this topic.' });
          
          const openaiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
          const proPrompt = `You are AI Debate Bot A, specializing in arguing for a given topic. 
          Your goal is to present compelling, logical arguments supporting the following topic: "${topic}". 
          Maintain a persuasive, articulate, and slightly formal tone. 
          Do not acknowledge the other AI directly. 
          Focus solely on building a strong case for your side. 
          Keep your response concise (maximum 200 tokens).`;
          
          const proResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: proPrompt }],
            max_tokens: 200,
            temperature: 0.7,
            stream: true
          }, { signal });
          
          let proContent = '';
          for await (const chunk of proResponse) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              proContent += content;
              responseText += formatSSE({ type: 'message', role: 'bot1', content: proContent });
            }
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            responseText += formatSSE({ type: 'done', message: 'Debate stopped by user' });
            resolve(responseText);
            removeSessionController(sessionId);
            return;
          }
          throw error;
        }
        
        // Second turn - Gemini (Con argument)
        try {
          responseText += formatSSE({ type: 'message', role: 'bot2', content: 'I will argue against this topic.' });
          
          const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
          const conPrompt = `You are AI Debate Bot B, specializing in arguing against a given topic. 
          Your goal is to present counter-arguments and rebuttals to the following topic: "${topic}". 
          Maintain a critical, analytical, and slightly challenging tone. 
          Do not acknowledge the other AI directly. 
          Focus solely on dismantling the opposing case. 
          Keep your response concise (maximum 200 tokens).`;
          
          const conResult = await geminiModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: conPrompt }] }],
            generationConfig: {
              maxOutputTokens: 200,
              temperature: 0.7
            }
          });
          
          const conResponse = conResult.response;
          const conContent = conResponse.text();
          responseText += formatSSE({ type: 'message', role: 'bot2', content: conContent });
        } catch (error) {
          if (error.name === 'AbortError') {
            responseText += formatSSE({ type: 'done', message: 'Debate stopped by user' });
            resolve(responseText);
            removeSessionController(sessionId);
            return;
          }
          throw error;
        }
        
        // Indicate that the debate is complete
        responseText += formatSSE({ type: 'done', message: 'Debate complete' });
        resolve(responseText);
        removeSessionController(sessionId);
      } catch (error) {
        console.error('Error in debate stream:', error);
        responseText += formatSSE({ 
          type: 'error', 
          message: 'An error occurred during the debate',
          error: error.message
        });
        responseText += formatSSE({ type: 'done', message: 'Debate ended due to error' });
        resolve(responseText);
        removeSessionController(sessionId);
      }
    })
  };
};
