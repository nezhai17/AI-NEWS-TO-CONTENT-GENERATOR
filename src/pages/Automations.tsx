import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  Plus, 
  Play, 
  Settings2, 
  ShieldCheck, 
  Target,
  Globe,
  Clock,
  ArrowRight,
  MoreVertical,
  Pause,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const initialAutomations = [
  {
    id: '1',
    name: 'Trend Forge Sync',
    description: 'Auto-generates draft content when a tech trend reaches 80% market resonance.',
    trigger: 'Market Trend Alert',
    stepsCount: 4,
    isActive: true,
    lastRun: '2 hours ago',
    successRate: '98.2%'
  },
  {
    id: '2',
    name: 'LinkedIn Engagement Pulse',
    description: 'Auto-replies to high-value comments using brand voice memory.',
    trigger: 'New LinkedIn Comment',
    stepsCount: 3,
    isActive: false,
    lastRun: '1 day ago',
    successRate: '94.5%'
  },
  {
    id: '3',
    name: 'Newsletter Repurpose Flow',
    description: 'Transforms viral LinkedIn posts into formatted newsletter sections.',
    trigger: 'Engagement Milestone',
    stepsCount: 5,
    isActive: true,
    lastRun: '4 hours ago',
    successRate: '100%'
  }
];

export default function Automations() {
  const [automations, setAutomations] = useState(initialAutomations);
  const [isCreating, setIsCreating] = useState(false);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ));
    const auto = automations.find(a => a.id === id);
    if (auto?.isActive) {
        toast.info(`Automation suspended: ${auto.name}`);
    } else {
        toast.success(`Automation activated: ${auto?.name}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-primary rounded-full" />
               <h1 className="text-5xl font-black italic tracking-tighter uppercase font-display leading-none">Neural Workflows</h1>
            </div>
            <p className="text-muted-foreground text-sm font-medium max-w-lg">
               Configure autonomous agent pipelines that operate 24/7 across the global matrix. Deploy approval locks to maintain human-in-the-loop oversight.
            </p>
         </div>
         
         <Button 
            onClick={() => setIsCreating(true)}
            className="h-16 px-10 rounded-[28px] bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-4 hover:scale-105 transition-all shadow-xl shadow-primary/20"
         >
            <Plus className="w-4 h-4" />
            Build New Agent
         </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
         {automations.map((auto, idx) => (
           <motion.div
             key={auto.id}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: idx * 0.1 }}
           >
              <Card className="p-8 pb-10 rounded-[40px] bg-card border-border hover:shadow-2xl transition-all group relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-muted group-hover:bg-primary transition-colors" />
                 
                 <div className="flex justify-between items-start mb-8">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                      auto.isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : "bg-muted text-muted-foreground"
                    )}>
                       <Zap className={cn("w-6 h-6", auto.isActive && "fill-primary-foreground")} />
                    </div>
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest bg-muted border-transparent">
                       {auto.stepsCount} Nodes
                    </Badge>
                 </div>

                 <div className="space-y-2 mb-8">
                    <h3 className="text-xl font-black tracking-tight">{auto.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                       {auto.description}
                    </p>
                 </div>

                 <div className="space-y-4 mb-10">
                    <div className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border border-border">
                       <div className="flex items-center gap-3">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trigger</span>
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-widest">{auto.trigger}</span>
                    </div>
                    <div className="flex items-center justify-between px-2">
                       <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Last Run: {auto.lastRun}</span>
                       <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 font-bold">{auto.successRate} Efficiency</span>
                    </div>
                 </div>

                 <div className="flex items-center gap-3">
                    <Button 
                      onClick={() => toggleAutomation(auto.id)}
                      variant={auto.isActive ? "destructive" : "default"}
                      className="flex-1 h-12 rounded-xl font-black uppercase text-[9px] tracking-widest gap-2"
                    >
                       {auto.isActive ? <><Pause className="w-3.5 h-3.5" /> Suspend Agent</> : <><Play className="w-3.5 h-3.5" /> Deploy Agent</>}
                    </Button>
                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl hover:bg-muted border border-border">
                       <Settings2 className="w-4 h-4" />
                    </Button>
                 </div>
              </Card>
           </motion.div>
         ))}

         {/* Empty / Build New Card */}
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.3 }}
           className="border-2 border-dashed border-border rounded-[40px] flex flex-col items-center justify-center p-12 group cursor-pointer hover:border-primary/50 transition-all hover:bg-muted/20"
         >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Connect Custom Hub</p>
         </motion.div>
      </div>

      {/* Workflow Visualization Section */}
      <Card className="p-16 rounded-[48px] bg-black text-white relative overflow-hidden">
         <div className="absolute inset-0 technical-grid opacity-10" />
         <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 space-y-10">
               <div>
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase font-display italic leading-none mb-6">Autonomous Architecture</h2>
                  <p className="text-white/50 text-sm max-w-md leading-relaxed font-medium">
                     SignalForge agents utilize a recursive neural network to analyze market signals and repurpose content with 100% brand voice fidelity.
                  </p>
               </div>
               
               <div className="flex items-center gap-6">
                  <div className="flex -space-x-4">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-zinc-800 flex items-center justify-center overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" />
                       </div>
                     ))}
                  </div>
                  <p className="text-xs font-bold text-white/70 italic">
                    Joined by 42+ active autonomous nodes.
                  </p>
               </div>
            </div>

            <div className="flex-1 w-full max-w-2xl bg-white/5 rounded-[40px] border border-white/10 p-10 relative">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 opacity-40">Active Pipeline: TREND_FORGE_01</h4>
               <div className="space-y-6">
                  {[
                    { label: 'Scrape Pulse', icon: Globe, status: 'complete' },
                    { label: 'Neural Alignment', icon: ShieldCheck, status: 'active' },
                    { label: 'Asset Synthesis', icon: Zap, status: 'pending' },
                    { label: 'Human Verification', icon: Clock, status: 'pending' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-6 relative">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center z-10",
                         step.status === 'complete' ? "bg-emerald-500 text-white" : step.status === 'active' ? "bg-primary text-primary-foreground animate-pulse" : "bg-zinc-800 text-zinc-500"
                       )}>
                          <step.icon className="w-5 h-5" />
                       </div>
                       <div className="flex-1 flex items-center justify-between">
                          <span className={cn("text-sm font-black italic uppercase tracking-tight", step.status === 'pending' && "opacity-30")}>{step.label}</span>
                          {step.status === 'complete' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {step.status === 'active' && <div className="text-[8px] font-black px-2 py-1 bg-white/10 rounded uppercase tracking-widest">Processing</div>}
                       </div>
                       {i < 3 && <div className="absolute left-6 top-10 w-[2px] h-10 bg-zinc-800" />}
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </Card>
    </div>
  );
}
