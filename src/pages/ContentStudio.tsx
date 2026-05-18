import { useState, useEffect, useRef } from 'react';
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Link2, 
  Search, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Music2, 
  Sparkles, 
  Copy, 
  Download, 
  History, 
  Rocket, 
  Zap as LucideZap, 
  Shield,
  Loader2,
  RefreshCw,
  Layout as LayoutIcon,
  Bot,
  FileUp,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Target,
  Youtube,
  Rss,
  Globe,
  Clock,
  TrendingUp,
  Activity,
  Github,
  Mail,
  MessageCircle,
  FileJson,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import TemplateManager from '@/components/studio/TemplateManager';
import VisualGenerator from '@/components/studio/VisualGenerator';
import SocialPreview from '@/components/studio/SocialPreview';
import ContentOptimizer from '@/components/studio/ContentOptimizer';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

import { sendNotification } from '@/lib/notifications';

type Platform = 'summary' | 'linkedin' | 'twitter' | 'instagram' | 'tiktok' | 'newsletter' | 'reddit' | 'github' | 'threads' | string;
type Tab = 'content' | 'optimize' | 'visuals' | 'history';

const FORMAT_PRESETS = [
  "Standard Post",
  "Thought Leadership Post",
  "Viral Thread",
  "Educational Carousel",
  "Video Script",
  "Short-form Script",
  "Long-form Article",
  "Newsletter Section",
  "Community QA",
  "Project Documentation",
  "Waitlist Announcement"
];

interface Prediction {
  score: number;
  potentialReach: string;
  confidence: string;
  suggestions: string[];
  metrics: { clarity: number, hooks: number, conciseness: number };
  bestTime?: string;
}

import { useStore } from '@/store/useStore';
import { aiService } from '@/services/aiService';

