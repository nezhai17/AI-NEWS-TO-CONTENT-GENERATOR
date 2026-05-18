import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  Users, 
  Search,
  ArrowUpRight,
  Filter,
  Download,
  Globe,
  MessageSquare,
  Sparkles,
  Shield,
  Activity,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { db } from '@/lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';

const engagementData = [
  { name: 'Jan', reach: 4500, engagement: 2400, growth: 240 },
  { name: 'Feb', reach: 5200, engagement: 3100, growth: 310 },
  { name: 'Mar', reach: 6100, engagement: 4200, growth: 420 },
  { name: 'Apr', reach: 5800, engagement: 3800, growth: 380 },
  { name: 'May', reach: 7200, engagement: 5100, growth: 510 },
  { name: 'Jun', reach: 8500, engagement: 6200, growth: 620 },
];

const platformDistribution = [
  { name: 'LinkedIn', value: 45, color: 'var(--color-primary)' },
  { name: 'Twitter/X', value: 30, color: '#FF5C00' },
  { name: 'Instagram', value: 15, color: '#ec4899' },
  { name: 'Tiktok', value: 10, color: '#06b6d4' },
];

const activityNodes = [
  { id: 1, type: 'forge', platform: 'LinkedIn', impact: 94, time: '2m ago' },
  { id: 2, type: 'sync', platform: 'Twitter', impact: 82, time: '14m ago' },
  { id: 3, type: 'refine', platform: 'Instagram', impact: 91, time: '1h ago' },
];

