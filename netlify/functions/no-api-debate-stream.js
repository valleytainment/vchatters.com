// Enhanced mock implementation for no-API mode
const formatSSE = (data) => `data: ${JSON.stringify(data)}\n\n`;

// More comprehensive mock responses for a better no-API experience
const mockResponses = {
  bot1: {
    "climate change": [
      "I strongly support addressing climate change through comprehensive solutions. The scientific consensus is clear that human activities are causing global warming, with potentially catastrophic consequences if left unchecked. Renewable energy technologies like solar and wind are now cost-competitive with fossil fuels in many markets, making the transition economically viable.",
      "Building on my previous points, investing in climate solutions creates jobs and economic opportunities. Studies show that renewable energy projects create more jobs per dollar invested than fossil fuel projects. Additionally, the costs of inaction far outweigh the costs of action - from increased natural disasters to agricultural disruption and health impacts.",
      "To conclude my argument, addressing climate change is not just an environmental imperative but a moral one. Future generations deserve a habitable planet. With international cooperation, policy frameworks like carbon pricing, and technological innovation, we can achieve significant emissions reductions while improving quality of life globally."
    ],
    "artificial intelligence": [
      "I strongly support the development and integration of artificial intelligence across society. AI technologies have demonstrated remarkable capabilities in healthcare, where they can detect diseases earlier and more accurately than human doctors in some cases. In transportation, autonomous vehicles promise to dramatically reduce the 1.35 million annual deaths from road accidents worldwide.",
      "Furthermore, AI is driving economic growth and productivity. Automation of routine tasks frees humans for more creative and fulfilling work. AI tools are democratizing access to capabilities once reserved for specialists, from language translation to complex data analysis, empowering individuals and small businesses to compete globally.",
      "Finally, responsible AI development can help address humanity's greatest challenges. AI systems are accelerating scientific discovery in fields from climate science to drug development. With proper ethical frameworks and governance, the benefits of AI can be broadly shared while minimizing potential harms."
    ],
    "social media": [
      "I strongly support the positive role of social media in modern society. These platforms have democratized information sharing, allowing voices to be heard that were previously excluded from traditional media. During crises, social media enables rapid dissemination of critical information and coordination of community responses.",
      "Social media has also created economic opportunities for millions through content creation, influencer marketing, and direct-to-consumer business models. Small businesses can now reach global audiences without massive advertising budgets. For marginalized communities, these platforms provide spaces for connection, support, and organizing.",
      "While acknowledging concerns about privacy and misinformation, the solution lies in better regulation and digital literacy, not abandonment of these powerful tools. Social media's ability to connect people across geographic, cultural, and social boundaries represents a net positive for humanity."
    ],
    "default": [
      "I strongly support this topic for several key reasons. First, the evidence clearly shows positive outcomes when implemented correctly. Studies have consistently demonstrated improvements in efficiency, satisfaction, and overall results. Additionally, this approach addresses many of the challenges we currently face in this area.",
      "Looking at the historical context, similar initiatives have proven successful in comparable situations. The benefits extend beyond immediate results to create lasting positive change. Furthermore, the economic analysis indicates a favorable cost-benefit ratio when considering both short and long-term impacts.",
      "When we examine the ethical dimensions, supporting this position aligns with widely accepted principles of fairness and equity. It creates opportunities for advancement while minimizing potential harms. The adaptability of this approach also means it can be tailored to different contexts and needs."
    ]
  },
  bot2: {
    "climate change": [
      "I must challenge the prevailing narrative on climate change solutions. While climate change itself is real, many proposed interventions are economically devastating and ineffective. The rapid abandonment of fossil fuels before alternatives are truly ready risks energy poverty for billions and economic collapse in developing nations that depend on affordable energy for growth.",
      "The focus on emissions reduction in Western countries ignores the reality that developing nations like China and India are the largest and fastest-growing emitters. Costly policies in the West simply shift emissions elsewhere through carbon leakage. Additionally, climate models have consistently overestimated warming rates, suggesting less urgency than often portrayed.",
      "A more balanced approach would focus on adaptation, resilience, and technological innovation rather than economically harmful restrictions. Nuclear energy, which produces zero emissions during operation, is often opposed by the same advocates demanding climate action. This contradiction reveals that the debate is often more ideological than practical."
    ],
    "artificial intelligence": [
      "I must challenge the optimistic view of artificial intelligence. AI poses significant risks to employment and economic stability. Automation is already eliminating jobs faster than new ones are being created in many sectors. Unlike previous technological revolutions, AI threatens to replace not just manual labor but cognitive work, potentially leading to unprecedented levels of structural unemployment.",
      "AI systems also raise profound ethical concerns. These technologies often perpetuate and amplify existing biases in their training data. Facial recognition systems have demonstrated alarming error rates for women and people of color. Additionally, the environmental impact of training large AI models is substantial, with the carbon footprint of developing some systems equivalent to the lifetime emissions of five cars.",
      "Perhaps most concerning is the concentration of AI power in a few corporations and governments. This creates risks of surveillance, manipulation, and control unprecedented in human history. Without robust international governance frameworks, which currently don't exist, AI development may become a dangerous race to the bottom in terms of safety and ethics."
    ],
    "social media": [
      "I must challenge the positive portrayal of social media's impact on society. These platforms have created unprecedented mental health challenges, particularly for young people. Studies consistently show correlations between social media use and increased rates of depression, anxiety, and loneliness. The constant comparison to curated, unrealistic portrayals of others' lives damages self-esteem.",
      "Social media algorithms are designed to maximize engagement, which often means amplifying divisive, emotional, and misleading content. This has contributed to political polarization, the spread of misinformation, and the erosion of shared truth. Democratic discourse requires good-faith exchange of ideas, which these platforms systematically undermine.",
      "Furthermore, the surveillance capitalism business model underlying most social media platforms represents a profound threat to privacy and autonomy. Users' most intimate data is harvested, analyzed, and used to predict and influence behavior. This creates power imbalances between platforms and users that no amount of regulation within the current paradigm can fully address."
    ],
    "default": [
      "I must disagree with this position based on several critical concerns. The proposed approach overlooks significant challenges in practical implementation. Evidence from similar attempts shows mixed results at best, with many cases failing to achieve their stated objectives. We need to consider the unintended consequences that often emerge.",
      "From an economic perspective, the costs frequently outweigh the benefits when all factors are properly accounted for. Hidden expenses and maintenance requirements create ongoing burdens that aren't initially apparent. Alternative approaches offer more sustainable and effective solutions to the same problems.",
      "The ethical implications also raise serious questions. This approach may inadvertently create or reinforce inequalities in access and outcomes. Historical precedents demonstrate that similar initiatives have often benefited certain groups while disadvantaging others. We should instead focus on more inclusive and balanced alternatives."
    ]
  }
};

