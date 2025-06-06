// Mock data for frontend testing
const mockDebate = {
  messages: [
    {
      id: 1,
      role: 'user',
      content: 'Climate change solutions',
      timestamp: Date.now() - 5000
    },
    {
      id: 2,
      role: 'bot1',
      content: "I strongly support addressing climate change through comprehensive solutions. First, the evidence clearly shows positive outcomes when implemented correctly. Studies have consistently demonstrated that renewable energy adoption, carbon pricing, and sustainable agriculture can significantly reduce emissions while creating economic opportunities.",
      timestamp: Date.now() - 4000
    },
    {
      id: 3,
      role: 'bot2',
      content: "I must disagree with the proposed approach to climate change solutions. Many suggested interventions overlook significant challenges in practical implementation. Evidence from similar attempts shows mixed results at best, with many cases failing to achieve their stated emission reduction targets while imposing substantial economic costs.",
      timestamp: Date.now() - 3000
    }
  ]
};

export default mockDebate;
