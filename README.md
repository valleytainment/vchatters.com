# AI Debate Bot - README

## Overview
AI Debate Bot is a cost-optimized web application that facilitates real-time debates between two distinct AI chatbots (OpenAI's ChatGPT and Google's Gemini) on user-provided topics. The application is designed to be highly cost-effective while providing an engaging, interactive experience.

## Features
- User-friendly interface for entering debate topics
- Real-time debate between two AI models with different perspectives
- Cost-optimized implementation using efficient LLM models
- Server-Sent Events (SSE) for real-time updates
- Robust session management and error handling
- Prominent "Stop" button to immediately halt debates and prevent unnecessary costs

## Technology Stack
- **Frontend**: React with JavaScript
- **Backend**: Netlify Functions (serverless)
- **Real-time Updates**: Server-Sent Events (SSE)
- **Database**: Firebase Firestore (optional)
- **LLM Integration**: 
  - OpenAI (gpt-4o-mini) for Pro-Argument Bot
  - Google Gemini (gemini-1.5-flash-8b) for Con-Argument Bot

## Cost Optimization
This application is designed to be extremely cost-effective:
- Uses the most cost-efficient LLM models (mini/flash variants)
- Implements token limits to control response lengths
- Features immediate request cancellation via AbortController
- Manages conversation history efficiently
- Operates within free tiers of all services when possible

## Project Structure
```
ai-debate-bot/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── TopicInput.js
│   │   │   ├── DebateChat.js
│   │   │   └── MessageBubble.js
│   │   ├── App.js          # Main application component
│   │   └── index.js        # Entry point
│   └── public/             # Static assets
├── netlify/
│   └── functions/          # Netlify serverless functions
│       ├── debate.js       # Main debate handler
│       ├── debate-stream.js # SSE implementation
│       └── debate-orchestrator.js # LLM orchestration
└── netlify.toml            # Netlify configuration
```

## Setup and Deployment
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd frontend && npm install
   ```
3. Set up environment variables in Netlify:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `GOOGLE_GEMINI_API_KEY`: Your Google Gemini API key
   - `FIRESTORE_PROJECT_ID`: Firebase project ID (optional)
   - `FIRESTORE_PRIVATE_KEY`: Firebase private key (optional)
   - `FIRESTORE_CLIENT_EMAIL`: Firebase client email (optional)

4. Run locally:
   ```
   npm run dev
   ```

5. Deploy to Netlify:
   ```
   netlify deploy --prod
   ```

## Usage
1. Enter a debate topic in the input field
2. Click "Start Debate" to begin the AI debate
3. Watch as the two AI bots discuss the topic in real-time
4. Click "Stop Debate" at any time to end the conversation

## Cost Control Mechanisms
- **Token Limits**: Maximum 200 tokens per response
- **Abort Controller**: Immediately cancels in-flight API requests
- **Session Management**: Properly tracks and cleans up debate sessions
- **Streaming Responses**: Processes responses as they arrive rather than waiting for completion

## Future Enhancements
- User authentication for personalized experiences
- Debate scoring/judging functionality
- Customizable AI personas
- Sharing/exporting debate transcripts

## License
This project is licensed under the MIT License - see the LICENSE file for details.
