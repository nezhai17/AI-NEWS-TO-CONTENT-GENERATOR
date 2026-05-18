import { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  Folder, 
  ChevronRight, 
  MoreHorizontal, 
  Calendar, 
  Users, 
  BarChart3, 
  Zap,
  Clock,
  Plus,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from 'motion/react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { sendNotification } from '@/lib/notifications';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { aiService } from '@/services/aiService';
import { cn } from '@/lib/utils';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  itemCount: number;
  lastEdited: any;
}

export default function Campaigns() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentWorkspace } = useStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isBuildingAuto, setIsBuildingAuto] = useState(false);
  const [autoGoal, setAutoGoal] = useState('');
  const [newCampaign, setNewCampaign] = useState({ name: '', description: '' });

  useEffect(() => {
    if (!user || !currentWorkspace) return;
    const q = query(
      collection(db, `workspaces/${currentWorkspace.id}/campaigns`), 
      orderBy('lastEdited', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      setCampaigns(snap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign)));
    }, (error) => {
      console.error("Firestore Subscribe Error:", error);
    });

    return () => unsubscribe();
  }, [user, currentWorkspace]);

  const handleCreate = async () => {
    if (!user || !newCampaign.name || !currentWorkspace) return;
    try {
      await addDoc(collection(db, `workspaces/${currentWorkspace.id}/campaigns`), {
        ...newCampaign,
        status: 'draft',
        itemCount: 0,
        lastEdited: serverTimestamp(),
        userId: user.uid,
        workspaceId: currentWorkspace.id
      });
      toast.success('Campaign matrix initialized');
      sendNotification(user.uid, {
        title: 'Campaign Matrix Online',
        message: `New offensive node "${newCampaign.name}" has been initialized in the hub.`,
        type: 'success'
      });
      setIsNewModalOpen(false);
      setNewCampaign({ name: '', description: '' });
    } catch (e) {
      toast.error('Campaign initialization failed');
    }
  };

  const handleAutoBuild = async () => {
    if (!autoGoal || !currentWorkspace || !user) return;
    setIsBuildingAuto(true);
    try {
      const plan = await aiService.autoBuildCampaign(autoGoal, currentWorkspace.id);
      
      // Create the campaign
      const campRef = await addDoc(collection(db, `workspaces/${currentWorkspace.id}/campaigns`), {
        name: plan.strategyName || autoGoal,
        description: plan.conversionGoal || 'Autonomous campaign built from goal.',
        status: 'active',
        itemCount: 0,
        lastEdited: serverTimestamp(),
        userId: user.uid,
        workspaceId: currentWorkspace.id,
        aiGenerated: true,
        plan: plan
      });

      // Add a notification/approval for the major strategy change
      await addDoc(collection(db, `workspaces/${currentWorkspace.id}/approvals`), {
        type: 'campaign',
        title: `Authorize: ${plan.strategyName}`,
        description: `Autonomous core has synthesized a 30-day strategy for: ${autoGoal}. Weekly themes: ${plan.contentPlan?.map((p: any) => p.theme).join(', ')}`,
        status: 'pending',
        data: plan,
        createdAt: serverTimestamp()
      });

      toast.success('Autonomous Protocol Synced');
      setIsNewModalOpen(false);
      setAutoGoal('');
    } catch (e: any) {
      toast.error('Autonomous build failed: ' + e.message);
    } finally {
      setIsBuildingAuto(false);
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-black rounded-full" />
              <h1 className="text-4xl font-black tracking-tighter uppercase italic italic-serif">Campaign Hub</h1>
           </div>
           <p className="text-[#999] font-medium">Coordinate and synchronize your brand's digital offensive.</p>
        </div>
        <Button 
          onClick={() => setIsNewModalOpen(true)}
          className="h-14 px-8 bg-black text-white rounded-2xl shadow-xl shadow-black/20 font-black uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all gap-3"
        >
          <Plus className="w-5 h-5" />
          Initialize Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(`/campaigns/${c.id}`)}
            className="group relative bg-white border border-[#EEEEEE] rounded-[40px] p-8 hover:border-black hover:shadow-2xl hover:shadow-black/5 transition-all flex flex-col min-h-[280px] cursor-pointer"
          >
            <div className="flex items-start justify-between mb-8">
               <div className="w-14 h-14 bg-[#F5F5F5] rounded-2xl flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                  <Folder className="w-6 h-6" />
               </div>
               <button className="w-10 h-10 flex items-center justify-center text-[#BBB] hover:text-black transition-colors rounded-xl hover:bg-[#F9F9F9]">
                  <MoreHorizontal className="w-5 h-5" />
               </button>
            </div>

            <div className="flex-1">
               <h3 className="text-xl font-black tracking-tight uppercase group-hover:italic transition-all">{c.name}</h3>
               <p className="text-sm text-[#999] font-medium mt-2 line-clamp-2 leading-relaxed">
                 {c.description || 'No operational brief defined for this campaign node.'}
               </p>
            </div>

            <div className="mt-8 pt-8 border-t border-[#F5F5F5] flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#BBB]">
                     <Zap className="w-3.5 h-3.5" />
                     {c.itemCount} Units
                  </div>
                  <div className="w-1 h-1 bg-[#EEE] rounded-full" />
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#BBB]">
                     <Clock className="w-3.5 h-3.5" />
                     Active
                  </div>
               </div>
               <ChevronRight className="w-5 h-5 text-[#EEE] group-hover:text-black transition-colors" />
            </div>
          </motion.div>
        ))}

        {campaigns.length === 0 && (
           <div className="col-span-full py-32 flex flex-col items-center justify-center text-center bg-white rounded-[50px] border-2 border-dashed border-[#EEEEEE]">
              <div className="w-20 h-20 bg-[#F9F9F9] rounded-[30px] flex items-center justify-center text-[#DDD] mb-6">
                 <FolderPlus className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">No Active Campaigns</h3>
              <p className="text-[#999] font-medium mt-2 max-w-xs mx-auto text-sm leading-relaxed">
                Initialize your first campaign node to begin structured intelligence deployment.
              </p>
           </div>
        )}
      </div>

      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-10 bg-black/40 backdrop-blur-sm">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white rounded-[50px] w-full max-w-xl p-12 shadow-2xl relative"
           >
              <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-2">Initialize Matrix Node</h2>
              <p className="text-[#999] text-sm font-medium mb-10">Configure a standard campaign or let the autonomous core build it.</p>

              <div className="flex bg-muted p-1.5 rounded-2xl mb-10">
                 <button 
                   onClick={() => setAutoGoal('')}
                   className={cn(
                     "flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                     !autoGoal && !isBuildingAuto ? "bg-white shadow-sm text-black" : "text-muted-foreground"
                   )}
                 >
                   Standard
                 </button>
                 <button 
                   onClick={() => setAutoGoal(' ')}
                   className={cn(
                     "flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                     autoGoal || isBuildingAuto ? "bg-black text-white shadow-lg shadow-black/20" : "text-muted-foreground"
                   )}
                 >
                   <Zap className="w-3 h-3 fill-current" />
                   Autonomous
                 </button>
              </div>

              <div className="space-y-6">
                 {autoGoal || isBuildingAuto ? (
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#999]">Campaign Objective / Goal</label>
                      <Textarea 
                         value={autoGoal}
                         onChange={(e) => setAutoGoal(e.target.value)}
                         placeholder="e.g. Launch a new AI optimization tool for marketing agencies and generate 50 leads in 30 days."
                         className="min-h-[120px] rounded-2xl bg-[#F9F9F9] border-[#EEEEEE] text-sm focus-visible:ring-black font-medium resize-none p-6"
                      />
                   </div>
                 ) : (
                   <>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#999]">Campaign Designation</label>
                        <Input 
                           value={newCampaign.name}
                           onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                           placeholder="e.g. Q4 Growth Sprint"
                           className="h-14 rounded-2xl bg-[#F9F9F9] border-[#EEEEEE] text-sm focus-visible:ring-black font-medium px-6"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#999]">Operational Brief</label>
                        <Input 
                           value={newCampaign.description}
                           onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                           placeholder="Define the core objectives..."
                           className="h-14 rounded-2xl bg-[#F9F9F9] border-[#EEEEEE] text-sm focus-visible:ring-black font-medium px-6"
                        />
                     </div>
                   </>
                 )}
              </div>

              <div className="flex gap-4 mt-12">
                 <Button 
                   variant="ghost" 
                   onClick={() => {
                      setIsNewModalOpen(false);
                      setAutoGoal('');
                   }}
                   className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[11px]"
                 >
                   Abort
                 </Button>
                 {autoGoal || isBuildingAuto ? (
                    <Button 
                      onClick={handleAutoBuild}
                      disabled={isBuildingAuto}
                      className="flex-1 h-16 bg-black text-white rounded-2xl shadow-xl shadow-black/20 font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all gap-3"
                    >
                      {isBuildingAuto ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                      Sync Goal
                    </Button>
                 ) : (
                    <Button 
                      onClick={handleCreate}
                      className="flex-1 h-16 bg-black text-white rounded-2xl shadow-xl shadow-black/20 font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Initialize Node
                    </Button>
                 )}
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}
