import { useState, useEffect } from 'react';
import { 
  Target, 
  Users, 
  MessageSquare, 
  Sparkles, 
  Save, 
  Shield, 
  Zap,
  Globe,
  TrendingUp,
  BrainCircuit,
  Loader2,
  Workflow,
  PlusCircle,
  Play,
  Settings as SettingsIcon,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '@/store/useStore';
import { aiService } from '@/services/aiService';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

const defaultAutomations = [
  { id: '1', title: 'Viral Trend Sync', description: 'IF trend score > 85% → Auto-generate LinkedIn and X draft.', active: true },
  { id: '2', title: 'Content Repurpose Pipeline', description: 'IF asset engagement > 15% → Auto-repurpose into Twitter Thread.', active: true },
  { id: '3', title: 'Market Sentiment Alert', description: 'IF competitor launches major update → Prompt for response.', active: false },
  { id: '4', title: 'Campaign Growth Sync', description: 'IF campaign performance drops 10% → Generate strategy recommendation.', active: true },
];

export default function Strategy() {
  const { user } = useAuth();
  const { currentWorkspace, projects } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isForging, setIsForging] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizations, setOptimizations] = useState<any[]>([]);
  const [automations, setAutomations] = useState(defaultAutomations);
  const [profile, setProfile] = useState({
    brandVoice: '',
    targetAudience: '',
    niche: '',
    goals: '',
    keywords: '',
    competitors: '',
    usp: '',
    primaryPlatform: 'LinkedIn',
    primaryFormat: 'Thought Leadership Post'
  });

  useEffect(() => {
    if (!user || !currentWorkspace) return;
    const unsubscribe = onSnapshot(doc(db, 'workspaces', currentWorkspace.id), (snap) => {
      if (snap.exists() && snap.data().strategy) {
        setProfile(prev => ({ ...prev, ...snap.data().strategy }));
      }
    });
    return () => unsubscribe();
  }, [user, currentWorkspace]);

  const handleSave = async () => {
    if (!user || !currentWorkspace) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'workspaces', currentWorkspace.id), {
        primaryPlatform: profile.primaryPlatform,
        primaryFormat: profile.primaryFormat,
        strategy: {
          ...profile,
          updatedAt: new Date()
        }
      }, { merge: true });
      toast.success('Strategy Matrix updated');
    } catch (e) {
      toast.error('Failed to update strategy');
    } finally {
      setIsSaving(false);
    }
  };

  const forgeStrategy = async () => {
    setIsForging(true);
    try {
      const res = await aiService.generateStrategy(profile.niche, profile.usp, profile.goals);
      setProfile(prev => ({
        ...prev,
        brandVoice: res.brandVoice || prev.brandVoice,
        targetAudience: res.targetAudience || prev.targetAudience,
        keywords: res.keywords || prev.keywords
      }));
      toast.success('AI Strategy Protocols generated');
    } catch (err) {
      toast.error('Failed to forge strategy');
    } finally {
      setIsForging(false);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const history = projects.slice(0, 10).map(p => ({ title: p.title, status: p.status }));
      const res = await aiService.getOptimizationSuggestions(profile, history);
      setOptimizations(res.optimizations || []);
      toast.success('Neural optimization complete');
    } catch (e) {
      toast.error('Optimization failed');
    } finally {
      setIsOptimizing(false);
    }
  };

  const applyOptimization = (opt: any) => {
    setProfile(prev => ({
      ...prev,
      [opt.targetField]: opt.suggestedValue
    }));
    setOptimizations(prev => prev.filter(o => o !== opt));
    toast.success(`${opt.targetField} optimized`);
  };

  return (
    <div className="h-full overflow-y-auto bg-background selection:bg-primary selection:text-primary-foreground custom-scrollbar">
      <div className="max-w-6xl mx-auto px-10 py-20 pb-40 space-y-32">
         {/* Hero */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic font-display">Autonomous Operating System v4.0</span>
              </div>
              <h1 className="text-7xl font-black tracking-tighter uppercase italic font-display mb-8">Intelligence Matrix</h1>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                Configure the autonomous core of SignalForge. Define brand protocols and no-code automation logic to reduce manual efforts.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 shrink-0">
              <Button 
                onClick={forgeStrategy}
                disabled={isForging}
                className="h-16 px-10 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-[0.2em] text-[10px] gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
              >
                {isForging ? <Loader2 className="w-6 h-6 animate-spin" /> : <BrainCircuit className="w-6 h-6" />}
                Autonomous Sync
              </Button>
            </div>
         </div>

         {/* Neural optimization lab */}
         <section className="space-y-12">
            <div className="flex items-center justify-between border-b border-border pb-8">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary rounded-2xl text-primary-foreground shadow-xl shadow-primary/20">
                     <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter font-display">Optimization Lab</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Performance analysis & strategy tuning</p>
                  </div>
               </div>
               <Button 
                 onClick={handleOptimize}
                 disabled={isOptimizing}
                 variant="outline" 
                 className="h-12 rounded-xl border-border bg-card font-black text-[10px] uppercase tracking-widest gap-2"
               >
                  {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                  Analyze Matrix
               </Button>
            </div>

            <AnimatePresence>
               {optimizations.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {optimizations.map((opt, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="p-8 rounded-[32px] border border-primary/20 bg-primary/5 relative group"
                      >
                         <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">SUGGESTED OPTIMIZATION: {opt.targetField}</p>
                         <p className="text-sm font-bold leading-tight mb-4">{opt.reason}</p>
                         <div className="p-4 bg-white/50 dark:bg-black/50 rounded-xl mb-6 text-[10px] blur-sm hover:blur-none transition-all">
                            <span className="opacity-50">Current:</span> {opt.currentValue.substring(0, 50)}...
                         </div>
                         <Button 
                           onClick={() => applyOptimization(opt)}
                           className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
                         >
                           Apply Tuning
                         </Button>
                      </motion.div>
                    ))}
                 </div>
               ) : (
                 <div className="py-20 text-center border-2 border-dashed border-border rounded-[48px] opacity-30">
                   <p className="text-sm font-black uppercase tracking-widest">No active optimizations discovered. Matrix is stable.</p>
                 </div>
               )}
            </AnimatePresence>
         </section>

         {/* Automation Builder (No-Code section) */}
         <section className="space-y-12">
            <div className="flex items-center justify-between border-b border-border pb-8">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-orange-500 rounded-2xl text-white shadow-xl shadow-orange-500/20">
                     <Workflow className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter font-display">Automation Protocols</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Autonomous event-driven actions</p>
                  </div>
               </div>
               <Button variant="outline" className="h-12 rounded-xl border-border bg-card font-black text-[10px] uppercase tracking-widest gap-2">
                  <PlusCircle className="w-4 h-4" /> Create Logic
               </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {automations.map((auto, i) => (
                  <motion.div
                    key={auto.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="p-8 rounded-[40px] border border-border bg-card hover:border-orange-500/30 transition-all group overflow-hidden relative">
                       <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                          <Zap className="w-20 h-20" />
                       </div>
                       <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="text-xl font-black italic tracking-tighter uppercase font-display mb-1">{auto.title}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Event-Triggered</p>
                          </div>
                          <Switch 
                            checked={auto.active} 
                            onCheckedChange={() => {
                              const newAutos = [...automations];
                              newAutos[i].active = !newAutos[i].active;
                              setAutomations(newAutos);
                              toast.info(`Protocol ${auto.title} ${newAutos[i].active ? 'Activated' : 'Suspended'}`);
                            }}
                            className="bg-muted"
                          />
                       </div>
                       <div className="p-6 bg-muted/30 rounded-2xl border border-border mb-8 font-mono text-[11px] leading-relaxed group-hover:bg-muted group-hover:border-orange-500/20 transition-all">
                          {auto.description}
                       </div>
                       <div className="flex justify-between items-center">
                          <div className="flex -space-x-2">
                             {[1,2,3].map(j => <div key={j} className="w-6 h-6 rounded-full bg-muted border border-card" />)}
                             <span className="ml-4 text-[9px] font-black uppercase text-muted-foreground">+3 Nodes connected</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                             Configure <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                       </div>
                    </Card>
                  </motion.div>
               ))}
            </div>
         </section>

         {/* Strategy Parameters */}
         <section className="space-y-12">
            <div className="flex items-center gap-4 border-b border-border pb-8">
               <div className="p-4 bg-primary rounded-2xl text-primary-foreground shadow-xl shadow-primary/20">
                  <BrainCircuit className="w-6 h-6" />
               </div>
               <div>
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter font-display">Neural Core Mapping</h2>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">High-definition brand parameters</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Brand Archetype & Voice</label>
                  <Textarea 
                    value={profile.brandVoice}
                    onChange={(e) => setProfile({ ...profile, brandVoice: e.target.value })}
                    placeholder="Enter brand voice guidelines..."
                    className="min-h-[200px] bg-card border-border rounded-[32px] p-8 text-sm focus-visible:ring-primary font-medium shadow-sm"
                  />
               </div>
               <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Persona Matrix</label>
                  <Textarea 
                    value={profile.targetAudience}
                    onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value })}
                    placeholder="Describe your ideal audience..."
                    className="min-h-[200px] bg-card border-border rounded-[32px] p-8 text-sm focus-visible:ring-primary font-medium shadow-sm"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Primary Deployment Node</label>
                  <Input 
                     value={profile.primaryPlatform}
                     onChange={(e) => setProfile({ ...profile, primaryPlatform: e.target.value })}
                     placeholder="e.g. LinkedIn, Reddit, Substack"
                     className="h-16 bg-card border-border rounded-2xl px-6 text-sm font-bold"
                  />
                  <p className="text-[9px] font-bold text-muted-foreground uppercase italic px-2">Autonomous target platform for sync nodes.</p>
               </div>
               <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Default Narrative Format</label>
                  <Input 
                     value={profile.primaryFormat}
                     onChange={(e) => setProfile({ ...profile, primaryFormat: e.target.value })}
                     placeholder="e.g. Thought Leadership Post, Viral Thread"
                     className="h-16 bg-card border-border rounded-2xl px-6 text-sm font-bold"
                  />
                  <p className="text-[9px] font-bold text-muted-foreground uppercase italic px-2">Default template protocol for background assets.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Primary Sector</label>
                  <Input 
                     value={profile.niche}
                     onChange={(e) => setProfile({ ...profile, niche: e.target.value })}
                     placeholder="e.g. B2B FinTech"
                     className="h-16 bg-card border-border rounded-2xl px-6 text-sm font-bold"
                  />
               </div>
               <div className="space-y-6 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Market Edge (USP)</label>
                  <Input 
                     value={profile.usp}
                     onChange={(e) => setProfile({ ...profile, usp: e.target.value })}
                     placeholder="Your unique competitive advantage"
                     className="h-16 bg-card border-border rounded-2xl px-6 text-sm font-bold"
                  />
               </div>
            </div>
         </section>

         <div className="fixed bottom-10 right-10 z-50">
            <Button 
               onClick={handleSave} 
               disabled={isSaving}
               className="h-20 px-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[32px] shadow-2xl shadow-emerald-500/30 font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-4"
            >
               {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
               Synchronize Protocols
            </Button>
         </div>
      </div>
    </div>
  );
}