// Helper function to get the appropriate response based on topic
const getTopicResponses = (role, topic) => {
  const lowerTopic = topic.toLowerCase();
  const botResponses = mockResponses[role];
  
  // Check if we have specific responses for this topic
  for (const key of Object.keys(botResponses)) {
    if (lowerTopic.includes(key)) {
      return botResponses[key];
    }
  }
  
  // Return default responses if no match
  return botResponses.default;
};

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
  
  // Set up response streaming
  return {
    statusCode: 200,
    headers,
    body: new Promise(async (resolve) => {
      let responseText = '';
      
      try {
        // Get topic-specific responses
        const bot1Responses = getTopicResponses('bot1', topic);
        const bot2Responses = getTopicResponses('bot2', topic);
        
        // Simulate streaming with delays
        
        // First turn - Bot 1 (Pro argument)
        responseText += formatSSE({ type: 'message', role: 'bot1', content: '' });
        
        const bot1Response = bot1Responses[0];
        for (let i = 0; i < bot1Response.length; i++) {
          await new Promise(r => setTimeout(r, 30)); // Simulate typing delay
          responseText += formatSSE({ 
            type: 'message', 
            role: 'bot1', 
            content: bot1Response.substring(0, i + 1) 
          });
        }
        
        await new Promise(r => setTimeout(r, 1000)); // Pause between bots
        
        // Second turn - Bot 2 (Con argument)
        responseText += formatSSE({ type: 'message', role: 'bot2', content: '' });
        
        const bot2Response = bot2Responses[0];
        for (let i = 0; i < bot2Response.length; i++) {
          await new Promise(r => setTimeout(r, 30)); // Simulate typing delay
          responseText += formatSSE({ 
            type: 'message', 
            role: 'bot2', 
            content: bot2Response.substring(0, i + 1) 
          });
        }
        
        // Continue with additional turns if desired
        // This could be expanded to include more back-and-forth
        
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