export default function Analytics() {
  const { currentWorkspace, trends } = useStore();
  const { user } = useAuth();
  const [counts, setCounts] = useState({ campaigns: 0, projects: 0, members: 0 });

  useEffect(() => {
    async function fetchCounts() {
      if (!currentWorkspace) return;
      try {
        const [campSnap, projSnap, memSnap] = await Promise.all([
          getDocs(collection(db, `workspaces/${currentWorkspace.id}/campaigns`)),
          getDocs(collection(db, `workspaces/${currentWorkspace.id}/projects`)),
          getDocs(collection(db, `workspaces/${currentWorkspace.id}/members`))
        ]);
        setCounts({
          campaigns: campSnap.size,
          projects: projSnap.size,
          members: memSnap.size
        });
      } catch (e) {
        console.error("Analytics fetch failed:", e);
      }
    }
    fetchCounts();
  }, [currentWorkspace]);

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      <div className="p-10 max-w-[1600px] mx-auto space-y-12 pb-40">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-border pb-12">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                <Activity className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Neural Telemetry</span>
             </div>
             <h1 className="text-6xl font-black tracking-tighter uppercase italic font-display leading-none">
               Intelligence <span className="text-transparent outline-primary" style={{ WebkitTextStroke: '1px var(--color-primary)' }}>Command</span>
             </h1>
             <p className="text-muted-foreground font-medium text-lg max-w-2xl">Extracting multi-vector performance metrics from the workspace signal mesh.</p>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="outline" className="h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-card gap-3 border-border hover:bg-muted shadow-sm transition-all">
                <Filter className="w-4 h-4" />
                Filter Matrix
             </Button>
             <Button className="h-14 px-10 bg-primary text-primary-foreground rounded-2xl shadow-2xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest gap-3 hover:scale-105 active:scale-95 transition-all">
                <Download className="w-4 h-4" />
                Export Telemetry
             </Button>
          </div>
        </div>

        {/* Global Insight Banner */}
        {trends && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-primary/5 border border-primary/10 rounded-[32px] flex items-center gap-6"
          >
            <Sparkles className="w-6 h-6 text-primary shrink-0" />
            <p className="text-xs font-medium leading-relaxed italic">
              <span className="font-black uppercase tracking-widest text-[10px] mr-3 not-italic">Market Vector:</span>
              {trends}
            </p>
          </motion.div>
        )}

        {/* Top Tier Stats - Dynamic Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: 'Asset Units', value: counts.projects, trend: '+14.2%', icon: Users, color: 'primary' },
             { label: 'Active Campaigns', value: counts.campaigns, trend: '+8.4%', icon: TrendingUp, color: 'emerald-500' },
             { label: 'Node Members', value: counts.members, trend: '+0.5%', icon: Shield, color: 'blue-500' },
             { label: 'Sync Efficiency', value: '94.8%', trend: '+12.1%', icon: Zap, color: 'orange-500' },
           ].map((stat, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-card p-10 rounded-[40px] border border-border relative overflow-hidden group hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all"
             >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all">
                  <stat.icon className="w-20 h-20" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                   <div className={cn("w-2 h-2 rounded-full", `bg-${stat.color}`)} />
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                </div>
                <div className="flex items-end justify-between relative z-10">
                   <h2 className="text-5xl font-black tracking-tighter font-mono">{stat.value}</h2>
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">{stat.trend}</span>
                      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 w-[100%]" />
                      </div>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Main Visualization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Primary Area Chart */}
           <Card className="lg:col-span-2 rounded-[50px] border-border bg-card overflow-hidden p-12 shadow-sm">
              <CardHeader className="px-0 pt-0 pb-12">
                 <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl font-black uppercase tracking-tighter italic font-display">Reach Pulse Visualization</h4>
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] mt-2">Temporal growth vector v5.2</p>
                    </div>
                    <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
                       <Button size="sm" variant="ghost" className="h-8 rounded-lg text-[9px] font-black uppercase bg-card shadow-sm">6-Months</Button>
                       <Button size="sm" variant="ghost" className="h-8 rounded-lg text-[9px] font-black uppercase">1-Year</Button>
                    </div>
                 </div>
              </CardHeader>
              <div className="h-[450px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engagementData}>
                       <defs>
                          <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                       <XAxis 
                         dataKey="name" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fill: '#999', fontWeight: 900 }} 
                         dy={20} 
                       />
                       <YAxis 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fill: '#999', fontWeight: 900 }} 
                       />
                       <Tooltip 
                         contentStyle={{ 
                           borderRadius: '24px', 
                           border: '1px solid var(--color-border)', 
                           backgroundColor: 'var(--color-card)',
                           boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                           textTransform: 'uppercase', 
                           fontSize: '10px', 
                           fontWeight: 900,
                           padding: '20px'
                         }}
                         cursor={{ stroke: 'var(--color-primary)', strokeWidth: 2, strokeDasharray: '5 5' }}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="reach" 
                         stroke="var(--color-primary)" 
                         strokeWidth={4} 
                         fillOpacity={1} 
                         fill="url(#colorReach)" 
                       />
                       <Area 
                         type="monotone" 
                         dataKey="engagement" 
                         stroke="#FF5C00" 
                         strokeWidth={4} 
                         strokeDasharray="10 10"
                         fill="transparent" 
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           {/* Distribution Pie */}
           <Card className="rounded-[50px] border-border bg-card overflow-hidden p-12 shadow-sm flex flex-col justify-between">
              <div>
                <CardHeader className="px-0 pt-0 pb-12">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-2xl font-black uppercase tracking-tighter italic font-display">Vector Sync %</h4>
                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] mt-2">Platform distribution mix</p>
                      </div>
                      <Globe className="w-5 h-5 text-primary" />
                   </div>
                </CardHeader>
                <div className="h-[280px] w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                            data={platformDistribution}
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                         >
                            {platformDistribution.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                         </Pie>
                         <Tooltip />
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-4xl font-black font-display italic">94</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Index Score</span>
                   </div>
                </div>
              </div>

              <div className="space-y-4 pt-10 border-t border-border">
                 {platformDistribution.map((p, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                         <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{p.name}</span>
                      </div>
                      <span className="text-sm font-black font-mono italic">{p.value}%</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>

        {/* Intelligence Activity Node Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
           <div className="lg:col-span-1 space-y-8">
              <div className="bg-primary text-primary-foreground p-10 rounded-[50px] shadow-2xl shadow-primary/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:scale-125 transition-transform duration-700" />
                 <Layers className="w-10 h-10 mb-8 relative z-10" />
                 <h4 className="text-2xl font-black uppercase font-display italic mb-4 relative z-10 leading-tight">Impact Projection</h4>
                 <p className="text-primary-foreground/70 font-medium text-sm leading-relaxed mb-8 relative z-10">
                   Proprietary neural analysis projections for next quarter targets based on synthetic data clusters.
                 </p>
                 <div className="flex items-center justify-between relative z-10">
                    <span className="text-4xl font-black font-mono">+148%</span>
                    <ArrowUpRight className="w-8 h-8 opacity-50" />
                 </div>
              </div>
              
              <div className="bg-card border border-border p-10 rounded-[50px] shadow-sm relative group overflow-hidden">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                       <Zap className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Growth Engine</span>
                 </div>
                 <h4 className="text-lg font-black uppercase font-display mb-2 italic">Optimal Frequency</h4>
                 <p className="text-muted-foreground text-xs leading-relaxed font-medium">Current data suggests increasing forge frequency by 1.4x for peak resonance.</p>
              </div>
           </div>

           <div className="lg:col-span-3">
              <Card className="rounded-[50px] border-border bg-card overflow-hidden shadow-sm">
                 <div className="p-10 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                          <Activity className="w-6 h-6 text-primary" />
                       </div>
                       <div>
                          <h4 className="text-xl font-black uppercase tracking-tight italic font-display">Recent Activity Log</h4>
                          <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mt-1">Real-time sync telemetry</p>
                       </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2">
                       View History Matrix <ArrowUpRight className="w-4 h-4" />
                    </Button>
                 </div>
                 <div className="p-10">
                    <div className="space-y-6">
                       {activityNodes.map((node) => (
                         <div key={node.id} className="flex items-center justify-between p-6 bg-muted/30 rounded-[32px] border border-transparent hover:border-border hover:bg-card transition-all group">
                            <div className="flex items-center gap-8">
                               <div className="w-14 h-14 bg-card rounded-2xl border border-border flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                                  {node.type === 'forge' ? <Zap className="w-6 h-6" /> : node.type === 'sync' ? <Globe className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                               </div>
                               <div>
                                  <div className="flex items-center gap-3 mb-1">
                                     <span className="text-xs font-black uppercase tracking-widest text-foreground">{node.platform} Asset {node.type}</span>
                                     <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase rounded-full">Automated</span>
                                  </div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{node.time}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-10">
                               <div className="text-right">
                                  <p className="text-xs font-black italic">{node.impact}% Impact</p>
                                  <div className="w-24 h-1 bg-muted rounded-full overflow-hidden mt-1.5">
                                     <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${node.impact}%` }}
                                       className="h-full bg-primary"
                                     />
                                  </div>
                               </div>
                               <Button variant="outline" size="sm" className="h-10 w-10 rounded-xl border-border bg-card shadow-sm hover:scale-110 active:scale-90 transition-transform">
                                  <Search className="w-4 h-4" />
                               </Button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </Card>
           </div>
        </div>

        {/* Global Strategy Matrix Section */}
        <div className="bg-black text-white rounded-[70px] p-20 overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />
           
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                 <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Autonomous Growth Engine</span>
                 </div>
                 <h2 className="text-7xl font-black tracking-tighter uppercase italic leading-[0.9] font-display italic-serif">
                   Impact <span className="text-transparent outline-white" style={{ WebkitTextStroke: '1px white' }}>Projection</span> v5.0
                 </h2>
                 <p className="text-white/60 font-medium text-xl max-w-xl leading-relaxed">
                   The SignalForge laboratory utilizes deep-spectrum neural analysis to forecast authority trajectory and content resonance across the global mesh.
                 </p>
                 <div className="flex flex-wrap gap-6 pt-4">
                    <Button className="h-16 px-12 bg-white text-black hover:bg-muted rounded-2xl shadow-2xl font-black uppercase tracking-[0.2em] text-[12px] transition-all hover:scale-105 active:scale-95">
                       Execute Global Strategy
                    </Button>
                    <Button variant="outline" className="h-16 px-10 bg-transparent border-white/20 text-white hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[11px]">
                       View Neural Maps
                    </Button>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                   { label: 'Semantic Authority', val: 94, trend: '+14%', color: 'var(--color-primary)' },
                   { label: 'Audience Gravity', val: 82, trend: '+8%', color: '#fb923c' },
                   { label: 'Content Coherence', val: 91, trend: '+22%', color: '#ec4899' },
                   { label: 'Platform Synergy', val: 88, trend: '+19%', color: '#06b6d4' }
                 ].map((m, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ opacity: 0, scale: 0.9 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.1 }}
                     className="bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-md group hover:bg-white/10 transition-all hover:-translate-y-2"
                   >
                     <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{m.label}</span>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                     </div>
                     <div className="flex items-end gap-3 mb-6">
                        <span className="text-4xl font-black font-mono leading-none">{m.val}%</span>
                        <span className="text-[10px] font-black text-emerald-400 pb-1">{m.trend}</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${m.val}%` }}
                          transition={{ duration: 1.5, delay: i * 0.2 }}
                          className="h-full"
                          style={{ backgroundColor: m.color }}
                        />
                     </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
