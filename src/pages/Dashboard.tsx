import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  TrendingUp, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  FileText,
  History,
  Activity,
  ChevronRight,
  ShieldCheck,
  Rocket,
  Plus,
  Loader2,
  Globe,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useStore } from "@/store/useStore";
import { aiService } from "@/services/aiService";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, where, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const data = [
  { name: 'Mon', content: 4, engagement: 2400 },
  { name: 'Tue', content: 7, engagement: 3398 },
  { name: 'Wed', content: 5, engagement: 9800 },
  { name: 'Thu', content: 9, engagement: 6908 },
  { name: 'Fri', content: 12, engagement: 4800 },
  { name: 'Sat', content: 8, engagement: 3800 },
  { name: 'Sun', content: 15, engagement: 4300 },
];

const platformEngagement = [
  { platform: 'LinkedIn', score: 85, color: '#0A66C2' },
  { platform: 'Twitter', score: 92, color: '#000000' },
  { platform: 'Instagram', score: 68, color: '#E4405F' },
  { platform: 'Newsletter', score: 74, color: '#FF5A5F' },
];

const StatCard = ({ title, value, change, trend, icon: Icon, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="p-8 border-border bg-card card-hover relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-12 h-12" />
      </div>
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-muted rounded-2xl">
          <Icon className="w-6 h-6 text-foreground" />
        </div>
        <div className={cn(
          "flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
          trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : trend === 'down' ? "bg-rose-500/10 text-rose-600" : "bg-muted text-muted-foreground"
        )}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
          {change}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">{title}</p>
        <p className="text-4xl font-black tracking-tighter uppercase font-display italic leading-none">{value}</p>
      </div>
    </Card>
  </motion.div>
);

const ActivityItem = ({ title, time, type, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    className="flex items-center justify-between py-5 border-b border-border last:border-0 group cursor-pointer"
  >
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary transition-colors">
        {type === 'content' ? (
          <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground" />
        ) : (
          <Activity className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground" />
        )}
      </div>
      <div>
        <p className="text-sm font-bold truncate max-w-[200px]">{title}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
    <ChevronRight className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
  </motion.div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { currentWorkspace, projects, setProjects, trends, setTrends, isSyncingTrends, setIsSyncingTrends, approvals, setApprovals } = useStore();
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [marketAlerts, setMarketAlerts] = useState<any>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [telemetryState, setTelemetryData] = useState<any>(null);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const data = await aiService.getTelemetry();
        setTelemetryData(data);
      } catch (e) {}
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!currentWorkspace) return;

    setLoading(true);
    const projectsPath = `workspaces/${currentWorkspace.id}/projects`;
    const q = query(
      collection(db, projectsPath),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsub = onSnapshot(q, (snap) => {
      const projs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setProjects(projs);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, projectsPath);
    });

    const approvalsPath = `workspaces/${currentWorkspace.id}/approvals`;
    const qApp = query(
      collection(db, approvalsPath),
      where('status', '==', 'pending'),
      limit(5)
    );

    const unsubApp = onSnapshot(qApp, (snap) => {
      const apps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setApprovals(apps);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, approvalsPath);
    });

    return () => {
      unsub();
      unsubApp();
    };
  }, [currentWorkspace]);

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

  useEffect(() => {
    if (!currentWorkspace) return;
    
    // Attempt cache retrieval
    const cacheKey = `market_watch_${currentWorkspace.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Only use cache if it was fetched in the last hour
        if (Date.now() - parsed.timestamp < 3600000) {
          setMarketAlerts(parsed.data);
          return;
        }
      } catch (e) {}
    }

    const fetchMarketWatch = async () => {
       setIsWatching(true);
       try {
          const snap = await getDoc(doc(db, 'workspaces', currentWorkspace.id));
          const strategy = snap.data()?.strategy || {};
          const niche = strategy.niche || 'AI agents and B2B SaaS';
          const res = await aiService.getMarketWatch(niche, strategy);
          setMarketAlerts(res);
          localStorage.setItem(cacheKey, JSON.stringify({ data: res, timestamp: Date.now() }));
       } catch (e) {
          console.error("Market watch node fail:", e);
       } finally {
          setIsWatching(false);
       }
    };
    fetchMarketWatch();
  }, [currentWorkspace]);

  const handleAutoSyncTrend = async (trendText: string) => {
    if (!currentWorkspace || !user) return;
    setSyncingId(trendText);
    try {
      // Get strategy first
      const snap = await getDoc(doc(db, 'workspaces', currentWorkspace.id));
      const wsData = snap.data();
      const strategy = wsData?.strategy || {};
      const platform = wsData?.primaryPlatform || 'LinkedIn';
      const format = wsData?.primaryFormat || 'Thought Leadership Post';
      
      const res = await aiService.syncTrend(trendText, strategy, platform, format);
      
      await addDoc(collection(db, `workspaces/${currentWorkspace.id}/approvals`), {
        ...res,
        status: 'pending',
        platform,
        targetFormat: format,
        createdAt: serverTimestamp(),
        userId: user.uid
      });
      
      toast.success('Autonomous Forge queued for approval');
    } catch (e: any) {
      toast.error('Forge sync failed: ' + e.message);
    } finally {
      setSyncingId(null);
    }
  };

  const trendList = (trends || "").split('\n')
    .map(t => t.trim())
    .filter(t => t && (t.match(/^\d\./) || t.startsWith('*') || t.length > 20))
    .slice(0, 5);

  return (
    <div className="p-10 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Autopilot Status */}
      <AnimatePresence>
        {approvals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="p-10 bg-black text-white rounded-[48px] shadow-3xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 technical-grid opacity-10" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10">
               <div className="flex items-center gap-8">
                  <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center text-primary-foreground animate-pulse shadow-2xl">
                     <ShieldCheck className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase font-display leading-none">Authorization Required</h3>
                     </div>
                     <p className="text-base text-white/50 font-medium">Autopilot has forged <span className="text-white font-black">{approvals.length} signals</span> that exceed the virality threshold. Review required for deployment.</p>
                  </div>
               </div>
               <Link to="/approvals" className="shrink-0 w-full xl:w-auto">
                  <Button className="w-full xl:w-auto h-20 px-16 bg-white text-black hover:bg-white/90 rounded-[28px] font-black uppercase text-xs tracking-[0.3em] shadow-2xl group transition-all hover:scale-105 active:scale-95">
                    Enter Approval Portal
                    <ChevronRight className="w-5 h-5 ml-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
               </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Signals Forged" value={projects.length * 8 + 4} change="+12.5%" trend="up" icon={Layers} delay={0.1} />
        <StatCard title="Engagement Delta" value="4.2M" change="+4.2%" trend="up" icon={TrendingUp} delay={0.2} />
        <StatCard title="Active Campaigns" value="3" change="0%" trend="neutral" icon={Rocket} delay={0.3} />
        <StatCard title="Neural Upshift" value={telemetryState?.metrics?.fallbacks > 0 ? `${telemetryState.metrics.fallbacks} Fallbacks` : "Stable"} change={telemetryState?.metrics?.fallbacks > 0 ? "Routing" : "Direct"} trend={telemetryState?.metrics?.fallbacks > 0 ? "neutral" : "up"} icon={Zap} delay={0.4} />
      </div>

      {/* Intelligence Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { name: 'Gemini Primary', key: 'google' },
          { name: 'OpenAI Fallback', key: 'openai' },
          { name: 'DeepSeek Matrix', key: 'featherless' },
          { name: 'Groq Edge', key: 'groq' },
          { name: 'Local Cluster', key: 'local' },
          { name: 'Handoff Node', key: 'fallbacks' }
        ].map((node, i) => (
          <motion.div
            key={node.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl relative overflow-hidden"
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              telemetryState?.metrics?.[node.key] >= 0 ? (node.key === 'fallbacks' && telemetryState?.metrics?.[node.key] > 0 ? "bg-orange-500 animate-pulse" : "bg-emerald-500") : "bg-muted animate-pulse"
            )} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none opacity-70 mb-1">{node.name}</span>
              <span className="text-[9px] font-bold opacity-40">{telemetryState?.metrics?.[node.key] ?? 0} Requests</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Main Intelligence Grid */}
        <div className="xl:col-span-8 space-y-12">
           {/* Chart Area */}
           <Card className="p-12 border-border bg-card rounded-[48px] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 flex gap-4">
                 <Link to="/billing" className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Matrix Billing</span>
                 </Link>
                 <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Production Cluster Node</span>
                 </div>
              </div>
              <div className="mb-12">
                 <h3 className="text-3xl font-black tracking-tighter uppercase font-display italic mb-2">Neural Synthesis</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">Intelligence performance metrics (System Core)</p>
              </div>

              <div className="h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                      <defs>
                        <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#999' }} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '16px', color: '#FFF', fontSize: '10px', fontWeight: '900' }}
                        cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }}
                      />
                      <Area type="monotone" dataKey="engagement" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorEng)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </Card>

           {/* Insights Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-10 rounded-[40px] bg-primary text-primary-foreground relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-50">PROACTIVE PROTOCOL</p>
                 <h4 className="text-3xl font-black italic font-display uppercase tracking-tighter mb-4 leading-none">Autonomous Expansion</h4>
                 <p className="text-sm opacity-70 mb-10 leading-relaxed font-medium">92% predictive engagement for "AI Agents" content in your niche. Ready for auto-forge?</p>
                 <Link to="/studio">
                   <Button className="w-full h-14 bg-white text-primary rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/90">Forge New Signal</Button>
                 </Link>
              </Card>

              <Card className="p-10 rounded-[40px] border-border bg-card shadow-sm group">
                 <div className="flex justify-between items-center mb-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">AUTO-REPURPOSE PULSE</p>
                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-tighter">Active</div>
                 </div>
                 <div className="space-y-6">
                    <div className="p-6 bg-muted/40 rounded-[28px] border border-border group-hover:border-primary/20 transition-all">
                       <p className="text-[11px] font-bold text-foreground mb-3 leading-tight">Your LinkedIn post on AI Trends is viral.</p>
                       <Button variant="ghost" className="h-8 px-0 text-[10px] font-black uppercase text-primary hover:bg-transparent flex items-center gap-2">
                          Repurpose to X Thread <ArrowUpRight className="w-3.5 h-3.5" />
                       </Button>
                    </div>
                    <div className="p-6 bg-muted/40 rounded-[28px] border border-border opacity-50">
                       <p className="text-[11px] font-bold text-foreground mb-3 leading-tight">Weekly Strategy Report ready.</p>
                       <Button variant="ghost" className="h-8 px-0 text-[10px] font-black uppercase text-muted-foreground hover:bg-transparent">Generate Digest</Button>
                    </div>
                 </div>
              </Card>
           </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="xl:col-span-4 space-y-12">
           {/* CRM Synchronizer */}
           <Card className="p-10 border-border bg-card rounded-[40px] shadow-sm group">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">CRM SYNC MATRIX</p>
                 </div>
                 <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-tighter">Synced</div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground">Salesforce Node</span>
                    <span className="text-[10px] font-black">Active</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground">HubSpot Pipeline</span>
                    <span className="text-[10px] font-black text-white px-2 py-1 bg-black rounded">Maintenance</span>
                 </div>
              </div>
           </Card>

           {/* Neural Market Alerts (Autonomous) */}
           <Card className="p-10 border-border bg-orange-600 text-white rounded-[40px] shadow-3xl shadow-orange-600/20 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                 <Zap className="w-16 h-16 fill-white" />
              </div>
              <div className="relative z-10 space-y-6">
                 <div>
                   <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">NEURAL MARKET GAP</p>
                   <h4 className="text-2xl font-black italic font-display uppercase tracking-tighter leading-tight">Autonomous Edge Alert</h4>
                 </div>
                 
                 {isWatching ? (
                   <div className="flex items-center gap-4 py-4">
                     <Loader2 className="w-5 h-5 animate-spin" />
                     <span className="text-[10px] font-black uppercase tracking-widest italic opacity-80">Scanning Matrix...</span>
                   </div>
                 ) : marketAlerts ? (
                   <div className="space-y-6">
                      <div className="p-5 bg-black/10 rounded-2xl border border-white/5">
                         <p className="text-[11px] font-bold leading-tight">{marketAlerts.opportunities?.[0]}</p>
                      </div>
                      <Link to="/studio">
                        <Button className="w-full h-12 bg-white text-orange-600 hover:bg-white/90 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2">
                           Forge Counter-Response <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                   </div>
                 ) : (
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-30 py-4 italic">Neural sync in progress...</p>
                 )}
              </div>
           </Card>

           {/* Active Stream */}
           <Card className="p-10 border-border bg-card rounded-[48px] shadow-sm flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-black tracking-tight uppercase font-display italic">Intelligence Flow</h3>
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex-1 space-y-4">
                 {projects.length > 0 ? projects.map((proj, i) => (
                   <ActivityItem 
                     key={proj.id} 
                     title={proj.title || 'Signal Sync'} 
                     time={proj.createdAt?.toDate ? proj.createdAt.toDate().toLocaleDateString() : 'Active'} 
                     type="content" 
                     delay={i * 0.05} 
                   />
                 )) : (
                   <div className="py-20 text-center opacity-30">
                     <p className="text-[10px] font-black uppercase tracking-widest leading-none">Neural stream empty</p>
                   </div>
                 )}
              </div>
           </Card>

           {/* Market Sentiment (Trend Sync) */}
           <Card className="p-10 border-border bg-[#F5F5F5] dark:bg-zinc-900 rounded-[48px] shadow-sm border border-black/5">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-black tracking-tight uppercase font-display italic">Market Resonance</h3>
                 <Globe className="w-5 h-5 opacity-20" />
              </div>
              <div className="space-y-6">
                 {isSyncingTrends ? (
                   [1,2,3].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl bg-black/5" />)
                 ) : (
                   trendList.map((trend, i) => (
                     <div key={i} className="group cursor-pointer">
                        <div className="p-5 bg-white dark:bg-black rounded-2xl border border-black/5 group-hover:border-primary/30 transition-all">
                           <p className="text-[11px] font-bold leading-tight mb-4">{trend.replace(/^\d\.\s*/, '')}</p>
                           <Button 
                             disabled={syncingId === trend}
                             onClick={() => handleAutoSyncTrend(trend)}
                             variant="ghost" 
                             className="h-8 px-0 w-full justify-between text-[10px] font-black uppercase text-primary hover:bg-transparent"
                           >
                             {syncingId === trend ? (
                               <span className="flex items-center gap-2 italic">Syncing <Loader2 className="w-3 h-3 animate-spin" /></span>
                             ) : (
                               <span className="flex items-center gap-2 italic">Sync with Autopilot <ArrowRight className="w-3 h-3" /></span>
                             )}
                           </Button>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </Card>

           {/* Platform Affinity */}
           <Card className="p-10 border-border bg-black text-white rounded-[48px] shadow-3xl overflow-hidden relative group">
              <div className="absolute top-0 left-0 technical-grid opacity-20 pointer-events-none" />
              <h3 className="text-xl font-black tracking-tight uppercase font-display italic mb-10 relative z-10">Node Resonance</h3>
              <div className="space-y-8 relative z-10">
                 {platformEngagement.map((p, i) => (
                   <div key={p.platform} className="space-y-3">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{p.platform}</span>
                         <span className="text-2xl font-black italic tracking-tighter leading-none">{p.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           whileInView={{ width: `${p.score}%` }}
                           transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                           className="h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.3)]" 
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
