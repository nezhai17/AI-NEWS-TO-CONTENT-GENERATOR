import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import NodeCache from "node-cache";

// --- Types & Configuration ---

export enum TaskTier {
  LIGHT = "LIGHT",      // Cheap, fast (Flash)
  BALANCED = "BALANCED", // Standard quality (Pro)
  STRATEGIC = "STRATEGIC" // High reasoning (Featherless OSS 120B)
}

export type ProviderType = 'google' | 'openai' | 'featherless' | 'groq';

interface ModelConfig {
  id: string;
  provider: ProviderType;
  tier: TaskTier;
  costEstimate: number; // 0-10
  latencyEstimate: number; // ms
}

const MODEL_REGISTRY: ModelConfig[] = [
  // LIGHT TIER (High speed, efficiency)
  { id: 'llama-3.1-8b-instant', provider: 'groq', tier: TaskTier.LIGHT, costEstimate: 0.5, latencyEstimate: 150 },
  { id: 'gemini-1.5-flash-latest', provider: 'google', tier: TaskTier.LIGHT, costEstimate: 1, latencyEstimate: 400 },
  { id: 'meta-llama/Llama-3.1-8B-Instruct', provider: 'openai', tier: TaskTier.LIGHT, costEstimate: 1, latencyEstimate: 300 },
  { id: 'gpt-4o-mini', provider: 'openai', tier: TaskTier.LIGHT, costEstimate: 1, latencyEstimate: 300 },
  
  // BALANCED TIER (Reliable intelligence)
  { id: 'llama-3.3-70b-versatile', provider: 'groq', tier: TaskTier.BALANCED, costEstimate: 2, latencyEstimate: 200 },
  { id: 'gemini-1.5-pro-latest', provider: 'google', tier: TaskTier.BALANCED, costEstimate: 5, latencyEstimate: 800 },
  { id: 'meta-llama/Llama-3.3-70B-Instruct', provider: 'openai', tier: TaskTier.BALANCED, costEstimate: 2, latencyEstimate: 400 },
  { id: 'gpt-4o-mini', provider: 'openai', tier: TaskTier.BALANCED, costEstimate: 1.5, latencyEstimate: 400 },
  { id: 'gemini-1.5-flash-latest', provider: 'google', tier: TaskTier.BALANCED, costEstimate: 1, latencyEstimate: 500 },

  // STRATEGIC TIER (Complex reasoning)
  { id: 'gpt-4o', provider: 'openai', tier: TaskTier.STRATEGIC, costEstimate: 8, latencyEstimate: 1500 },
  { id: 'deepseek-ai/DeepSeek-V3', provider: 'featherless', tier: TaskTier.STRATEGIC, costEstimate: 9, latencyEstimate: 2200 },
  { id: 'meta-llama/Llama-3.3-70B-Instruct', provider: 'featherless', tier: TaskTier.STRATEGIC, costEstimate: 5, latencyEstimate: 1200 },
  { id: 'llama-3.3-70b-versatile', provider: 'groq', tier: TaskTier.STRATEGIC, costEstimate: 2, latencyEstimate: 300 }
];

// --- Initialization ---

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Multi-provider telemetry
export const telemetry = {
  google: 0,
  openai: 0,
  featherless: 0,
  groq: 0,
  fallbacks: 0
};

export interface AIResponse {
  text: string;
  provider: ProviderType;
  model: string;
  cached: boolean;
}

export class IntelligenceRouter {
  private gemini: GoogleGenAI | null = null;
  private openai: OpenAI | null = null;
  private featherless: OpenAI | null = null;
  
  constructor() {
    // Lazy initialization happens in runTask
  }

