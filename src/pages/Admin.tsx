import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Database, 
  Zap, 
  Activity, 
  Users, 
  CreditCard, 
  Server,
  Terminal,
  Search,
  ArrowUpRight,
  Shield,
  Layers,
  Cpu,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { adminService } from '@/services/adminService';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await adminService.getPlatformStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      <div className="max-w-[1600px] mx-auto p-10 lg:p-20 pb-40 space-y-16">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-border pb-12">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-orange-500/10 rounded-full border border-orange-500/20 text-orange-500">
                <ShieldCheck className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Restricted Access Area</span>
             </div>
             <h1 className="text-6xl font-black tracking-tighter uppercase italic font-display leading-none">
               Kernel <span className="text-transparent outline-primary" style={{ WebkitTextStroke: '1px var(--color-primary)' }}>Terminal</span>
             </h1>
             <p className="text-muted-foreground font-medium text-lg max-w-2xl">High-level administrative override and system cluster health monitoring for the SignalForge mesh.</p>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="outline" className="h-16 px-10 rounded-2xl font-black uppercase text-[11px] tracking-widest bg-card border-border gap-3 shadow-sm transition-all hover:bg-muted">
                <Terminal className="w-5 h-5 opacity-50" />
                System Console
             </Button>
          </div>
        </div>

        {/* Admin Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
           {/* System Health */}
           <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Neural Latency', val: stats?.latency || '42ms', status: 'Stable', icon: Activity, color: 'emerald-500' },
                { label: 'Active Shards', val: stats?.totalWorkspaces || '...', status: 'Optimal', icon: Zap, color: 'orange-500' },
                { label: 'Global Nodes', val: stats?.totalUsers || '...', status: 'Online', icon: Shield, color: 'primary' },
              ].map((m, i) => (
                <div key={i} className="bg-card p-10 rounded-[40px] border border-border shadow-sm group">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">{m.label}</p>
                   {isLoading ? (
                     <div className="flex items-center gap-2">
                       <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                       <span className="text-lg font-black italic uppercase">Syncing...</span>
                     </div>
                   ) : (
                     <div className="flex items-end justify-between">
                        <h2 className="text-4xl font-black font-display italic tracking-tighter">{m.val}</h2>
                        <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase", `bg-${m.color}/10 text-${m.color}`)}>
                           {m.status}
                        </div>
                     </div>
                   )}
                </div>
              ))}

              <Card className="md:col-span-3 rounded-[50px] border-border bg-card overflow-hidden shadow-sm p-12">
                 <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center">
                          <Cpu className="w-7 h-7 text-primary" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black uppercase font-display italic leading-tight">Cluster Node Distribution</h3>
                          <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mt-1">Resource allocation across shards</p>
                       </div>
                    </div>
                    <Button variant="ghost" className="h-10 text-[9px] font-black uppercase tracking-widest gap-2">
                       Full Node List <ArrowUpRight className="w-4 h-4" />
                    </Button>
                 </div>
                 
                 <div className="space-y-8">
                    {[
                       { name: 'Primary Neural North', load: '84%', shards: 12, health: 'Peak' },
                       { name: 'Secondary Sync East', load: '12%', shards: 4, health: 'Idle' },
                       { name: 'Deep Media West', load: '92%', shards: 24, health: 'Critical Load' },
                    ].map((node, i) => (
                       <div key={i} className="flex items-center justify-between p-8 bg-muted/20 rounded-[32px] border border-transparent hover:border-border transition-all">
                          <div className="flex items-center gap-8">
                             <span className="text-sm font-black font-mono text-muted-foreground">0{i+1}</span>
                             <div>
                                <h4 className="text-sm font-black uppercase tracking-widest">{node.name}</h4>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">{node.shards} active shards</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-16">
                             <div className="w-40 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-1000" style={{ width: node.load }} />
                             </div>
                             <div className="text-right w-24">
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest",
                                  node.health === 'Peak' ? "text-emerald-500" : node.health === 'Idle' ? "text-muted-foreground" : "text-orange-500"
                                )}>{node.health}</span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </Card>
           </div>

           {/* Admin Controls Toolbelt */}
           <div className="lg:col-span-1 space-y-8">
              <div className="bg-black text-white p-10 rounded-[50px] shadow-2xl shadow-black/20 space-y-10 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl group-hover:scale-125 transition-transform duration-700" />
                 <h4 className="text-xl font-black uppercase font-display italic relative z-10">Global Access</h4>
                 <div className="space-y-4 relative z-10">
                    {[
                       { label: 'Maintenance Mode', active: false },
                       { label: 'API Surge Protection', active: true },
                       { label: 'Neural Overdrive', active: true },
                       { label: 'Public Indexing', active: false },
                    ].map((btn, i) => (
                       <button key={i} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-left">
                          <span className="text-[10px] font-black uppercase tracking-widest">{btn.label}</span>
                          <div className={cn("w-2 h-2 rounded-full", btn.active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-white/10")} />
                       </button>
                    ))}
                 </div>
              </div>

              <div className="p-10 border border-border rounded-[50px] space-y-8 h-full bg-card shadow-sm">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin Quick Actions</h4>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                       { label: 'Purge', icon: Layers },
                       { label: 'Sync', icon: Activity },
                       { label: 'Users', icon: Users },
                       { label: 'Billing', icon: CreditCard },
                       { label: 'DB', icon: Database },
                       { label: 'Legal', icon: Shield },
                    ].map((act, i) => (
                       <button key={i} className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-3xl border border-transparent hover:border-primary/20 hover:bg-card transition-all group">
                          <act.icon className="w-5 h-5 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{act.label}</span>
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Global System Stats Area Chart */}
        <div className="bg-primary text-primary-foreground rounded-[70px] p-20 relative overflow-hidden group shadow-2xl shadow-primary/20">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                 <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                    <Server className="w-4 h-4 text-white" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Master Node Status: 99.2% Efficient</span>
                 </div>
                 <h2 className="text-6xl font-black tracking-tighter uppercase italic leading-[0.9] font-display italic-serif">
                   System <span className="text-transparent outline-white" style={{ WebkitTextStroke: '1px white' }}>Dominance</span> v9
                 </h2>
                 <p className="text-white/60 font-medium text-lg max-w-xl leading-relaxed">
                   Currently analyzing 248,302 content signals across 1,402 active shards. Global resonance is within target parameters.
                 </p>
                 <Button className="h-16 px-12 bg-white text-black hover:bg-muted rounded-2xl shadow-2xl font-black uppercase tracking-[0.2em] text-[12px] transition-all hover:scale-105 active:scale-95">
                    Open Advanced Console
                 </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                 {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="aspect-square bg-card/20 rounded-3xl border border-white/10 backdrop-blur-md flex flex-col items-center justify-center gap-2 group hover:bg-card/30 transition-all">
                       <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Shard 0{i}</span>
                       <span className="text-2xl font-black italic font-mono">{90 + i}%</span>
                       <div className="w-8 h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: '80%' }}
                            className="h-full bg-white shadow-[0_0_8px_white]"
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
        {/* Strategic Roadmap (TASK 10) */}
        <div className="space-y-12">
           <div className="flex items-center gap-4">
              <div className="w-1.5 h-10 bg-primary rounded-full" />
              <h3 className="text-4xl font-black italic tracking-tighter uppercase font-display italic">Strategic Roadmap v1.0</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {[
                { week: 1, theme: 'Infrastructure & Sharding', items: ['Neural Cluster Stabilization', 'Auth Mesh Hardening', 'Multi-tenant logic'] },
                { week: 2, theme: 'Neural Core Expansion', items: ['Parallel Agent (MAPO) Hub', 'Cross-Platform Trend Injection', 'Voice Cloning Engine'] },
                { week: 3, theme: 'Omnichannel Auto-Pub', items: ['Native API Bridging', 'Recursive Repurposing', 'Analytics Webhooks'] },
                { week: 4, theme: 'Enterprise Provisioning', items: ['Titanium Tier Handover', 'White-label Output Mesh', 'Global CDN Scale'] }
              ].map((step, i) => (
                <Card key={i} className="p-10 rounded-[40px] bg-card border-border hover:border-primary/50 transition-all group overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-8 text-6xl font-black italic opacity-5 group-hover:opacity-10 transition-opacity">0{step.week}</div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Phase {step.week}</p>
                   <h4 className="text-xl font-black tracking-tight mb-8 leading-tight">{step.theme}</h4>
                   <div className="space-y-4">
                      {step.items.map((item, j) => (
                        <div key={j} className="flex items-start gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                           <span className="text-xs font-bold text-muted-foreground leading-relaxed">{item}</span>
                        </div>
                      ))}
                   </div>
                </Card>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
