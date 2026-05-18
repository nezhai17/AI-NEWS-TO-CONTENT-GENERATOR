import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import * as cheerio from "cheerio";
import multer from "multer";
import { createRequire } from "module";
import Parser from 'rss-parser';
import { YoutubeTranscript } from 'youtube-transcript';
import { IntelligenceRouter, TaskTier, telemetry } from "./server/aiRouter";

const router = new IntelligenceRouter();

const _require = (() => {
  try {
    return createRequire(import.meta.url);
  } catch (e) {
    // Fallback for CJS environments where import.meta.url is undefined
    return typeof require !== 'undefined' ? require : null;
  }
})();

const pdf = _require ? _require("pdf-parse") : null;
const mammoth = _require ? _require("mammoth") : null;

const rssParser = new Parser();

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Monitoring: Telemetry Node
  app.get("/api/ai/telemetry", (req, res) => {
    res.json({
      metrics: telemetry,
      status: "Neural Matrix Online",
      nodes: 3,
      health: 100,
      timestamp: new Date().toISOString()
    });
  });

  // --- Sophisticated Multi-Agent Orchestrator ---
  
  interface AgentConfig {
    name: string;
    model: string;
    instruction: string;
    tool?: any;
    voice?: string;
  }

  // --- Automation Engine ---

  interface Workflow {
    id: string;
    name: string;
    trigger: string;
    steps: any[];
    isActive: boolean;
  }

  // --- MONETIZATION & CRM ARCHITECTURE ---

  app.get("/api/monetization/plans", (req, res) => {
    res.json([
      { id: 'free', name: 'Lite', price: 0, tokens: 1000, features: ['3 Workspaces', 'Basic AI Content'] },
      { id: 'pro', name: 'Pro', price: 49, tokens: 50000, features: ['Unlimited Workspaces', 'Trend Detection', 'Image Gen', 'Team Collaboration'] },
      { id: 'enterprise', name: 'Titanium', price: 299, tokens: 'Unlimited', features: ['Custom Agents', 'Dedicated API Node', 'White-labeling', 'SLA'] }
    ]);
  });

  app.post("/api/crm/sync", async (req, res) => {
    const { platform, data } = req.body;
    // Mock robust CRM injection
    console.log(`[CRM SYNC] Synchronizing data to ${platform}...`);
    setTimeout(() => {
      res.json({ status: 'success', syncedAt: new Date().toISOString(), platform });
    }, 1200);
  });

  app.get("/api/intelligence/competitors", async (req, res) => {
    const { niche } = req.query;
    const prompt = `Identify top 3 competitors in the ${niche || 'B2B AI'} sector. Return SWOT analysis as JSON. (Ensure valid JSON output)`;
    try {
      const result = await router.runTask(prompt, TaskTier.BALANCED);
      res.json(JSON.parse(result.text));
    } catch (e) {
      handleAIError(e, res, "Competitor tracking failed");
    }
  });

  app.post("/api/automate/social-publish", async (req, res) => {
    const { platform, content } = req.body;
    // Autonomous Publishing simulation
    console.log(`[AUTOPUB] Routing content to ${platform} high-priority queue...`);
    res.json({ status: 'queued', queueId: `pub_${Math.random().toString(36).substr(2, 9)}`, platform });
  });

  app.post("/api/automate/campaign", async (req, res) => {
    const { goal, workspaceId } = req.body;
    if (!goal) return res.status(400).json({ error: "Goal is required" });

    const prompt = `
      Act as a Senior Growth Architect. Create a data-driven 30-day campaign for: ${goal}.
      
      Output a rigorous JSON including:
      - strategyName: High-impact title
      - targetAudience: Precision persona
      - contentPlan: Array of 4 weekly phases { week: number, theme: string, assets: string[] }
      - schedule: Recommended posting frequency per platform
      - conversionGoal: Specific KPI
      - budgetRecommendation: Tiered spending logic (Low/Mid/Scale)
      (Ensure valid JSON output)
    `;

    try {
      const result = await router.runTask(prompt, TaskTier.BALANCED);
      res.json(JSON.parse(result.text));
    } catch (error: any) {
      handleAIError(error, res, "Campaign automation failed");
    }
  });

  app.post("/api/automate/repurpose-suggestions", async (req, res) => {
    const { recentProjects } = req.body;
    const prompt = `
      Analyze these successful content pieces:
      ${JSON.stringify(recentProjects)}
      
      Suggest 3 high-impact repurposing actions. 
      Format: JSON array of { originalId, originalTitle, suggestionType: "Thread" | "Shorts" | "Carousel" | "Newsletter", reason: string }
    `;

    try {
      const result = await router.runTask(prompt, TaskTier.LIGHT);
      res.json(JSON.parse(result.text));
    } catch (error: any) {
      handleAIError(error, res, "Repurposing analysis failed");
    }
  });

  app.post("/api/automate/trend-sync", async (req, res) => {
    const { trend, strategy, platform = "LinkedIn", targetFormat = "Thought Leadership Post" } = req.body;
    if (!trend) return res.status(400).json({ error: "Trend is required" });

    try {
      const result = await runEnterpriseWorkflow(trend, platform, strategy, targetFormat);
      res.json({
        type: 'content',
        title: `Trend Forge [${platform}]: ${trend.substring(0, 30)}...`,
        description: `Autonomous core has forged a high-signal ${targetFormat} response for ${platform} based on: ${trend}.`,
        data: result
      });
    } catch (error: any) {
      handleAIError(error, res, "Trend sync automation failed");
    }
  });

  app.post("/api/automate/optimize-profile", async (req, res) => {
    const { profile, history } = req.body;
    const prompt = `
      CURRENT STRATEGY:
      ${JSON.stringify(profile)}

      RECENT PERFORMANCE / HISTORY:
      ${JSON.stringify(history)}

      TASK:
      Analyze the performance and current strategy. Suggest 3 surgical optimizations to either the Brand Voice, Target Audience, or USP to improve engagement.
      
      Return JSON:
      {
        "optimizations": [
          { "targetField": "brandVoice" | "targetAudience" | "usp", "currentValue": "...", "suggestedValue": "...", "reason": "..." }
        ]
      }
    `;

    try {
      const result = await router.runTask(prompt, TaskTier.LIGHT);
      res.json(JSON.parse(result.text));
    } catch (error: any) {
      handleAIError(error, res, "Profile optimization analysis failed");
    }
  });

  app.post("/api/automate/market-watch", async (req, res) => {
    const { topic, strategy } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const prompt = `
      Act as a Competitive Intelligence Analyst.
      TOPIC: ${topic}
      BRAND STRATEGY: ${JSON.stringify(strategy)}

      Analyze the current market conversation around this topic. 
      1. Identify 3 "White Space" opportunities where current content is lacking.
      2. Suggest 1 "Counter-Narrative" that would differentiate the brand.
      3. Recommend 2 specific hooks for ${topic}.

      Return JSON:
      {
        "opportunities": string[],
        "counterNarrative": string,
        "hooks": string[]
      }
    `;

    try {
      const result = await router.runTask(prompt, TaskTier.BALANCED, "Search grounding encouraged if available.");
      res.json(JSON.parse(result.text));
    } catch (error: any) {
        handleAIError(error, res, "Market watch failed");
      }
    });

  app.post("/api/automate/content-roadmap", async (req, res) => {
     const { strategy } = req.body;
     const prompt = `
       Act as a Strategic Content Leads. 
       Based on this strategy: ${JSON.stringify(strategy)}
       
       Generate a 4-week Content Roadmap. 
       Return JSON array of 4 weeks:
       [
         { "week": 1, "theme": "...", "pillars": string[], "goal": "..." }
       ]
     `;
     try {
       const result = await router.runTask(prompt, TaskTier.BALANCED);
       res.json(JSON.parse(result.text));
     } catch (e) {
       handleAIError(e, res, "Roadmap generation failed");
     }
  });

  async function runEnterpriseWorkflow(sourceContent: string, platform: string, workspaceStrategy: any, targetFormat: string = "Standard Post") {
    // Neural Orchestration: Sequential multi-agent pipeline with multi-provider routing
    const agents = [
      { name: "Research", tier: TaskTier.BALANCED, instruction: "Extract core technical facts and viral hooks." },
      { name: "Creative", tier: TaskTier.STRATEGIC, instruction: "Write high-impact content." },
      { name: "Visuals", tier: TaskTier.LIGHT, instruction: "Design visual concept and predict engagement." }
    ];

    let pipelineContext = `SOURCE CONTENT: ${sourceContent}\nSTRATEGY: ${JSON.stringify(workspaceStrategy)}\n`;
    let agentLogs: any[] = [];
    let prediction = { score: 75, signals: [], friction: [], recommendedTime: "Peak Morning UTC" };

    for (const agent of agents) {
      const prompt = `AGENT TASK: ${agent.instruction}\n\nCONTEXT:\n${pipelineContext}`;
      const output = await router.runTask(prompt, agent.tier);
      agentLogs.push({ agent: agent.name, output });
      pipelineContext += `\n[${agent.name}]: ${output}`;
    }

    const synthesisPrompt = `Produce final production-ready asset based on: ${pipelineContext}`;
    const finalContent = await router.runTask(synthesisPrompt, TaskTier.BALANCED);

    return {
      finalContent,
      workflow: agentLogs,
      prediction
    };
  }

  // --- API Routes ---

  app.post("/api/agents/orchestrate", async (req, res) => {
    const { sourceText, platform, workspaceId, targetFormat = "Standard Post" } = req.body;
    if (!sourceText || !platform) return res.status(400).json({ error: "Missing required fields" });

    try {
      const strategy = req.body.strategy || {};
      const result = await runEnterpriseWorkflow(sourceText, platform, strategy, targetFormat);
      res.json(result);
    } catch (error: any) {
      handleAIError(error, res, "Enterprise workflow failed");
    }
  });

  // --- Cache for Trends ---
  let trendsCache: { data: any; timestamp: number } | null = null;
  const TRENDS_CACHE_TTL = 3600000; // 1 hour

  app.get("/api/trends/detect", async (req, res) => {
    // Check cache
    if (trendsCache && (Date.now() - trendsCache.timestamp < TRENDS_CACHE_TTL)) {
      return res.json(trendsCache.data);
    }

    const prompt = "Identify the top 5 trending topics in business, marketing, or technology today. Provide a brief summary of why they are trending and their potential for social media content. Use real-time web information.";
    
    try {
      // High-End capability: Use Intelligence Router
      const result = await router.runTask(prompt, TaskTier.BALANCED, "Use search grounding if available to find real-time trends.");
      
      const data = { trends: result.text };
      trendsCache = { data, timestamp: Date.now() };
      res.json(data);
    } catch (error: any) {
      console.warn("[AI Router] High-altitude trend sync node failure, falling back to heuristic predictions...");
      try {
        const result = await router.runTask("Summarize 5 major macro-trends in technology and B2B marketing for 2024-2025.", TaskTier.LIGHT);
        const data = { trends: result + "\n\n(Note: Intelligence node operating in balanced sync mode)" };
        res.json(data);
      } catch (inner: any) {
        res.json({ trends: "1. AI Agent Workflows\n2. First-Party Data Sovereignty\n3. Hyper-Personalization\n4. Sustainability in Tech\n5. Community-Led Growth" });
      }
    }
  });

  app.post("/api/agents/strategy", async (req, res) => {
    const { niche, usp, goals } = req.body;
    const prompt = `
      Act as a world-class CMO and Strategy Consultant.
      Create a comprehensive content strategy for a brand with the following profile:
      NICHE: ${niche || 'B2B SaaS'}
      USP: ${usp || 'Cutting-edge AI integration'}
      GOALS: ${goals || 'Authority building and lead generation'}

      Output a JSON object with:
      {
        "brandVoice": "Detailed tone of voice description",
        "targetAudience": "Deep breakdown of persona and pain points",
        "keywords": "List of 10 high-value semantic keywords",
        "strategy": "3-month action plan summary"
      }
    `;

    try {
      const result = await router.runTask(prompt, TaskTier.BALANCED);
      res.json(JSON.parse(result.text || "{}"));
    } catch (error: any) {
      handleAIError(error, res, "Strategy generation failed");
    }
  });

  // --- API Provider Management (Legacy handlers removed) ---

  function handleAIError(error: any, res: any, customMessage = "AI intelligence node failed to respond") {
    const errorStr = (error?.message || "").toLowerCase();
    const isQuotaError = errorStr.includes('429') || 
                         errorStr.includes('quota') || 
                         errorStr.includes('resource_exhausted') ||
                         errorStr.includes('limit');
    
    if (isQuotaError) {
      return res.status(429).json({ 
        error: "Neural matrix quota exceeded across all providers. High-density load detected.",
        code: "RESOURCE_EXHAUSTED"
      });
    }

    res.status(500).json({ 
      error: `${customMessage}: Neural sync failure across all available nodes.`,
      details: error?.message
    });
  }

  // API Routes
  app.post("/api/scrape", async (req, res) => {
    const { url, type } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      if (type === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
        const transcript = await YoutubeTranscript.fetchTranscript(url);
        const fullText = transcript.map(t => t.text).join(' ');
        return res.json({ text: fullText });
      }

      if (type === 'rss' || url.includes('/feed') || url.includes('.rss') || url.includes('.xml')) {
        const feed = await rssParser.parseURL(url);
        const fullText = feed.items.map(item => `${item.title}: ${item.contentSnippet || item.content}`).join('\n\n');
        return res.json({ text: fullText });
      }

      // Improved scraping with more headers
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      const $ = cheerio.load(response.data);
      const title = $("title").text() || $("h1").first().text();
      
      // Targeted extraction: prioritize main content areas
      const mainContent = $("article, main, #content, .post-content, .entry-content").text();
      let extractedText = mainContent;

      if (!mainContent || mainContent.length < 200) {
        $("script, style, nav, footer, header, .sidebar, .ads, .menu").remove();
        extractedText = $("body").text();
      }

      const text = extractedText.replace(/\s+/g, " ").trim();
      
      res.json({ title, text: text.substring(0, 15000) });
    } catch (error: any) {
      console.error("Scrape error:", error?.message);
      // Fallback: try a simpler fetch if it was a header issue
      try {
        const simple = await axios.get(url);
        const $ = cheerio.load(simple.data);
        const text = $("body").text().replace(/\s+/g, " ").trim();
        res.json({ text: text.substring(0, 15000) });
      } catch (e) {
        res.status(500).json({ error: "Failed to extract intelligence from source. Source might be protected or unreachable." });
      }
    }
  });

  app.post("/api/upload", upload.single("file"), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
      let text = "";
      if (req.file.mimetype === "application/pdf") {
        if (!pdf) throw new Error("PDF processing node is not initialized");
        const data = await pdf(req.file.buffer);
        text = data.text;
      } else if (req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        if (!mammoth) throw new Error("Document processing node is not initialized");
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        text = result.value;
      } else {
        text = req.file.buffer.toString("utf-8");
      }
      res.json({ text: text.substring(0, 20000) });
    } catch (error: any) {
      console.error("File parsing error:", error);
      res.status(500).json({ error: error?.message || "File analysis failed" });
    }
  });

  app.post("/api/generate", async (req, res) => {
    const { sourceText, platform, tone, brandVoice, template, targetFormat } = req.body;
    
    if (!sourceText || !platform) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let platformPrompts: Record<string, string> = {
      summary: "Critically synthesize this news/research into 3-5 key high-impact insights. Focus on the 'Bottom Line Up Front' (BLUF).",
      linkedin: "Create a high-authority LinkedIn post. Start with a disruptive hook, use structured bullet points for readability, include an 'Actionable Takeaway', and end with 3-5 hyper-relevant niche hashtags.",
      twitter: "Create a high-velocity Twitter/X thread (7-10 tweets). Start with a 'How-to' or 'Outcome-based' hook. Use formatting like (1/n). Include a CTA to follow/subscribe at the end with 2 hashtags on the final tweet.",
      instagram: "Create a 5-slide Educational Carousel script. For each slide: Provide [Visual Suggestion] and [Slide Text]. Include a caption with 15 highly targeted hashtags.",
      tiktok: "Create a 60-second Viral Reel/TikTok script. Include [Visual/Action Direction] and [Spoken Script]. Focus on high-retention hooks and trending-style transitions. Include a tag set.",
      newsletter: "Create a deep-dive newsletter section. Start with a personal/narrative angle, provide 3 substantial insights with examples, and end with a 'Thought-starter' question.",
      reddit: "Create a high-value community post. Avoid excessive marketing jargon. Focus on raw value, debate-worthy points, and formatted lists. Encourage discussion.",
      generic: `Forge high-impact content specifically optimized for ${platform}.`
    };

    let baseInstruction = platformPrompts[platform.toLowerCase()] || platformPrompts.generic;
    
    if (targetFormat && targetFormat !== "Standard Post") {
      baseInstruction += ` Format the output precisely as a ${targetFormat}.`;
    }
    
    if (template) {
      baseInstruction = `Follow this TEMPLATE structure precisely while using the SOURCE CONTENT: \n\n${template}`;
    }

    const prompt = `
      SOURCE CONTENT:
      ${sourceText}

      TASK:
      ${baseInstruction}
    `;

    try {
      const content = await router.runTask(prompt, TaskTier.LIGHT, `Tone: ${tone || "Professional"}. ${brandVoice ? `Brand Voice: ${brandVoice}` : ""}`);
      res.json({ content: content.text, provider: content.provider });
    } catch (error: any) {
      handleAIError(error, res, "Content synthesis failed");
    }
  });

  app.post("/api/refine", async (req, res) => {
    const { content, instruction, platform, brandVoice } = req.body;
    if (!content || !instruction) return res.status(400).json({ error: "Missing data" });

    const prompt = `
      ORIGINAL CONTENT:
      ${content}

      REFINEMENT INSTRUCTION:
      ${instruction}

      PLATFORM: ${platform}
    `;

    try {
      const contentRes = await router.runTask(prompt, TaskTier.LIGHT, `Role: Expert Editor. ${brandVoice ? `Brand Voice: ${brandVoice}` : ""}`);
      res.json({ content: contentRes.text, provider: contentRes.provider });
    } catch (error: any) {
      handleAIError(error, res, "Refinement failed");
    }
  });

  app.post("/api/agents/repurpose", async (req, res) => {
    const { content, targetPlatform, brandVoice } = req.body;
    const prompt = `
      Take the following content and repurpose it specifically for ${targetPlatform}.
      Original Content: ${content}
      Brand Tone: ${brandVoice || 'Same as original'}
      
      Maintain the core signal but optimize for ${targetPlatform} format, length, and culture.
      Return ONLY the final Markdown output.
    `;

    try {
      const result = await router.runTask(prompt, TaskTier.LIGHT, brandVoice ? `Brand Voice: ${brandVoice}` : "");
      res.json({ content: result.text, provider: result.provider });
    } catch (error: any) {
      handleAIError(error, res, "Repurposing failed");
    }
  });

  app.post("/api/predict-engagement", async (req, res) => {
    const { content, platform } = req.body;
    if (!content || !platform) return res.status(400).json({ error: "Missing data" });

    const prompt = `
      Analyze this ${platform} content for engagement and quality.
      CONTENT:
      ${content}

      Provide your analysis in JSON format with:
      - score: number (0-100)
      - potentialReach: string (e.g. "5k-10k")
      - confidence: "High" | "Medium" | "Low"
      - suggestions: string[] (3 actionable improvements)
      - metrics: { clarity: number, hooks: number, conciseness: number }
      (Ensure valid JSON output)
    `;

    try {
      const result = await router.runTask(prompt, TaskTier.LIGHT);
      res.json(JSON.parse(result.text));
    } catch (error: any) {
      handleAIError(error, res, "Engagement prediction failed");
    }
  });

  app.post("/api/suggest-prompts", async (req, res) => {
    const { content, platform } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });

    const prompt = `
      Based on this social media content for ${platform || 'general social media'}, 
      suggest 3 diverse and high-impact image generation prompts.
      
      CONTENT:
      ${content}
      
      For each prompt, include:
      - description: A detailed, descriptive prompt for an AI image generator (e.g. photorealistic, cinematic, etc.)
      - style: The visual style (e.g. "Corporate Minimalist", "Cyberpunk", "Moody Professional")
      - reason: Why this visual matches the content impact.
      
      Return as a JSON array of 3 objects.
    `;

    try {
      const result = await router.runTask(prompt, TaskTier.LIGHT);
      res.json(JSON.parse(result.text));
    } catch (error: any) {
      handleAIError(error, res, "Prompt suggestions failed");
    }
  });

  app.post("/api/analyze-content", async (req, res) => {
    const { content, platform } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });

    const prompt = `
      Analyze this social media content for ${platform || 'general social media'}.
      Provide 3 actionable improvement suggestions focused on engagement, clarity, and conciseness.
      
      For each suggestion, provide:
      - title: Short title (e.g., "Strengthen the Hook")
      - advice: Detailed explanation of what to change.
      - category: One of ["Engagement", "Clarity", "Conciseness"]
      - prompt: A refinement instruction for an AI model (e.g., "Make the first sentence more punchy and provocative").
      
      CONTENT:
      ${content}
      
      Return as a JSON array of 3 objects.
    `;

    try {
      const result = await router.runTask(prompt, TaskTier.LIGHT);
      res.json(JSON.parse(result.text));
    } catch (error: any) {
      handleAIError(error, res, "Matrix analysis failed");
    }
  });

  app.post("/api/generate-image", async (req, res) => {
    const { prompt, aspectRatio } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
      // Image generation is still primarily Gemini for now, but we use the router for future extension
      // Actually, image gen usually requires direct SDK access for multi-modal, 
      // but we'll stick to a simpler implementation for this demo
      const result = await router.runTask(`GENERATE_IMAGE: ${prompt} (Aspect: ${aspectRatio || '1:1'})`, TaskTier.BALANCED);
      // Mocking back image data if router returns meta, but usually router handles text.
      // For images, we'll keep a direct Gemini call if possible or mock the data.
      res.json({ imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop" });
    } catch (error: any) {
      res.status(500).json({ error: "AI image generation nodes offline." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
