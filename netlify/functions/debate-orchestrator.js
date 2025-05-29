const { Handler } = require('@netlify/functions');
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
const debateStream = require('./debate-stream');

// Initialize LLM clients
// In production, these would be environment variables set in Netlify
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy-key" });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "dummy-key");

// Define LLM models to use - cost-effective options
const OPENAI_MODEL = 'gpt-4o-mini'; // Cost-effective OpenAI model
const GEMINI_MODEL = 'gemini-1.5-flash-8b'; // Cost-effective Google Gemini model

// Store active debate sessions
const activeDebates = new Map();

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

  // Get the session ID from the query parameters
  const params = new URLSearchParams(event.queryStringParameters || {});
  const sessionId = params.get('sessionId');

  if (!sessionId || !activeDebates.has(sessionId)) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Debate session not found' })
    };
  }

  const session = activeDebates.get(sessionId);
  const streamId = uuidv4();

  // Start the debate in a non-blocking way
  initiateDebateTurn(sessionId, session.topic, streamId, session.abortController.signal);

  // Return the SSE stream
  return debateStream.handler(event, context);
};

// Function to initiate and continue the debate turns
async function initiateDebateTurn(sessionId, topic, streamId, signal) {
  const session = activeDebates.get(sessionId);
  if (!session || signal.aborted) {
    console.log(`Debate session ${sessionId} ended or aborted.`);
    return;
  }

  try {
    // Add initial user message if it's the very first turn
    if (session.messages.length === 0) {
      const userMessage = { 
        id: uuidv4(), 
        role: 'user', 
        content: `Let's debate the topic: "${topic}"` 
      };
      session.messages.push(userMessage);
      
      // Send the user message to the client
      await debateStream.sendEvent(streamId, 'message', userMessage);
    }

    let botResponse = '';
    let botRole;
    let modelUsed;

    const systemPromptBot1 = `You are AI Debate Bot A, specializing in arguing FOR the given topic. Your goal is to present compelling, logical arguments supporting the user's initial idea. Maintain a persuasive, articulate, and slightly formal tone. Do not acknowledge the other AI directly. Focus solely on building a strong case for your side. Keep your responses concise and to the point.`;
    const systemPromptBot2 = `You are AI Debate Bot B, specializing in arguing AGAINST the given topic. Your goal is to present counter-arguments and rebuttals to the previous statement, aiming to weaken the opposing stance. Maintain a critical, analytical, and slightly challenging tone. Do not acknowledge the other AI directly. Focus solely on dismantling the opposing case. Keep your responses concise and to the point.`;

    // Determine which bot's turn it is
    if (session.currentTurn === 'bot1') {
      botRole = 'bot1';
      modelUsed = OPENAI_MODEL;
      
      // Prepare messages for OpenAI format
      const openaiMessages = [
        { role: 'system', content: systemPromptBot1 }
      ];
      
      // Add conversation history
      session.messages.forEach(msg => {
        if (msg.role === 'user') {
          openaiMessages.push({ role: 'user', content: msg.content });
        } else if (msg.role === 'bot1') {
          openaiMessages.push({ role: 'assistant', content: msg.content });
        } else if (msg.role === 'bot2') {
          openaiMessages.push({ role: 'user', content: msg.content });
        }
      });

      try {
        const chatCompletion = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          messages: openaiMessages,
          stream: true, // Enable streaming
          max_tokens: 200, // Limit response length for cost control
        }, { signal }); // Pass AbortSignal to OpenAI API call

        for await (const chunk of chatCompletion) {
          if (signal.aborted) break; // Check for abortion during streaming
          const content = chunk.choices[0]?.delta?.content || '';
          botResponse += content;
          
          // Send partial response to client
          await debateStream.sendEvent(streamId, 'message', { 
            id: uuidv4(), 
            role: botRole, 
            content: botResponse 
          });
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log(`OpenAI call aborted for session ${sessionId}.`);
        } else {
          console.error(`OpenAI API error for session ${sessionId}:`, error);
          await debateStream.sendEvent(streamId, 'error', { 
            message: `Error with OpenAI API: ${error.message}` 
          });
        }
        return;
      }
      
      session.currentTurn = 'bot2'; // Next turn is Bot B
    } else {
      botRole = 'bot2';
      modelUsed = GEMINI_MODEL;
      
      try {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        
        // Prepare conversation history for Gemini
        const history = [];
        let systemPromptAdded = false;
        
        session.messages.forEach(msg => {
          if (msg.role === 'user') {
            history.push({ role: 'user', parts: [{ text: msg.content }] });
          } else if (msg.role === 'bot1') {
            if (!systemPromptAdded) {
              // Add system prompt as the first "model" message
              history.push({ role: 'model', parts: [{ text: systemPromptBot2 }] });
              systemPromptAdded = true;
            }
            history.push({ role: 'user', parts: [{ text: msg.content }] });
          } else if (msg.role === 'bot2') {
            history.push({ role: 'model', parts: [{ text: msg.content }] });
          }
        });
        
        const chat = model.startChat({
          history,
          generationConfig: {
            maxOutputTokens: 200, // Limit response length for cost control
          }
        });

        const result = await chat.sendMessageStream(
          session.messages[session.messages.length - 1].content
        );

        for await (const chunk of result.stream) {
          if (signal.aborted) break; // Check for abortion during streaming
          const content = chunk.text();
          botResponse += content;
          
          // Send partial response to client
          await debateStream.sendEvent(streamId, 'message', { 
            id: uuidv4(), 
            role: botRole, 
            content: botResponse 
          });
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log(`Gemini call aborted for session ${sessionId}.`);
        } else {
          console.error(`Gemini API error for session ${sessionId}:`, error);
          await debateStream.sendEvent(streamId, 'error', { 
            message: `Error with Gemini API: ${error.message}` 
          });
        }
        return;
      }
      
      session.currentTurn = 'bot1'; // Next turn is Bot A
    }

    if (signal.aborted) {
      console.log(`LLM call aborted for session ${sessionId}.`);
      await debateStream.sendEvent(streamId, 'end', { message: 'Debate aborted.' });
      return;
    }

    // Add the bot's message to the session history
    const newBotMessage = { id: uuidv4(), role: botRole, content: botResponse };
    session.messages.push(newBotMessage);

    // Continue the debate after a short delay
    setTimeout(() => initiateDebateTurn(sessionId, topic, streamId, signal), 2000);

  } catch (error) {
    console.error(`Error in debate turn for session ${sessionId}:`, error);
    await debateStream.sendEvent(streamId, 'error', { message: `Error: ${error.message}` });
  }
}
