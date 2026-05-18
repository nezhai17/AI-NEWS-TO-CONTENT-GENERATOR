import axios from 'axios';

export interface AgentWorkflowResult {
  finalContent: string;
  workflow: {
    agent: string;
    output: string;
  }[];
  prediction: {
    score: number;
    signals: string[];
    friction: string[];
  };
}

export const aiService = {
  orchestrate: async (sourceText: string, platform: string, strategy?: any, targetFormat: string = 'Standard Post'): Promise<AgentWorkflowResult> => {
    const response = await axios.post('/api/agents/orchestrate', {
      sourceText,
      platform,
      strategy,
      targetFormat
    });
    return response.data;
  },

  getTrends: async (): Promise<{ trends: string }> => {
    const response = await axios.get('/api/trends/detect');
    return response.data;
  },

  predictEngagement: async (content: string, platform: string) => {
    const response = await axios.post('/api/predict-engagement', {
      content,
      platform
    });
    return response.data;
  },

  generateImage: async (prompt: string, aspectRatio: string = "1:1"): Promise<string> => {
    const response = await axios.post('/api/generate-image', { prompt, aspectRatio });
    return response.data.imageUrl;
  },

  generateStrategy: async (niche: string, usp: string, goals: string): Promise<any> => {
    const response = await axios.post('/api/agents/strategy', { niche, usp, goals });
    return response.data;
  },

  repurpose: async (content: string, targetPlatform: string, brandVoice?: string): Promise<{ content: string }> => {
    const response = await axios.post('/api/agents/repurpose', { content, targetPlatform, brandVoice });
    return response.data;
  },

  autoBuildCampaign: async (goal: string, workspaceId: string): Promise<any> => {
    const response = await axios.post('/api/automate/campaign', { goal, workspaceId });
    return response.data;
  },

  getRepurposeSuggestions: async (recentProjects: any[]): Promise<any[]> => {
    const response = await axios.post('/api/automate/repurpose-suggestions', { recentProjects });
    return response.data;
  },

  syncTrend: async (trend: string, strategy?: any, platform: string = 'LinkedIn', targetFormat: string = 'Thought Leadership Post'): Promise<any> => {
    const response = await axios.post('/api/automate/trend-sync', { trend, strategy, platform, targetFormat });
    return response.data;
  },

  getOptimizationSuggestions: async (profile: any, history: any[]): Promise<any> => {
    const response = await axios.post('/api/automate/optimize-profile', { profile, history });
    return response.data;
  },

  getMarketWatch: async (topic: string, strategy: any): Promise<any> => {
    const response = await axios.post('/api/automate/market-watch', { topic, strategy });
    return response.data;
  },

  getContentRoadmap: async (strategy: any): Promise<any> => {
    const response = await axios.post('/api/automate/content-roadmap', { strategy });
    return response.data;
  },
  getTelemetry: async (): Promise<any> => {
    const response = await axios.get('/api/ai/telemetry');
    return response.data;
  }
};
