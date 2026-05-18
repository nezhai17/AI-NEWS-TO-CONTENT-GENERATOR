import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Bot, 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Zap, 
  Link2,
  CheckCircle2,
  Plus,
  Clock,
  Sparkles,
  Search,
  ChevronRight,
  Fingerprint,
  HardDrive,
  Network,
  Activity,
  Globe,
  Layers,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SettingsTab = 'profile' | 'voice' | 'workspaces' | 'integrations' | 'security' | 'notifications';

import { useStore } from '@/store/useStore';
import { workspaceService } from '@/lib/workspaceService';

export default function Settings() {
  const { user } = useAuth();
  const { currentWorkspace, workspaces, setWorkspaces, setCurrentWorkspace } = useStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    brandVoice: '',
    onboardingComplete: true,
    email: '',
    company: '',
    role: ''
  });

  useEffect(() => {
    async function loadSettings() {
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        setProfile(prev => ({ ...prev, ...snap.data(), email: user.email || '' }));
      }
      setLoading(false);
    }
    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
      toast.success('Neural configuration synchronized');
    } catch (e) {
      toast.error('Failed to sync master configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center border border-border">
          <Zap className="w-8 h-8 animate-pulse text-foreground" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Accessing Logic Gates...</p>
      </div>
    );
  }

  const tabs: { id: SettingsTab; label: string; icon: any; description: string }[] = [
    { id: 'profile', label: 'Persona Identity', icon: User, description: 'Core operator credentials and identity parameters.' },
    { id: 'voice', label: 'Brand Logic', icon: Bot, description: 'Neural training data for content resonance.' },
    { id: 'workspaces', label: 'Neural Clusters', icon: Layers, description: 'Manage and coordinate your signal workspaces.' },
    { id: 'integrations', label: 'Global Nodes', icon: Link2, description: 'API synchronization and platform connectivity.' },
    { id: 'security', label: 'Encryption', icon: Shield, description: 'Protocol security and access verification.' },
    { id: 'notifications', label: 'Neural Alerts', icon: Bell, description: 'Signal monitoring and status reports.' },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      <div className="max-w-[1600px] mx-auto p-10 lg:p-20 pb-40 space-y-16">
         
         {/* Header */}
         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-border pb-12">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                  <Fingerprint className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">System Config v4.0</span>
               </div>
               <h1 className="text-6xl font-black tracking-tighter uppercase italic font-display leading-none">
                 Logic <span className="text-transparent outline-primary" style={{ WebkitTextStroke: '1px var(--color-primary)' }}>Architecture</span>
               </h1>
               <p className="text-muted-foreground font-medium text-lg max-w-2xl">Refining your digital presence and neural content parameters for maximum signal resonance.</p>
            </div>
            <div className="flex items-center gap-4">
               <Button 
                onClick={handleSave} 
                disabled={saving}
                className="h-16 px-10 bg-primary text-primary-foreground rounded-2xl shadow-2xl shadow-primary/20 font-black uppercase text-[11px] tracking-[0.2em] gap-3 hover:scale-105 active:scale-95 transition-all"
               >
                  {saving ? <Clock className="w-4 h-4 animate-spin" /> : <Zap className="w-5 h-5 fill-primary-foreground" />}
                  Deploy Configuration
               </Button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 space-y-4">
               {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full group flex items-center gap-5 p-6 rounded-[32px] transition-all text-left relative overflow-hidden",
                      activeTab === tab.id 
                        ? "bg-card border border-border shadow-2xl shadow-black/5" 
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                     <div className={cn(
                       "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                       activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-card border border-border group-hover:border-primary/20"
                     )}>
                        <tab.icon className="w-6 h-6" />
                     </div>
                     <div className="flex-1">
                        <span className="text-[11px] font-black uppercase tracking-widest block mb-1">{tab.label}</span>
                        <p className="text-[9px] font-medium opacity-60 leading-tight uppercase tracking-tight">{tab.id === activeTab ? tab.description : ''}</p>
                     </div>
                     {activeTab === tab.id && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                           <ChevronRight className="w-4 h-4 opacity-30" />
                        </div>
                     )}
                  </button>
               ))}

               <div className="mt-12 p-10 bg-black text-white rounded-[40px] shadow-2xl shadow-black/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <HardDrive className="w-8 h-8 mb-6 text-primary" />
                  <h4 className="text-xl font-black uppercase font-display italic mb-3">Storage Allocation</h4>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-6">Forge Cloud v9.2</p>
                  <div className="space-y-3">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span>Used Signal</span>
                        <span>4.2 GB / 10 GB</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '42%' }}
                          className="h-full bg-primary"
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
               <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                     {activeTab === 'profile' && (
                        <div className="space-y-10">
                           <Card className="p-12 rounded-[50px] border-border bg-card shadow-sm space-y-12">
                              <div className="flex items-center gap-6">
                                 <div className="w-24 h-24 bg-muted rounded-[32px] border border-border flex items-center justify-center text-muted-foreground relative group overflow-hidden">
                                    <User className="w-10 h-10 group-hover:scale-110 transition-transform" />
                                    <button className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[8px] font-black uppercase tracking-widest">
                                       Modify Meta
                                    </button>
                                 </div>
                                 <div>
                                    <h3 className="text-2xl font-black uppercase font-display italic">Operator Identity</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Primary access credentials</p>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-border">
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground">Identifier Name</label>
                                    <Input 
                                      value={profile.name}
                                      onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                                      className="h-14 rounded-2xl bg-muted/30 border-border font-medium focus-visible:ring-primary" 
                                    />
                                 </div>
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground">Email Signal</label>
                                    <Input 
                                      disabled
                                      value={profile.email}
                                      className="h-14 rounded-2xl bg-muted/10 border-border font-medium opacity-50 italic" 
                                    />
                                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">Immutable system identifier</p>
                                 </div>
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground">Corporation / Agency</label>
                                    <Input 
                                      value={profile.company}
                                      onChange={(e) => setProfile(p => ({ ...p, company: e.target.value }))}
                                      placeholder="Forge Global"
                                      className="h-14 rounded-2xl bg-muted/30 border-border font-medium focus-visible:ring-primary" 
                                    />
                                 </div>
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground">Tactical Role</label>
                                    <Input 
                                      value={profile.role}
                                      onChange={(e) => setProfile(p => ({ ...p, role: e.target.value }))}
                                      placeholder="Growth Lead"
                                      className="h-14 rounded-2xl bg-muted/30 border-border font-medium focus-visible:ring-primary" 
                                    />
                                 </div>
                              </div>
                           </Card>
                        </div>
                     )}

                     {activeTab === 'voice' && (
                        <div className="space-y-10">
                           <Card className="p-12 rounded-[50px] border-border bg-card shadow-sm space-y-10">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                       <Bot className="w-7 h-7" />
                                    </div>
                                    <div>
                                       <h3 className="text-2xl font-black uppercase font-display italic">Master Brand Logic</h3>
                                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Neural content resonance parameters</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground border border-border">
                                       <Sparkles className="w-5 h-5" />
                                    </div>
                                 </div>
                              </div>

                              <div className="p-8 bg-black text-white rounded-3xl space-y-4">
                                 <div className="flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">AI Trainer Tip</span>
                                 </div>
                                 <p className="text-sm font-medium leading-relaxed opacity-80 italic">"The brand voice acts as the semantic filter for all generated assets. Be as specific as possible about tone, cadence, and restricted lexicon."</p>
                              </div>

                              <div className="space-y-4">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-foreground px-4 flex items-center gap-3">
                                    <Activity className="w-4 h-4" />
                                    Dynamic Brand Essence
                                 </label>
                                 <Textarea 
                                   value={profile.brandVoice}
                                   onChange={(e) => setProfile(p => ({ ...p, brandVoice: e.target.value }))}
                                   placeholder="Our brand is high-tech, minimalist, and focused on brutal efficiency. We use short sentences, technical jargon, and avoid corporate fluff..."
                                   className="min-h-[300px] rounded-[40px] bg-muted/30 border-border hover:border-primary/20 focus-visible:ring-primary p-12 font-medium text-lg resize-none leading-relaxed" 
                                 />
                                 <div className="flex items-center justify-between px-6 pt-4">
                                    <div className="flex items-center gap-4">
                                       <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Neural Matrix Active</span>
                                       </div>
                                    </div>
                                    <span className="text-[10px] font-mono text-muted-foreground">{profile.brandVoice.length} Signals Captured</span>
                                 </div>
                              </div>
                           </Card>
                        </div>
                     )}

                     {activeTab === 'workspaces' && (
                        <div className="space-y-10">
                           <Card className="p-12 rounded-[50px] border-border bg-card shadow-sm space-y-12">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                       <Layers className="w-7 h-7" />
                                    </div>
                                    <div>
                                       <h3 className="text-2xl font-black uppercase font-display italic">Neural Clusters</h3>
                                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Manage your operational workspaces</p>
                                    </div>
                                 </div>
                                 <Button 
                                   onClick={async () => {
                                     if (!user) return;
                                     const name = prompt('Enter cluster designation:');
                                     if (name) {
                                       try {
                                         const wsId = await workspaceService.createWorkspace(user.uid, name);
                                         toast.success('Neural cluster expansion complete');
                                       } catch (e) {
                                         toast.error('Expansion protocol failed');
                                       }
                                     }
                                   }}
                                   className="h-14 px-8 bg-primary text-primary-foreground rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-primary/20"
                                 >
                                    <Plus className="w-4 h-4" /> Initialize New Cluster
                                 </Button>
                              </div>

                              <div className="grid grid-cols-1 gap-6">
                                 {workspaces.map((ws) => (
                                    <div key={ws.id} className={cn(
                                      "p-8 rounded-[32px] border transition-all flex items-center justify-between group",
                                      currentWorkspace?.id === ws.id ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-transparent hover:border-border"
                                    )}>
                                       <div className="flex items-center gap-6">
                                          <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center font-display font-black italic",
                                            currentWorkspace?.id === ws.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"
                                          )}>
                                             {ws.name[0].toUpperCase()}
                                          </div>
                                          <div>
                                             <h4 className="text-sm font-black uppercase tracking-tight">{ws.name}</h4>
                                             <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                                               {ws.ownerId === user?.uid ? 'Master Access' : 'Collaborator Access'}
                                             </p>
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-4">
                                          {currentWorkspace?.id !== ws.id && (
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              onClick={() => setCurrentWorkspace(ws)}
                                              className="h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest bg-card"
                                            >
                                              Switch To Node
                                            </Button>
                                          )}
                                          <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:bg-muted rounded-xl">
                                             <SettingsIcon className="w-4 h-4" />
                                          </Button>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </Card>
                        </div>
                     )}

                     {activeTab === 'integrations' && (
                        <div className="space-y-10">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <Card className="p-10 rounded-[50px] border-border bg-card shadow-sm col-span-2">
                                 <div className="flex items-center justify-between mb-12">
                                    <div>
                                       <h3 className="text-2xl font-black uppercase font-display italic">Global Signal Nodes</h3>
                                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Active platform synchronization</p>
                                    </div>
                                    <Button variant="outline" className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 bg-background border-border shadow-sm">
                                       <Plus className="w-4 h-4" /> Initialize New Node
                                    </Button>
                                 </div>

                                 <div className="space-y-4">
                                    {[
                                       { name: 'LinkedIn Professional API', status: 'Active', icon: Globe, usage: '84%', color: 'primary' },
                                       { name: 'X / Twitter Developer Cluster', status: 'Active', icon: Network, usage: '12%', color: 'orange-500' },
                                       { name: 'Meta Intelligence Hub', status: 'Disconnected', icon: Layers, usage: '0%', color: 'muted-foreground' },
                                       { name: 'TikTok Script Engine', status: 'Pending Verification', icon: Zap, usage: '0%', color: 'blue-500' },
                                    ].map((node, i) => (
                                       <div key={i} className="flex items-center justify-between p-8 bg-muted/30 rounded-[32px] border border-transparent hover:border-border transition-all group">
                                          <div className="flex items-center gap-6">
                                             <div className={cn(
                                               "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                               node.status === 'Active' ? "bg-card text-foreground" : "bg-muted/50 text-muted-foreground opacity-50"
                                             )}>
                                                <node.icon className="w-6 h-6" />
                                             </div>
                                             <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                   <span className="text-sm font-black uppercase tracking-widest">{node.name}</span>
                                                   {node.status === 'Active' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                   <span className={cn("text-[9px] font-black uppercase tracking-widest", node.status === 'Active' ? "text-emerald-500" : "text-muted-foreground")}>{node.status}</span>
                                                   {node.status === 'Active' && (
                                                      <div className="flex items-center gap-2">
                                                         <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Sync Load:</span>
                                                         <span className="text-[9px] font-black uppercase tracking-widest text-primary">{node.usage}</span>
                                                      </div>
                                                   )}
                                                </div>
                                             </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                             <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl text-[9px] font-black uppercase border-border hover:bg-card">Configure</Button>
                                             {node.status !== 'Active' ? (
                                                <Button size="sm" className="h-10 px-4 rounded-xl text-[9px] font-black uppercase bg-primary text-primary-foreground shadow-xl shadow-primary/10">Authorize</Button>
                                             ) : (
                                                <Button variant="ghost" size="sm" className="h-10 w-10 text-destructive hover:bg-destructive/5 rounded-xl">
                                                   <Zap className="w-4 h-4 rotate-180" />
                                                </Button>
                                             )}
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </Card>
                           </div>
                        </div>
                     )}

                     {activeTab === 'security' && (
                        <div className="space-y-10">
                           <Card className="p-12 rounded-[50px] border-border bg-card shadow-sm space-y-12">
                              <div className="flex items-center gap-5">
                                 <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                                    <Shield className="w-7 h-7" />
                                 </div>
                                 <div>
                                    <h3 className="text-2xl font-black uppercase font-display italic">Protocol Security</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Operator verification and encryption</p>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 gap-8">
                                 <div className="p-10 border border-border rounded-[40px] flex items-center justify-between group hover:bg-muted/30 transition-all">
                                    <div className="flex items-center gap-6">
                                       <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                                          <Lock className="w-6 h-6" />
                                       </div>
                                       <div>
                                          <h4 className="text-sm font-black uppercase tracking-widest mb-1">Two-Factor Authentication</h4>
                                          <p className="text-xs text-muted-foreground font-medium">Add an extra layer of biometric verification to your protocol.</p>
                                       </div>
                                    </div>
                                    <Button className="h-10 rounded-xl px-6 font-black uppercase text-[10px] tracking-widest bg-black text-white">Enable 2FA</Button>
                                 </div>

                                 <div className="p-10 border border-border rounded-[40px] flex items-center justify-between group hover:bg-muted/30 transition-all">
                                    <div className="flex items-center gap-6">
                                       <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                                          <Shield className="w-6 h-6" />
                                       </div>
                                       <div>
                                          <h4 className="text-sm font-black uppercase tracking-widest mb-1">Active Security Log</h4>
                                          <p className="text-xs text-muted-foreground font-medium">Monitor all successful and failed synchronization attempts.</p>
                                       </div>
                                    </div>
                                    <Button variant="outline" className="h-10 rounded-xl px-6 font-black uppercase text-[10px] tracking-widest border-border">View Audit Trail</Button>
                                 </div>
                              </div>
                           </Card>
                        </div>
                     )}

                     {activeTab === 'notifications' && (
                        <div className="space-y-10">
                           <Card className="p-12 rounded-[50px] border-border bg-card shadow-sm space-y-12">
                              <div className="flex items-center gap-5">
                                 <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                    <Bell className="w-7 h-7" />
                                 </div>
                                 <div className="flex-1">
                                    <h3 className="text-2xl font-black uppercase font-display italic">Neural Alerts</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Manage signal monitoring frequency</p>
                                 </div>
                              </div>

                              <div className="space-y-4">
                                 {[
                                    { label: 'Asset Synthesis Complete', desc: 'Receive alert when high-fidelity assets are forged.', default: true },
                                    { label: 'Strategic Opportunity', desc: 'Alert when market signal resonance hits peak thresholds.', default: true },
                                    { label: 'Sync Status Reports', desc: 'Weekly summary of all global signal activity.', default: false },
                                    { label: 'Security Breaches', desc: 'Critical alerts for any unauthorized neural access.', default: true },
                                 ].map((notif, i) => (
                                    <div key={i} className="flex items-center justify-between p-8 bg-muted/30 rounded-[32px] border border-transparent hover:border-border transition-all">
                                       <div className="flex-1 pr-10">
                                          <h4 className="text-sm font-black uppercase tracking-widest mb-1">{notif.label}</h4>
                                          <p className="text-xs text-muted-foreground font-medium">{notif.desc}</p>
                                       </div>
                                       <div className="h-8 w-14 bg-muted rounded-full relative p-1 cursor-pointer group">
                                          <motion.div 
                                            animate={{ x: notif.default ? '100%' : '0%' }}
                                            className={cn(
                                              "h-6 w-6 rounded-full shadow-sm transition-colors",
                                              notif.default ? "bg-primary translate-x-1" : "bg-muted-foreground/30"
                                            )}
                                          />
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </Card>

                        </div>
                     )}
                  </motion.div>
               </AnimatePresence>
            </div>
         </div>
      </div>
    </div>
  );
}