  private initProviders() {
    if (process.env.GEMINI_API_KEY && !this.gemini) {
      this.gemini = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("[AI ROUTER] Gemini node active.");
    }
    
    // Core OpenAI Configuration
    const openAIKey = process.env.OPENAI_API_KEY;
    if (openAIKey && !this.openai) {
      const isProxy = openAIKey.startsWith('rc_') || openAIKey.startsWith('fl-');
      this.openai = new OpenAI({ 
        apiKey: openAIKey,
        ...(isProxy ? { baseURL: "https://api.featherless.ai/v1" } : {})
      });
      if (isProxy) console.log("[AI ROUTER] OpenAI node redirected to Featherless Proxy.");
      else console.log("[AI ROUTER] OpenAI node active.");
    }

    // Tertiary Featherless Node
    const featherlessKey = process.env.FEATHERLESS_API_KEY;
    if (featherlessKey && !this.featherless) {
      this.featherless = new OpenAI({ 
        apiKey: featherlessKey,
        baseURL: process.env.FEATHERLESS_BASE_URL || "https://api.featherless.ai/v1"
      });
      console.log("[AI ROUTER] Featherless node active.");
    }
  }

  // --- Core Routing Logic ---

  async runTask(prompt: string, tier: TaskTier = TaskTier.LIGHT, systemInstruction?: string): Promise<AIResponse> {
    this.initProviders();
    // 1. Check Cache
    const cacheKey = `${tier}:${Buffer.from(prompt + (systemInstruction || "")).toString('base64').substring(0, 32)}`;
    const cached = cache.get(cacheKey) as AIResponse;
    if (cached) {
      console.log(`[AI ROUTER] Intelligence cache HIT: ${cacheKey}`);
      return { ...cached, cached: true };
    }

    // 2. Select Fallback Chain
    const chain = this.getFallbackChain(tier);
    let lastError: any;

    for (const model of chain) {
      let retries = 1; // Each model/provider gets 1 retry before failing over
      
      while (retries >= 0) {
        try {
          console.log(`[AI ROUTER] Routing to ${model.provider}:${model.id} (Attempt ${2 - retries})`);
          const text = await this.executeOnProvider(model, prompt, systemInstruction);
          
          // Log Success
          if (model.provider === 'google') telemetry.google++;
          if (model.provider === 'openai') telemetry.openai++;
          if (model.provider === 'featherless') telemetry.featherless++;
          if (model.provider === 'groq') telemetry.groq++;

          const response: AIResponse = {
            text,
            provider: model.provider,
            model: model.id,
            cached: false
          };
          cache.set(cacheKey, response);
          return response;
        } catch (error: any) {
          lastError = error;
          const msg = (error?.message || "Unknown error").toLowerCase();
          
          console.error(`[AI ROUTER] Node ${model.id} failed:`, error?.message || error);

          // Retry logic (Quota, Rate limit, Timeout, etc.)
          const isRetryable = msg.includes('timeout') || msg.includes('downtime');
          const isQuotaError = msg.includes('429') || msg.includes('quota') || msg.includes('limit');
          
          if (isRetryable && retries > 0) {
            await new Promise(r => setTimeout(r, 1000));
            retries--;
            continue;
          }

          if (isQuotaError) {
            console.warn(`[AI ROUTER] Quota exceeded for ${model.id}. Pivoting immediately.`);
          }

          // Escalation logic
          console.log(`[AI ROUTER] Transferring neural load from ${model.id} following node failure.`);
          telemetry.fallbacks++;
          break; 
        }
      }
    }

    // 3. Final Fallback: Return successful but neutral content if all else fails
    console.warn(`[AI ROUTER] ALL NODES FAILED. Returning disaster-recovery content for tier ${tier}.`);
    
    // Check if the prompt suggests a JSON response is expected
    const isJsonRequested = prompt.toLowerCase().includes("json") || (systemInstruction || "").toLowerCase().includes("json");
    
    if (isJsonRequested) {
      return {
        text: JSON.stringify({
          status: "fallback",
          message: "SignalForge AI is currently operating in high-density fallback mode. Advanced neural synthesis is temporarily unavailable.",
          content: "Please retry your complex query in 5 minutes.",
          suggestions: ["Retry with a simpler prompt", "Wait for neural capacity to clear"]
        }),
        provider: 'groq',
        model: 'disaster-recovery',
        cached: false
      };
    }

    return {
      text: "SignalForge AI is currently operating in low-power fallback mode. The response was generated using local heuristic nodes. Please retry your complex query in 5 minutes.",
      provider: 'groq',
      model: 'disaster-recovery',
      cached: false
    };
  }

