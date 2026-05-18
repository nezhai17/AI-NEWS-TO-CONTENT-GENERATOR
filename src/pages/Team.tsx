import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Mail, 
  Shield, 
  Zap, 
  Search,
  MoreVertical,
  ArrowUpRight,
  UserPlus,
  Network,
  Activity,
  Globe,
  Settings,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useStore } from '@/store/useStore';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Invited';
  lastActive: string;
}

export default function Team() {
  const { currentWorkspace } = useStore();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (!currentWorkspace) return;
    const q = query(collection(db, `workspaces/${currentWorkspace.id}/members`));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() } as TeamMember)));
    }, (err) => {
      console.warn("Team node sync inhibited:", err.message);
    });
    return () => unsubscribe();
  }, [currentWorkspace]);

  const filteredMembers = members.filter(m => 
    (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (m.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    
    // In a real app, this would send an email. 
    // Here we'll just add to the members subcollection.
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    
    try {
      await addDoc(collection(db, `workspaces/${currentWorkspace.id}/members`), {
        email,
        name: email.split('@')[0],
        role: 'Editor',
        status: 'Invited',
        lastActive: 'Never',
        invitedAt: new Date().toISOString()
      });
      
      toast.success('Intelligence invitation sent to node');
      setIsInviting(false);
    } catch (err) {
      toast.error('Failed to initialize invitation signal');
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      <div className="max-w-[1600px] mx-auto p-10 lg:p-20 pb-40 space-y-16">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-border pb-12">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                <Network className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Neural Network Workspace</span>
             </div>
             <h1 className="text-6xl font-black tracking-tighter uppercase italic font-display leading-none">
               Team <span className="text-transparent outline-primary" style={{ WebkitTextStroke: '1px var(--color-primary)' }}>Cohesion</span>
             </h1>
             <p className="text-muted-foreground font-medium text-lg max-w-2xl">Orchestrate your intelligence cluster with fine-grained protocol access and collaborative sync nodes.</p>
          </div>
          <div className="flex items-center gap-4">
             <Button 
               onClick={() => setIsInviting(true)}
               className="h-16 px-10 bg-primary text-primary-foreground rounded-2xl shadow-2xl shadow-primary/20 font-black uppercase text-[11px] tracking-[0.2em] gap-3 hover:scale-105 active:scale-95 transition-all"
             >
                <UserPlus className="w-5 h-5 fill-primary-foreground" />
                Invite Operator
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
           {/* Left: Stats & Context */}
           <div className="lg:col-span-1 space-y-8">
              <div className="bg-card p-10 rounded-[40px] border border-border shadow-sm group">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Active Node Capacity</p>
                 <div className="flex items-end justify-between mb-8">
                    <h2 className="text-5xl font-black font-display italic">3 <span className="text-2xl text-muted-foreground">/ 10</span></h2>
                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                       <Users className="w-6 h-6" />
                    </div>
                 </div>
                 <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '30%' }}
                      className="h-full bg-primary"
                    />
                 </div>
              </div>

              <div className="bg-black text-white p-10 rounded-[40px] shadow-2xl shadow-black/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl transition-transform duration-700 group-hover:scale-150" />
                 <Shield className="w-8 h-8 mb-6 text-primary" />
                 <h4 className="text-xl font-black uppercase font-display italic mb-3">Protocol Security</h4>
                 <p className="text-xs text-white/50 leading-relaxed font-medium">RBAC (Role Based Access Control) is active. Only admins can initialize global forge settings.</p>
              </div>

              <div className="p-8 border border-border rounded-[40px] space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quick Filter</h4>
                 <div className="space-y-2">
                    {['All Nodes', 'Admins', 'Editors', 'Invited'].map((f) => (
                      <button key={f} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted transition-all text-left">
                         <span className="text-[11px] font-black uppercase tracking-widest">{f}</span>
                         <ArrowUpRight className="w-3 h-3 opacity-30" />
                      </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right: Members List */}
           <div className="lg:col-span-3 space-y-8">
              <Card className="rounded-[50px] border-border bg-card overflow-hidden shadow-sm">
                 <div className="p-10 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                          <Activity className="w-6 h-6 text-primary" />
                       </div>
                       <div>
                          <h4 className="text-xl font-black uppercase tracking-tight italic font-display">Operator Directory</h4>
                          <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mt-1">Real-time collaboration mesh</p>
                       </div>
                    </div>
                    <div className="relative w-full md:w-80">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                       <Input 
                         value={search}
                         onChange={(e) => setSearch(e.target.value)}
                         placeholder="Search Node Identity..."
                         className="h-12 pl-12 rounded-xl bg-muted/30 border-border focus-visible:ring-primary font-medium"
                       />
                    </div>
                 </div>

                 <div className="p-4 md:p-8">
                    <div className="space-y-4">
                       {filteredMembers.map((member) => (
                          <div key={member.id} className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-muted/20 rounded-[32px] border border-transparent hover:border-border hover:bg-card transition-all group">
                             <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-card rounded-2xl border border-border flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                                   <User className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                   <div className="flex items-center gap-3">
                                      <span className="text-sm font-black uppercase tracking-widest text-foreground">{member.name}</span>
                                      <span className={cn(
                                        "px-2 py-0.5 text-[8px] font-black uppercase rounded-full",
                                        member.role === 'Admin' ? "bg-orange-500/10 text-orange-500" : "bg-primary/10 text-primary"
                                      )}>{member.role}</span>
                                   </div>
                                   <p className="text-[10px] font-medium text-muted-foreground italic">{member.email}</p>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-12 mt-6 md:mt-0">
                                <div className="text-right hidden md:block">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                                   <div className="flex items-center gap-2 justify-end">
                                      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", member.status === 'Active' ? "bg-emerald-500" : "bg-orange-400")} />
                                      <span className="text-xs font-black italic">{member.status}</span>
                                   </div>
                                </div>
                                
                                <div className="text-right hidden md:block">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Last Active</p>
                                   <span className="text-xs font-black italic">{member.lastActive}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                   <Button variant="outline" size="sm" className="h-12 w-12 rounded-2xl border-border bg-card shadow-sm hover:scale-105 transition-transform">
                                      <Settings className="w-4 h-4" />
                                   </Button>
                                   <Button variant="outline" size="sm" className="h-12 w-12 rounded-2xl border-border bg-card text-destructive hover:bg-destructive/5 shadow-sm hover:scale-105 transition-transform">
                                      <Zap className="w-4 h-4 rotate-180" />
                                   </Button>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </Card>
           </div>
        </div>

        {/* Invite Modal Overlay */}
        <AnimatePresence>
           {isInviting && (
             <>
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setIsInviting(false)}
                 className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-[101] p-6 text-foreground"
               >
                  <Card className="rounded-[50px] border-border bg-card shadow-3xl overflow-hidden p-12">
                     <div className="space-y-8">
                        <div className="flex items-center gap-5">
                           <div className="w-16 h-16 bg-primary text-primary-foreground rounded-[24px] flex items-center justify-center shadow-xl">
                              <UserPlus className="w-8 h-8 fill-primary-foreground" />
                           </div>
                           <div>
                              <h2 className="text-3xl font-black tracking-tighter uppercase italic font-display">New Node Invitation</h2>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Initialize neural cluster expansion</p>
                           </div>
                        </div>

                        <form onSubmit={handleInvite} className="space-y-10">
                           <div className="space-y-6">
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-foreground px-4">Operator Email Channel</label>
                                 <div className="relative">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30" />
                                    <Input 
                                      required
                                      name="email"
                                      type="email"
                                      placeholder="node@signalforge.ai"
                                      className="h-16 pl-14 rounded-2xl bg-muted/30 border-border font-medium text-lg focus-visible:ring-primary"
                                    />
                                 </div>
                              </div>

                              <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-foreground px-4">Protocol Access Level</label>
                                 <div className="grid grid-cols-2 gap-4">
                                    {['Editor', 'Viewer'].map((r) => (
                                       <button 
                                         key={r}
                                         type="button"
                                         className="h-16 rounded-2xl border-2 border-border hover:border-primary transition-all text-[11px] font-black uppercase tracking-widest"
                                       >
                                          {r} Access
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col gap-4">
                              <Button type="submit" className="h-16 bg-primary text-primary-foreground rounded-2xl shadow-2xl shadow-primary/20 font-black uppercase text-[12px] tracking-[0.2em] gap-3">
                                 Forge Invitation Signal
                              </Button>
                              <Button 
                                type="button" 
                                onClick={() => setIsInviting(false)}
                                variant="ghost" 
                                className="h-12 font-black uppercase text-[10px] tracking-widest text-muted-foreground"
                              >
                                Cancel Operation
                              </Button>
                           </div>
                        </form>
                     </div>
                  </Card>
               </motion.div>
             </>
           )}
        </AnimatePresence>

      </div>
    </div>
  );
}
