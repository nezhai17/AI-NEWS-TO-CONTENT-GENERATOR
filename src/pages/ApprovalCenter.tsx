import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Clock, 
  Edit3, 
  ShieldCheck, 
  ArrowUpRight,
  TrendingUp,
  Zap,
  Info,
  ChevronRight,
  History,
  Lock,
  Eye,
  Rocket
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore, Approval } from "@/store/useStore";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function ApprovalCenter() {
  const { user } = useAuth();
  const { currentWorkspace, approvals, setApprovals } = useStore();
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!currentWorkspace) return;

    const q = query(
      collection(db, `workspaces/${currentWorkspace.id}/approvals`),
      where('status', '==', 'pending')
    );

    const unsub = onSnapshot(q, (snap) => {
      const apps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setApprovals(apps);
    }, (err) => {
      console.warn("Approval portal sync interrupted:", err.message);
    });

    return () => unsub();
  }, [currentWorkspace]);

  const handleAction = async (approval: Approval, action: 'approved' | 'rejected' | 'scheduled') => {
    if (!currentWorkspace) return;
    setIsProcessing(true);
    try {
      const approvalRef = doc(db, `workspaces/${currentWorkspace.id}/approvals`, approval.id);
      await updateDoc(approvalRef, { 
        status: action,
        processedAt: serverTimestamp(),
        processedBy: user?.uid
      });

      // If approved, create the actual project/post
      if (action === 'approved') {
        await addDoc(collection(db, `workspaces/${currentWorkspace.id}/projects`), {
          ...approval.data,
          status: 'published',
          createdAt: serverTimestamp(),
          approvedFromId: approval.id
        });
        toast.success(`${approval.title} deployed to production protocol`);
      } else if (action === 'rejected') {
        toast.error(`${approval.title} discarded from sync`);
      } else {
        toast.info(`${approval.title} queued for later transmission`);
      }

      if (selectedApproval?.id === approval.id) {
        setSelectedApproval(null);
      }
    } catch (e: any) {
      toast.error("Protocol sync failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-10 space-y-10 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <ShieldCheck className="w-8 h-8 text-black dark:text-white" />
             <h1 className="text-4xl font-black tracking-tighter uppercase font-display italic">Approval Portal</h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
            {approvals.length} Core Actions Awaiting Neural Confirmation
          </p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-14 rounded-2xl border-border bg-card font-black text-[10px] uppercase tracking-widest gap-2">
             <History className="w-4 h-4" />
             Sync History
           </Button>
           <Button className="h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-widest px-10">
             Approve All Signals
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Approvals List */}
        <div className="xl:col-span-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {approvals.length > 0 ? (
              approvals.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedApproval(app)}
                  className={cn(
                    "p-6 rounded-[32px] border cursor-pointer transition-all flex items-center gap-5 group relative overflow-hidden",
                    selectedApproval?.id === app.id 
                      ? "bg-black text-white border-black shadow-xl scale-[1.02]" 
                      : "bg-card border-border hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                    selectedApproval?.id === app.id ? "bg-white/10" : "bg-muted text-muted-foreground"
                  )}>
                    {app.type === 'publish' && <Zap className="w-5 h-5" />}
                    {app.type === 'campaign' && <Rocket className="w-5 h-5" />}
                    {app.type === 'strategy' && <TrendingUp className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[9px] font-black uppercase tracking-[0.2em] mb-1",
                      selectedApproval?.id === app.id ? "text-white/40" : "text-muted-foreground"
                    )}>{app.type}</p>
                    <p className="text-sm font-black truncate">{app.title}</p>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-transform",
                    selectedApproval?.id === app.id ? "text-white translate-x-1" : "text-muted"
                  )} />
                </motion.div>
              ))
            ) : (
              <div className="p-20 text-center border-2 border-dashed border-border rounded-[40px] opacity-40">
                <ShieldCheck className="w-12 h-12 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Awaiting autonomous signals...</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Detail */}
        <div className="xl:col-span-8">
          <AnimatePresence mode="wait">
            {selectedApproval ? (
              <motion.div
                key={selectedApproval.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card border border-border rounded-[48px] overflow-hidden shadow-2xl flex flex-col h-full sticky top-10"
              >
                <div className="p-10 border-b border-border flex justify-between items-center bg-muted/20">
                   <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-primary text-primary-foreground rounded-[24px] flex items-center justify-center">
                         <Info className="w-8 h-8" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">PROVISIONAL {selectedApproval.type}</p>
                         <h2 className="text-3xl font-black italic tracking-tighter font-display uppercase">{selectedApproval.title}</h2>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <Button variant="ghost" className="w-12 h-12 rounded-xl p-0 hover:bg-muted text-muted-foreground">
                         <Eye className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" className="w-12 h-12 rounded-xl p-0 hover:bg-muted text-muted-foreground">
                         <Lock className="w-5 h-5" />
                      </Button>
                   </div>
                </div>

                <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                   <div className="max-w-3xl space-y-12">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Autonomous Rationale</label>
                        <p className="text-lg font-bold leading-relaxed">{selectedApproval.description}</p>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Synthesized Data Asset</label>
                        <div className="p-10 bg-muted/40 rounded-[40px] border border-border shadow-inner prose-signal">
                           <ReactMarkdown>{selectedApproval.data?.content || JSON.stringify(selectedApproval.data, null, 2)}</ReactMarkdown>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-8">
                         <div className="p-8 bg-muted/20 rounded-[32px] border border-border">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-4">Signal Predict</p>
                            <div className="flex items-end gap-3">
                               <span className="text-5xl font-black italic font-display">{selectedApproval.data?.prediction?.score || 85}</span>
                               <span className="text-xs font-black uppercase text-muted-foreground mb-2">/ 100</span>
                            </div>
                         </div>
                         <div className="p-8 bg-muted/20 rounded-[32px] border border-border">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-4">Target Node</p>
                            <span className="text-[11px] font-black uppercase tracking-widest bg-black text-white px-3 py-1 rounded-full">{selectedApproval.data?.platform || 'GENERAL'}</span>
                         </div>
                         <div className="p-8 bg-muted/20 rounded-[32px] border border-border">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-4">Complexity</p>
                            <span className="text-sm font-black uppercase tracking-widest">OPTIMAL</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-10 border-t border-border bg-muted/10 grid grid-cols-2 md:grid-cols-5 gap-4">
                   <Button 
                     onClick={() => handleAction(selectedApproval, 'rejected')}
                     disabled={isProcessing}
                     variant="outline" 
                     className="h-16 rounded-2xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 font-black uppercase text-[10px] tracking-widest gap-2"
                   >
                     <XCircle className="w-4 h-4" />
                     Reject
                   </Button>
                   <Button 
                     variant="outline" 
                     className="h-16 rounded-2xl border-border text-muted-foreground font-black uppercase text-[10px] tracking-widest gap-2"
                   >
                     <RotateCcw className="w-4 h-4" />
                     Regen
                   </Button>
                   <Button 
                     variant="outline" 
                     className="h-16 rounded-2xl border-border text-muted-foreground font-black uppercase text-[10px] tracking-widest gap-2"
                   >
                     <Edit3 className="w-4 h-4" />
                     Edit
                   </Button>
                   <Button 
                     onClick={() => handleAction(selectedApproval, 'scheduled')}
                     disabled={isProcessing}
                     variant="outline" 
                     className="h-16 rounded-2xl border-amber-500/20 text-amber-500 hover:bg-amber-500/10 font-black uppercase text-[10px] tracking-widest gap-2"
                   >
                     <Clock className="w-4 h-4" />
                     Later
                   </Button>
                   <Button 
                     onClick={() => handleAction(selectedApproval, 'approved')}
                     disabled={isProcessing}
                     className="h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 font-black uppercase text-[10px] tracking-[0.2em] gap-3"
                   >
                     <CheckCircle2 className="w-5 h-5 fill-current" />
                     Approve
                   </Button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full bg-muted/10 rounded-[48px] border-2 border-dashed border-border flex flex-col items-center justify-center text-center p-20 min-h-[600px]">
                 <div className="w-24 h-24 bg-muted rounded-[32px] flex items-center justify-center mb-8">
                    <Zap className="w-12 h-12 text-muted-foreground" />
                 </div>
                 <h3 className="text-2xl font-black italic tracking-tighter uppercase font-display mb-4">Select a Protocol</h3>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground max-w-sm leading-relaxed">
                   Choose a generated action from the queue to review and authorize its deployment.
                 </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