  private getFallbackChain(tier: TaskTier): ModelConfig[] {
    const openAIKey = process.env.OPENAI_API_KEY;
    const isProxy = openAIKey?.startsWith('rc_') || openAIKey?.startsWith('fl-');

    const candidates = MODEL_REGISTRY.filter(m => {
       if (m.provider === 'google' && !this.gemini) return false;
       if (m.provider === 'openai' && !this.openai) return false;
       if (m.provider === 'featherless' && !this.featherless) return false;
       if (m.provider === 'groq' && !process.env.GROQ_API_KEY) return false;
       
       // Handle proxy constraints: 
       // If it is a proxy, filter out models that are known NOT to be supported (gpt-*) 
       // UNLESS we are specifically testing OS models on the proxy node.
       if (m.provider === 'openai' && isProxy) {
          if (m.id.startsWith('gpt')) return false;
       }
       
       return true;
    });

    // Tier-based priority:
    // Simple -> Cheapest/Fastest
    // Complex -> Strongest (OpenAI/Featherless)
    
    if (tier === TaskTier.STRATEGIC) {
      return candidates.sort((a, b) => {
        // Strongest nodes first for complex tasks
        const strengthOrder = { 'openai': 0, 'featherless': 1, 'google': 2, 'groq': 3 };
        if (a.tier === TaskTier.STRATEGIC && b.tier !== TaskTier.STRATEGIC) return -1;
        if (b.tier === TaskTier.STRATEGIC && a.tier !== TaskTier.STRATEGIC) return 1;
        return (strengthOrder[a.provider] || 9) - (strengthOrder[b.provider] || 9);
      });
    }

    // Default (LIGHT/BALANCED): Prioritize reliable providers, especially if OpenAI is proxied
    return candidates.sort((a, b) => {
      const providerOrder = isProxy 
        ? { 'groq': 0, 'google': 1, 'openai': 2, 'featherless': 3 }
        : { 'openai': 0, 'groq': 1, 'google': 2, 'featherless': 3 };
      
      // If same tier, follow provider order
      if (a.tier === tier && b.tier === tier) {
        return providerOrder[a.provider] - providerOrder[b.provider];
      }
      
      // Prefer requested tier
      if (a.tier === tier) return -1;
      if (b.tier === tier) return 1;

      return providerOrder[a.provider] - providerOrder[b.provider];
    });
  }

  private async executeOnProvider(model: ModelConfig, prompt: string, system?: string): Promise<string> {
    switch (model.provider) {
      case 'google':
        if (!this.gemini) throw new Error("Gemini cluster detached");
        try {
          const res = await this.gemini.models.generateContent({
            model: model.id,
            contents: prompt,
            config: system ? { systemInstruction: system } : undefined
          });
          
          const text = res.text;
          
          if (!text) {
             throw new Error("Empty response from neural node");
          }
          return text;
        } catch (gErr: any) {
          console.error(`[AI ROUTER] Gemini internal error on ${model.id}:`, gErr);
          throw gErr;
        }

      case 'openai':
      case 'featherless':
        const client = model.provider === 'openai' ? this.openai : this.featherless;
        if (!client) throw new Error(`${model.provider} cluster detached`);
        const oRes = await client.chat.completions.create({
          model: model.id,
          messages: [
            ...(system ? [{ role: 'system', content: system } as const] : []),
            { role: 'user', content: prompt }
          ]
        });
        return oRes.choices[0]?.message?.content || "";

      case 'groq':
        if (!process.env.GROQ_API_KEY) throw new Error("Groq API key missing");
        const gRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: model.id,
            messages: [
              ...(system ? [{ role: 'system', content: system }] : []),
              { role: 'user', content: prompt }
            ]
          })
        });
        
        if (!gRes.ok) {
          const errData = await gRes.json().catch(() => ({}));
          throw new Error(`Groq API Error: ${gRes.status} ${errData.error?.message || gRes.statusText}`);
        }

        const gData = await gRes.json();
        return gData.choices?.[0]?.message?.content || "";

      default:
        throw new Error(`Node architecture for ${model.id} not defined.`);
    }
  }
}