export default function ContentStudio() {
  const { user } = useAuth();
  const { currentWorkspace } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceType, setSourceType] = useState<'web' | 'youtube' | 'rss'>('web');
  const [sourceText, setSourceText] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState<string | null>(null);
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});

  const handleRepurpose = async (target: Platform) => {
    if (!generatedContent[activePlatform]) return;
    setIsRepurposing(true);
    try {
      const res = await aiService.repurpose(generatedContent[activePlatform], target, brandVoice);
      setGeneratedContent(prev => ({ ...prev, [target]: res.content }));
      setActivePlatform(target);
      toast.success(`Repurposed from ${activePlatform} to ${target}`);
      
      // Predict for new content
      const predData = await aiService.predictEngagement(res.content, target);
      setPredictions(prev => ({ ...prev, [target]: predData }));
    } catch (e) {
      toast.error('Repurposing failed');
    } finally {
      setIsRepurposing(false);
    }
  };
  const [activePlatform, setActivePlatform] = useState<Platform>('summary');
  const [targetFormat, setTargetFormat] = useState('Standard Post');
  const [customPlatform, setCustomPlatform] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('content');
  const [viewMode, setViewMode] = useState<'raw' | 'preview'>('raw');
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [brandVoice, setBrandVoice] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [useMultiAgent, setUseMultiAgent] = useState(false);
  const [workflowResults, setWorkflowResults] = useState<any[]>([]);
  const [isAutopilot, setIsAutopilot] = useState(false);
  const [proposedAsset, setProposedAsset] = useState<{
    content: string;
    prediction: Prediction;
    platform: Platform;
  } | null>(null);
  const { trends, setTrends, isSyncingTrends, setIsSyncingTrends } = useStore();

  useEffect(() => {
    if (trends) return;
    const fetchTrends = async () => {
      setIsSyncingTrends(true);
      try {
        const res = await aiService.getTrends();
        setTrends(res.trends);
      } catch (err: any) {
        console.error("Trend sync failed:", err.message || err);
      } finally {
        setIsSyncingTrends(false);
      }
    };
    fetchTrends();
  }, []);

  const handleTrendClick = (trendText: string) => {
    setSourceText(trendText);
    setIsAutopilot(true);
    toast.success("Autopilot engaged on Trend signal");
    // Explicitly trigger generate
    setTimeout(() => handleGenerate(trendText), 500);
  };

  const handleApprove = async () => {
    if (!proposedAsset || !user || !currentWorkspace) return;
    
    const { content, prediction, platform } = proposedAsset;
    setGeneratedContent(prev => ({ ...prev, [platform]: content }));
    setPredictions(prev => ({ ...prev, [platform]: prediction }));
    setActivePlatform(platform);
    
    // Save to workspace projects
    await addDoc(collection(db, `workspaces/${currentWorkspace.id}/projects`), {
      userId: user.uid,
      workspaceId: currentWorkspace.id,
      title: sourceUrl || `Approved ${new Date().toLocaleTimeString()}`,
      platform: platform,
      content: content,
      prediction: prediction,
      workflow: useMultiAgent ? workflowResults : [],
      status: 'published',
      createdAt: serverTimestamp(),
      source: sourceUrl || 'Autopilot Engine'
    });

    setProposedAsset(null);
    toast.success('Asset Approved & Synchronized');
  };

  useEffect(() => {
    if (!user || !currentWorkspace) return;
    const q = query(
      collection(db, `workspaces/${currentWorkspace.id}/projects`),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [user, currentWorkspace]);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setBrandVoice(snap.data().brandVoice || '');
        }
      } catch (e: any) {
        if (e.message?.includes('offline') || e.code === 'unavailable') {
          console.warn('Intelligence core deferred (offline).');
        } else {
          console.error('Profile fetch failed:', e);
        }
      }
    }
    loadProfile();
  }, [user]);

  const handleScrape = async () => {
    if (!sourceUrl) return;
    setIsScraping(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourceUrl, type: sourceType })
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setSourceText(data.text);
        toast.success('Intelligence extracted successfully');
        if (isAutopilot) {
           // Small delay to let user see the extraction worked
           setTimeout(() => handleGenerate(data.text), 1000);
        }
      } else {
        toast.error(data.error || 'Scraping protocol failed');
      }
    } catch (e: any) {
      toast.error('Scraping protocol failed: Connection error');
    } finally {
      setIsScraping(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setSourceText(data.text);
        toast.success(`Document '${file.name}' ingested`);
        if (isAutopilot) {
           setTimeout(() => handleGenerate(data.text), 1000);
        }
      } else {
        toast.error(data.error || 'File ingestion failed');
      }
    } catch (e) {
      toast.error('File ingestion failed: Connection error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleQueueAutopilot = async () => {
    if (!sourceText || !currentWorkspace || !user) return;
    setIsGenerating(true);
    try {
      // Get strategy
      const wsRef = doc(db, 'workspaces', currentWorkspace.id);
      const wsSnap = await getDoc(wsRef);
      const strategy = wsSnap.exists() ? wsSnap.data().strategy : {};

      const platformToUse = activePlatform === 'custom' ? customPlatform : activePlatform;
      const res = await aiService.syncTrend(sourceText, strategy, platformToUse, targetFormat);
      
      await addDoc(collection(db, `workspaces/${currentWorkspace.id}/approvals`), {
        ...res,
        status: 'pending',
        platform: platformToUse,
        targetFormat,
        createdAt: serverTimestamp(),
        userId: user.uid
      });
      
      toast.success('Asset queued for background autopilot');
      setSourceText('');
      setSourceUrl('');
    } catch (e: any) {
      toast.error('Autopilot queuing failed: ' + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async (overrideText?: string) => {
    const textToUse = overrideText || sourceText;
    if (!textToUse || !user || !currentWorkspace) return;
    setIsGenerating(true);
    setWorkflowResults([]);
    
    const platformToUse = activePlatform === 'custom' ? customPlatform : activePlatform;

    try {
      let finalContent = "";
      let predictionData: Prediction | null = null;
      
      if (useMultiAgent || isAutopilot) { 
        const wsRef = doc(db, 'workspaces', currentWorkspace.id);
        const wsSnap = await getDoc(wsRef);
        const strategy = wsSnap.exists() ? wsSnap.data().strategy : {};

        const result = await aiService.orchestrate(textToUse, platformToUse, strategy, targetFormat);
        finalContent = result.finalContent;
        setWorkflowResults(result.workflow);
        predictionData = (result as any).prediction as Prediction;
      } else {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sourceText: textToUse, 
            platform: platformToUse,
            targetFormat,
            brandVoice,
            template: activeTemplate?.structure
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Forge initialization failed');
        finalContent = data.content;
      }

      if (finalContent) {
        if (!predictionData) {
          const predRes = await fetch('/api/predict-engagement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: finalContent, platform: activePlatform })
          });
          predictionData = await predRes.json();
        }

        if (isAutopilot) {
          setProposedAsset({
            content: finalContent,
            prediction: predictionData!,
            platform: activePlatform
          });
        } else {
          setGeneratedContent(prev => ({ ...prev, [activePlatform]: finalContent }));
          setPredictions(prev => ({ ...prev, [activePlatform]: predictionData! }));
          
          sendNotification(user.uid, {
            title: useMultiAgent ? 'Multi-Agent Synthesis Complete' : 'Synthesis Complete',
            message: `Asset forged for ${activePlatform.toUpperCase()} with high engagement prediction.`,
            type: 'success'
          });

          // Save to workspace projects
          await addDoc(collection(db, `workspaces/${currentWorkspace.id}/projects`), {
            userId: user.uid,
            workspaceId: currentWorkspace.id,
            title: sourceUrl || `Draft ${new Date().toLocaleTimeString()}`,
            platform: activePlatform,
            content: finalContent,
            prediction: predictionData,
            workflow: useMultiAgent ? workflowResults : [],
            status: 'completed',
            createdAt: serverTimestamp(),
            source: sourceUrl || 'Manual Input'
          });
        }

        toast.success(isAutopilot ? "Proposal Synthesized" : `Content forged for ${activePlatform}`);
      }
    } catch (e: any) {
      toast.error(e.message || 'Forge initialization failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (instruction: string) => {
    if (!user || !generatedContent[activePlatform]) return;
    setIsRefining(instruction);
    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: generatedContent[activePlatform],
          instruction,
          platform: activePlatform,
          brandVoice
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Refinement failed');
      }

      if (data.content) {
        setGeneratedContent(prev => ({ ...prev, [activePlatform]: data.content }));
        
        sendNotification(user.uid, {
          title: 'Refinement Layer Applied',
          message: `Digital asset optimized for: "${instruction}"`,
          type: 'info'
        });
        toast.success('Optimization pattern applied');
        
        // Re-analyze
        const predRes = await fetch('/api/predict-engagement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: data.content, platform: activePlatform })
        });
        const predData = await predRes.json();
        setPredictions(prev => ({ ...prev, [activePlatform]: predData }));
      }
    } catch (e: any) {
      toast.error(e.message || 'Refinement failed');
    } finally {
      setIsRefining(null);
    }
  };

  const platforms: { id: Platform; label: string; icon: any }[] = [
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { id: 'twitter', label: 'X / Thread', icon: Twitter },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'tiktok', label: 'TikTok', icon: Music2 },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'reddit', label: 'Reddit', icon: MessageCircle },
    { id: 'github', label: 'GitHub', icon: Github },
    { id: 'threads', label: 'Threads', icon: Activity },
    { id: 'custom', label: 'Custom', icon: MoreHorizontal },
  ];

  useEffect(() => {
    if (!activePlatform && platforms.length > 0) {
      setActivePlatform('summary');
    }
  }, []);

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Top Banner Control */}
      <div className="h-20 border-b border-border px-10 flex items-center justify-between bg-card/50 backdrop-blur-xl flex-shrink-0 z-10">
        <div className="flex items-center gap-10">
           <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic font-display">Forge Reactor v4.0</span>
           </div>
           
           <div className="flex items-center gap-1 bg-muted/50 p-1.5 rounded-2xl border border-border/50">
              {[
                { id: 'content', label: 'Synthesis', icon: MessageSquare },
                { id: 'optimize', label: 'Optimize', icon: Target },
                { id: 'visuals', label: 'Visuals', icon: ImageIcon },
                { id: 'history', label: 'Matrix', icon: History },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as Tab)}
                  className={cn(
                    "flex items-center gap-2.5 px-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                    activeTab === t.id 
                      ? "bg-primary text-primary-foreground shadow-xl shadow-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <t.icon className={cn("w-4 h-4", activeTab === t.id ? "scale-110" : "")} />
                  {t.label}
                </button>
              ))}
           </div>
        </div>

        <div className="flex items-center gap-4">
           {activeTemplate && (
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-2.5 px-4 h-11 bg-muted rounded-xl border border-border"
             >
                <LayoutIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest">{activeTemplate.name}</span>
             </motion.div>
           )}
           <Button size="lg" className="h-11 bg-primary text-primary-foreground font-display font-black uppercase tracking-widest px-8 rounded-xl shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-3">
             <Rocket className="w-4 h-4" />
             Deploy Asset
           </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Source & Template Panel (Left) */}
        <aside className="w-[480px] border-r border-border flex flex-col bg-card/30 backdrop-blur-sm overflow-hidden z-20">
           <div className="p-10 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
              {/* Context Selector */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Intelligence Input</label>
                    <div className="flex gap-2">
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         onChange={handleFileUpload} 
                         accept=".pdf,.txt,.docx"
                         className="hidden" 
                       />
                       <Button 
                         variant="outline" 
                         size="sm" 
                         onClick={() => fileInputRef.current?.click()}
                         className="h-9 rounded-xl font-black text-[9px] uppercase tracking-widest gap-2 bg-card border-border hover:bg-muted transition-all"
                       >
                         {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
                         Ingest Doc
                       </Button>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-1 bg-muted/50 p-1.5 rounded-2xl border border-border/50">
                    {[
                       { id: 'web', icon: Globe, label: 'Web' },
                       { id: 'youtube', icon: Youtube, label: 'YouTube' },
                       { id: 'rss', icon: Rss, label: 'RSS' },
                    ].map((st) => (
                       <button
                         key={st.id}
                         onClick={() => setSourceType(st.id as any)}
                         className={cn(
                           "flex items-center justify-center gap-2.5 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                           sourceType === st.id 
                            ? "bg-primary text-primary-foreground shadow-lg" 
                            : "text-muted-foreground hover:bg-muted"
                         )}
                       >
                          <st.icon className="w-4 h-4" />
                          <span>{st.label}</span>
                       </button>
                    ))}
                 </div>

                 <div className="flex gap-3">
                    <div className="relative flex-1 group">
                      <Link2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                      <Input 
                        placeholder={
                          sourceType === 'youtube' ? "Paste YouTube Video URL..." :
                          sourceType === 'rss' ? "Paste RSS Feed URL..." :
                          "Paste intelligence source URL..."
                        }
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        className="h-16 pl-14 rounded-2xl bg-card border-border shadow-sm text-sm font-semibold focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
                      />
                    </div>
                    <Button 
                      onClick={handleScrape}
                      disabled={isScraping || !sourceUrl}
                      className="h-16 w-16 bg-primary text-primary-foreground rounded-2xl shadow-2xl shadow-primary/10 shrink-0 hover:scale-105 active:scale-95 transition-all"
                    >
                      {isScraping ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                    </Button>
                 </div>
              </div>

              {/* Template Manager Integration */}
              <TemplateManager 
                activePlatform={activePlatform} 
                onSelect={(t) => {
                  setActiveTemplate(t);
                  toast.success(`Blueprint '${t.name}' synthesized`);
                }} 
              />

              <div className="flex flex-col space-y-4">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Neural Context</label>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded-md">{sourceText.length} Bytes Ingested</span>
                 </div>
                 <div className="relative group p-[1px] rounded-[32px] bg-gradient-to-br from-border to-transparent focus-within:from-primary/30 transition-all">
                    <Textarea 
                      placeholder="Input raw context for neural synthesis..."
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                      className="min-h-[150px] rounded-[31px] resize-none p-8 text-sm leading-relaxed border-none bg-card shadow-inner focus-visible:ring-0 placeholder:text-muted-foreground/50 font-medium custom-scrollbar"
                    />
                 </div>
              </div>

              {/* Trend Pulse Sidebar Section */}
              <div className="space-y-6 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Pulse Intelligence</label>
                  {isSyncingTrends && <Loader2 className="w-3 h-3 animate-spin text-orange-500" />}
                </div>
                
                <div className="space-y-3">
                  {trends ? (
                    (trends || "").split('\n').filter(l => l.trim() && l.match(/^\d+\./)).slice(0, 3).map((trend, i) => (
                       <motion.div 
                         key={i}
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: i * 0.1 }}
                         onClick={() => handleTrendClick(trend)}
                         className="p-4 bg-muted/30 rounded-2xl border border-border/50 cursor-pointer hover:bg-orange-500/10 hover:border-orange-500/30 group transition-all"
                       >
                          <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#999] group-hover:text-orange-500">Trending Now</span>
                          </div>
                          <p className="text-[11px] font-bold leading-relaxed text-foreground group-hover:text-orange-950 line-clamp-2">{trend.replace(/^\d+\.\s+/, '')}</p>
                       </motion.div>
                    ))
                  ) : (
                    <div className="p-10 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center opacity-50">
                       <Activity className="w-5 h-5 mb-2" />
                       <p className="text-[9px] font-black uppercase tracking-widest">Awaiting Pulse...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                  <div 
                    onClick={() => setUseMultiAgent(!useMultiAgent)}
                    className={cn(
                      "flex items-center gap-5 p-6 rounded-[32px] border cursor-pointer transition-all duration-300",
                      useMultiAgent ? "bg-primary border-primary shadow-xl shadow-primary/20" : "bg-card border-border hover:bg-muted"
                    )}
                  >
                     <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                       useMultiAgent ? "bg-white/20 text-white" : "bg-muted text-foreground"
                     )}>
                        <Bot className="w-6 h-6" />
                     </div>
                     <div className="flex-1">
                       <p className={cn("text-[8px] font-black uppercase tracking-[0.2em]", useMultiAgent ? "text-white/60" : "text-muted-foreground")}>Protocol Mode</p>
                       <p className={cn("text-xs font-black uppercase tracking-widest mt-0.5", useMultiAgent ? "text-white" : "text-foreground")}>
                         {useMultiAgent ? 'Multi-Agent Suite' : 'Standard Forge'}
                       </p>
                     </div>
                     <div className={cn(
                       "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                       useMultiAgent ? "border-white bg-white" : "border-muted-foreground"
                     )}>
                        {useMultiAgent && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                     </div>
                  </div>

                  <div 
                    onClick={() => setIsAutopilot(!isAutopilot)}
                    className={cn(
                      "flex items-center gap-5 p-6 rounded-[32px] border cursor-pointer transition-all duration-300 relative overflow-hidden",
                      isAutopilot ? "bg-orange-500 border-orange-500 shadow-xl shadow-orange-500/20" : "bg-card border-border hover:bg-muted"
                    )}
                  >
                     {isAutopilot && (
                       <motion.div 
                         animate={{ x: ['100%', '-100%'] }}
                         transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                         className="absolute top-0 left-0 w-full h-full bg-white/10 skew-x-12 translate-x-full"
                       />
                     )}
                     <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors relative z-10",
                       isAutopilot ? "bg-white/20 text-white" : "bg-muted text-foreground"
                     )}>
                        <LucideZap className={cn("w-6 h-6", isAutopilot ? "fill-white" : "")} />
                     </div>
                     <div className="flex-1 relative z-10">
                       <p className={cn("text-[8px] font-black uppercase tracking-[0.2em]", isAutopilot ? "text-white/60" : "text-muted-foreground")}>Workflow Sync</p>
                       <p className={cn("text-xs font-black uppercase tracking-widest mt-0.5", isAutopilot ? "text-white" : "text-foreground")}>
                         Forge Autopilot
                       </p>
                     </div>
                     <div className={cn(
                       "w-10 h-6 rounded-full border-2 flex items-center transition-all px-1 relative z-10",
                       isAutopilot ? "border-white bg-white/20 justify-end" : "border-muted-foreground justify-start"
                     )}>
                        <motion.div 
                          layout
                          className={cn("w-3 h-3 rounded-full", isAutopilot ? "bg-white" : "bg-muted-foreground")} 
                        />
                     </div>
                  </div>

                  <div className="flex items-center gap-5 p-6 bg-card rounded-[32px] border border-border shadow-sm group hover:border-primary/20 transition-all">
                     <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-foreground group-hover:scale-110 transition-transform">
                        <Bot className="w-7 h-7" />
                     </div>
                     <div className="min-w-0 flex-1">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Brand Persona</p>
                       <p className="text-sm font-black text-foreground mt-1 truncate font-display italic">
                         {brandVoice || 'Autonomous Sync Mode'}
                       </p>
                     </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => handleGenerate()}
                      disabled={isGenerating || !sourceText}
                      className="flex-1 h-24 bg-primary text-primary-foreground rounded-[32px] shadow-2xl shadow-primary/20 font-display font-black uppercase tracking-[0.3em] text-[11px] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 group gap-5"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-4">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <span className="animate-pulse">Synthesizing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <LucideZap className="w-8 h-8 fill-primary-foreground" />
                          <span className="text-lg">Forge Asset</span>
                        </div>
                      )}
                    </Button>
                    <Button
                      onClick={handleQueueAutopilot}
                      disabled={isGenerating || !sourceText}
                      variant="outline"
                      className="w-24 h-24 rounded-[32px] border-border bg-card flex flex-col items-center justify-center gap-2 hover:bg-orange-500/10 hover:border-orange-500/30 transition-all group"
                      title="Queue for Background Autopilot"
                    >
                       <Rocket className="w-8 h-8 text-muted-foreground group-hover:text-orange-500" />
                       <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-orange-600 italic">Queue</span>
                    </Button>
                  </div>
              </div>
           </div>
        </aside>

        {/* Workspace Panel (Right) */}
        <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
          {/* Approval Portal Overlay */}
          <AnimatePresence>
            {proposedAsset && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-background/80 backdrop-blur-3xl flex items-center justify-center p-20"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 40 }}
                  animate={{ scale: 1, y: 0 }}
                  className="w-full max-w-5xl bg-card border border-border rounded-[60px] shadow-[0_0_100px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-full"
                >
                  <div className="p-12 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-orange-500 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-orange-500/20">
                         <Rocket className="w-10 h-10" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic font-display">Approval Portal</h2>
                        <div className="flex items-center gap-3 mt-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full">Provisional Asset</span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target: {proposedAsset.platform.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        disabled={isRefining !== null}
                        onClick={async () => {
                          if (!proposedAsset) return;
                          setIsRefining('magic');
                          try {
                            const res = await fetch('/api/refine', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                content: proposedAsset.content,
                                instruction: "Apply high-virality patterns. Double down on the hook. Ensure extreme clarity and platform native formatting.",
                                platform: proposedAsset.platform,
                                brandVoice
                              })
                            });
                            const data = await res.json();
                            if (res.ok && data.content) {
                              const predRes = await fetch('/api/predict-engagement', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ content: data.content, platform: proposedAsset.platform })
                              });
                              const predData = await predRes.json();
                              setProposedAsset(prev => ({ ...prev!, content: data.content, prediction: predData }));
                              toast.success("Magic refinement applied");
                            }
                          } catch (e) {
                            toast.error("Magic refinement failed");
                          } finally {
                            setIsRefining(null);
                          }
                        }}
                        className="h-16 px-10 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] border-border gap-3"
                      >
                         {isRefining === 'magic' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-orange-500" />}
                         Magic Refine
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={() => setProposedAsset(null)}
                        className="h-16 px-10 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] border-border"
                      >
                        Decline
                      </Button>
                      <Button 
                        size="lg" 
                        onClick={handleApprove}
                        className="h-16 px-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] bg-orange-500 hover:bg-orange-600 text-white shadow-2xl shadow-orange-500/20 gap-4"
                      >
                        <Shield className="w-5 h-5" />
                        Approve & Sync
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-16 custom-scrollbar flex gap-12">
                    <div className="flex-1 space-y-10">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Synthesized Narrative</label>
                       <div className="prose-signal bg-muted/20 p-12 rounded-[40px] border border-border shadow-inner min-h-[300px]">
                         <ReactMarkdown>{proposedAsset.content}</ReactMarkdown>
                       </div>
                    </div>
                    
                    <div className="w-[380px] space-y-8">
                       <div className="bg-primary text-primary-foreground p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
                           <h3 className="text-sm font-black uppercase tracking-[0.25em] text-primary-foreground/40 mb-8">Q-Score Matrix</h3>
                           <div className="flex items-end gap-5 mb-10">
                              <span className="text-7xl font-black font-display italic text-orange-400">{proposedAsset.prediction.score}</span>
                              <span className="text-sm font-black uppercase tracking-widest text-primary-foreground/60 mb-2">/ 100</span>
                           </div>
                           <div className="space-y-6">
                              {Object.entries(proposedAsset.prediction.metrics).map(([key, val]) => (
                                <div key={key} className="space-y-3">
                                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-primary-foreground/40">
                                      <span>{key}</span>
                                      <span>{val}%</span>
                                   </div>
                                   <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${val}%` }}
                                        className="h-full bg-orange-400"
                                      />
                                   </div>
                                </div>
                              ))}
                           </div>
                       </div>
                       
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Neural Optimization</label>
                          {proposedAsset.prediction.suggestions.map((s, i) => (
                            <div key={i} className="p-6 bg-muted/40 rounded-[28px] border border-border flex gap-4 items-start group hover:bg-muted transition-colors">
                               <Sparkles className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
                               <p className="text-xs font-black uppercase tracking-wider leading-relaxed text-foreground/70">{s}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-20 border-b border-border px-10 flex items-center justify-between bg-card/30 backdrop-blur-xl sticky top-0 z-20 flex-shrink-0">
               <div className="flex items-center gap-3 overflow-x-auto no-scrollbar max-w-[calc(100%-400px)]">
               {platforms.map((p) => (
                 <button
                   key={p.id}
                   onClick={() => setActivePlatform(p.id)}
                   className={cn(
                     "px-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 inline-flex items-center gap-3 shrink-0",
                     activePlatform === p.id 
                       ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105" 
                       : "text-muted-foreground hover:text-foreground hover:bg-muted"
                   )}
                 >
                   <p.icon className={cn("w-4 h-4", activePlatform === p.id ? "fill-primary-foreground" : "")} />
                   <span>{p.label}</span>
                 </button>
               ))}
               </div>

             <div className="flex items-center gap-4">
                {activePlatform === 'custom' && (
                  <Input 
                    placeholder="Platform Name..."
                    value={customPlatform}
                    onChange={(e) => setCustomPlatform(e.target.value)}
                    className="w-40 h-11 rounded-xl bg-muted border-border font-black uppercase text-[10px] tracking-widest"
                  />
                )}
                
                <DropdownMenu>
                    <DropdownMenuTrigger
                      className="h-11 px-6 rounded-xl border border-border bg-card font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-muted transition-colors"
                    >
                       <span>Format: {targetFormat}</span>
                       <ChevronDown className="w-3.5 h-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 p-2 rounded-2xl bg-card border-border shadow-2xl max-h-80 overflow-y-auto custom-scrollbar">
                       <DropdownMenuGroup>
                         <DropdownMenuLabel className="text-[9px] font-black uppercase text-muted-foreground px-3 py-2">Select Target Preset</DropdownMenuLabel>
                         <DropdownMenuSeparator />
                           {FORMAT_PRESETS.map((f) => (
                             <DropdownMenuItem 
                               key={f}
                               onClick={() => setTargetFormat(f)}
                               className="rounded-xl py-2.5 px-3 flex items-center gap-3 focus:bg-muted cursor-pointer"
                             >
                               <FileText className="w-4 h-4 text-muted-foreground" />
                               <span className="text-[11px] font-bold">{f}</span>
                             </DropdownMenuItem>
                           ))}
                       </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/50">
                    <button 
                      onClick={() => setViewMode('raw')}
                      className={cn(
                        "px-5 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        viewMode === 'raw' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >Editor</button>
                    <button 
                      onClick={() => setViewMode('preview')}
                      className={cn(
                        "px-5 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        viewMode === 'preview' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >Preview</button>
                </div>
                <div className="h-8 w-px bg-border/50 mx-2" />
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger 
                      className="w-11 h-11 rounded-xl hover:bg-muted text-primary transition-all flex items-center justify-center relative overflow-hidden group/repurpose outline-none border border-transparent"
                      disabled={isRepurposing || !generatedContent[activePlatform]}
                    >
                      {isRepurposing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-border bg-card shadow-2xl">
                       <DropdownMenuGroup>
                         <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Repurpose Signal To</DropdownMenuLabel>
                         <DropdownMenuSeparator />
                         {platforms.filter(p => p.id !== activePlatform).map(p => (
                           <DropdownMenuItem 
                             key={p.id} 
                             onClick={() => handleRepurpose(p.id)}
                             className="rounded-xl py-2.5 px-3 flex items-center gap-3 focus:bg-muted cursor-pointer"
                           >
                              <p.icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-[11px] font-black uppercase tracking-widest">{p.label}</span>
                           </DropdownMenuItem>
                         ))}
                       </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="icon" className="w-11 h-11 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all" onClick={() => {
                    if (generatedContent[activePlatform]) {
                      navigator.clipboard.writeText(generatedContent[activePlatform]);
                      toast.success('Asset stored in clipboard');
                    }
                  }}>
                    <Copy className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-11 h-11 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                    <Download className="w-5 h-5" />
                  </Button>
                </div>
             </div>
          </div>

        <div className="flex-1 overflow-y-auto p-16 custom-scrollbar relative z-0 bg-[#FAFAFA]">
             <div className="max-w-4xl mx-auto min-h-full">
               <AnimatePresence mode="wait">
                 {activeTab === 'content' && (
                  <motion.div
                    key="content-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-12"
                  >
                    {generatedContent[activePlatform] ? (
                      <div className="space-y-12">
                          {predictions[activePlatform] && (
                            <div className="bg-primary text-primary-foreground rounded-[40px] shadow-2xl shadow-primary/20 overflow-hidden relative group">
                              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
                              <div className="p-10 relative z-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-8">
                                      <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[32px] flex items-center justify-center text-primary-foreground border border-white/20 shadow-inner">
                                          <span className="text-5xl font-black text-orange-400 font-display italic">{predictions[activePlatform].score}</span>
                                      </div>
                                      <div>
                                          <h4 className="text-2xl font-black tracking-tighter uppercase font-display italic leading-none">Forge Quality Index</h4>
                                          <p className="text-[10px] text-primary-foreground/40 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                            Real-time engagement prediction model
                                          </p>
                                      </div>
                                    </div>
                                  <div className="text-right">
                                    <div className="px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border border-emerald-500/30 backdrop-blur-md">
                                        {predictions[activePlatform]?.potentialReach || 'Calculating...'} Potential Reach
                                    </div>
                                    {predictions[activePlatform]?.bestTime && (
                                      <div className="mt-3 px-6 py-3 bg-blue-500/20 text-blue-400 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border border-blue-500/30 backdrop-blur-md flex items-center gap-2">
                                         <Clock className="w-3.5 h-3.5" />
                                         Viral Window: {predictions[activePlatform].bestTime}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-12 pt-10 border-t border-white/10">
                                    {predictions[activePlatform].metrics && Object.entries(predictions[activePlatform].metrics).map(([key, value]) => (
                                      <div key={key} className="space-y-5">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-primary-foreground/40">{key}</span>
                                            <span className="text-sm font-black font-display">{value}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
                                            <motion.div 
                                              initial={{ width: 0 }}
                                              whileInView={{ width: `${value}%` }}
                                              transition={{ duration: 1.5, ease: 'easeOut' }}
                                              className="h-full bg-gradient-to-r from-orange-400 via-orange-300 to-white shadow-[0_0_10px_rgba(251,146,60,0.5)]"
                                            />
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                              "bg-card p-14 rounded-[40px] border border-border shadow-2xl shadow-primary/5 relative min-h-[400px]",
                              viewMode === 'preview' && "bg-transparent border-none shadow-none p-0"
                            )}
                          >
                            {viewMode === 'raw' ? (
                              <div className="prose-signal">
                                <ReactMarkdown>{generatedContent[activePlatform]}</ReactMarkdown>
                              </div>
                            ) : (
                                <SocialPreview 
                                  content={generatedContent[activePlatform]} 
                                  platform={activePlatform as any} 
                                />
                            )}
                            {viewMode === 'raw' && (
                              <div className="absolute top-10 right-10 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic font-display">Authenticated Forge</span>
                              </div>
                            )}
                          </motion.div>

                          {predictions[activePlatform] && (
                            <div className="pt-20 border-t border-border pb-40">
                              <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-5">
                                   <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20 hover:rotate-12 transition-transform">
                                      <RefreshCw className="w-7 h-7" />
                                   </div>
                                   <div className="flex flex-col">
                                     <h4 className="text-2xl font-black uppercase tracking-tighter italic font-display leading-none">Neural Refinement</h4>
                                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Optimization suggested by Forge Reactor</span>
                                   </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  {predictions[activePlatform]?.suggestions?.map((s, i) => (
                                    <motion.div 
                                      key={i} 
                                      initial={{ opacity: 0, y: 20 }}
                                      whileInView={{ opacity: 1, y: 0 }}
                                      transition={{ delay: i * 0.1 }}
                                      whileHover={{ scale: 1.02 }}
                                      className="flex justify-between p-8 bg-card rounded-[32px] border border-border hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
                                    >
                                      <div className="flex flex-col flex-1">
                                        <div className="flex items-start gap-5 mb-8">
                                            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-foreground border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                                              <Sparkles className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-black leading-relaxed text-foreground/80 pt-1 italic">{s}</span>
                                        </div>
                                        <Button 
                                          size="lg" 
                                          variant="outline"
                                          disabled={isRefining === s}
                                          onClick={() => handleRefine(s)}
                                          className="h-12 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all gap-3 bg-muted/50 border-border"
                                        >
                                            {isRefining === s ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                            Sync Profile
                                        </Button>
                                      </div>
                                    </motion.div>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="h-full min-h-[700px] flex flex-col items-center justify-center text-center p-20">
                          <motion.div 
                            animate={{ 
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 6, repeat: Infinity }}
                            className="w-48 h-48 bg-card rounded-[60px] shadow-2xl border border-border flex items-center justify-center mb-12 relative"
                          >
                            <LucideZap className="w-20 h-20 text-muted-foreground/30 relative z-10" />
                            <div className="absolute inset-4 rounded-[40px] bg-gradient-to-tr from-orange-500/10 to-transparent animate-pulse" />
                          </motion.div>
                          <h3 className="text-4xl font-black tracking-tighter uppercase italic font-display mb-6">Awaiting Signal</h3>
                          <p className="text-muted-foreground font-medium max-w-md mx-auto text-lg leading-relaxed">Load your source material or upload a document to begin the neural synthesis sequence.</p>
                          
                          <div className="mt-20 grid grid-cols-3 gap-10 w-full max-w-3xl">
                            {[
                              { label: 'Cloud Scrape', icon: Link2, desc: 'Web Intelligence' },
                              { label: 'PDF Tunnel', icon: FileText, desc: 'Deep Parsing' },
                              { label: 'Neural Blueprint', icon: LayoutIcon, desc: 'Logic Layer' },
                            ].map((tip, i) => (
                              <motion.div 
                                key={i} 
                                whileHover={{ y: -10 }}
                                className="flex flex-col items-center gap-6 bg-card p-10 rounded-[40px] border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-default"
                              >
                                <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center text-foreground border border-border shadow-inner">
                                  <tip.icon className="w-8 h-8" />
                                </div>
                                <div className="text-center">
                                  <p className="text-[12px] font-black uppercase tracking-widest text-foreground">{tip.label}</p>
                                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">{tip.desc}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                      </div>
                    )}
                  </motion.div>
                 )}

                 {activeTab === 'optimize' && (
                   <motion.div
                    key="optimize-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                   >
                     <ContentOptimizer 
                       content={generatedContent[activePlatform] || ''} 
                       platform={activePlatform} 
                       onRefine={handleRefine}
                     />
                   </motion.div>
                 )}

                 {activeTab === 'visuals' && (
                   <motion.div
                    key="visuals-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                   >
                     <VisualGenerator 
                       content={generatedContent[activePlatform] || ''} 
                       platform={activePlatform} 
                     />
                   </motion.div>
                 )}

                 {activeTab === 'history' && (
                   <div className="space-y-10 pb-40">
                      <div className="flex items-center justify-between border-b border-border pb-8">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                               <History className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic font-display">History Matrix</h3>
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1.5 rounded-full">{history.length} Saved Nodes</span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6">
                        {history.length > 0 ? (
                          history.map((item, i) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="group bg-card border border-border rounded-[32px] p-10 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col md:flex-row gap-10 relative overflow-hidden"
                            >
                               <div className="absolute top-0 left-0 w-2 h-full bg-primary/10" />
                               <div className="w-20 h-20 bg-muted rounded-[24px] flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shrink-0 shadow-inner">
                                  {platforms.find(p => p.id === item.platform)?.icon ? (
                                    (() => {
                                      const Icon = platforms.find(p => p.id === item.platform)!.icon;
                                      return <Icon className="w-10 h-10" />;
                                    })()
                                  ) : <LucideZap className="w-10 h-10" />}
                               </div>
                               
                               <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-4 mb-4">
                                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-muted/50 px-3 py-1 rounded-lg">
                                       {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                     </span>
                                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                       {item.platform.toUpperCase()}
                                     </span>
                                  </div>
                                  <p className="text-base font-bold leading-relaxed text-foreground/80 line-clamp-3 italic">
                                    {item.content}
                                  </p>
                                  {item.prediction && (
                                    <div className="mt-6 flex gap-3">
                                       <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl border border-border/50">
                                          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                                          <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                                            Q-Score: {item.prediction.score}
                                          </span>
                                       </div>
                                       <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl border border-border/50">
                                          <Shield className="w-3.5 h-3.5 text-blue-500" />
                                          <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                                            {item.prediction.potentialReach}
                                          </span>
                                       </div>
                                    </div>
                                  )}
                               </div>

                               <div className="flex flex-col justify-center gap-3 shrink-0">
                                  <Button 
                                    variant="default" 
                                    size="lg" 
                                    className="h-12 px-8 rounded-xl font-display font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105"
                                    onClick={() => {
                                      setGeneratedContent(prev => ({ ...prev, [item.platform]: item.content }));
                                      setPredictions(prev => ({ ...prev, [item.platform]: item.prediction }));
                                      setActivePlatform(item.platform);
                                      setActiveTab('content');
                                      toast.success('Neural node synchronized');
                                    }}
                                  >
                                    Sync Node
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="lg" 
                                    className="h-12 px-8 rounded-xl font-display font-black text-[10px] uppercase tracking-widest text-muted-foreground"
                                  >
                                    Archive
                                  </Button>
                               </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center py-40 bg-card rounded-[40px] border-2 border-dashed border-border group">
                             <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                <History className="w-10 h-10 text-muted-foreground/30" />
                             </div>
                             <h4 className="text-3xl font-black uppercase tracking-tighter italic font-display">History Matrix Empty</h4>
                             <p className="text-muted-foreground font-medium mt-4 max-w-sm mx-auto">Initialize synthesis to begin archiving your digital twin configurations.</p>
                             <Button 
                               variant="outline" 
                               className="mt-10 rounded-xl font-black text-[10px] uppercase tracking-widest"
                               onClick={() => setActiveTab('content')}
                             >
                               Start Synthesis
                             </Button>
                          </div>
                        )}
                      </div>
                   </div>
                 )}
               </AnimatePresence>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

