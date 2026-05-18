import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, query, collection, where, orderBy } from 'firebase/firestore';
import { 
  ChevronLeft, 
  Settings, 
  Plus, 
  Zap, 
  BarChart3, 
  History as HistoryIcon,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';

export default function CampaignDetail() {
  const { id } = useParams();
  const { currentWorkspace } = useStore();
  const [campaign, setCampaign] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !currentWorkspace) return;
    
    // Subscribe to campaign
    const unsubscribeCampaign = onSnapshot(doc(db, `workspaces/${currentWorkspace.id}/campaigns`, id), (snap) => {
      if (snap.exists()) {
        setCampaign({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    // Subscribe to assets related to this campaign
    const q = query(
      collection(db, `workspaces/${currentWorkspace.id}/projects`),
      where('campaignId', '==', id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeAssets = onSnapshot(q, (snap) => {
       setAssets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
       // If campaignId field doesn't exist yet in any doc, this might fail with an index error or just empty
       console.warn("Assets sync warning:", error);
       // Fallback: fetch all if campaignId filter fails (optional, but let's stick to the schema)
    });

    return () => {
      unsubscribeCampaign();
      unsubscribeAssets();
    };
  }, [id, currentWorkspace]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Zap className="w-10 h-10 animate-pulse text-[#DDD]" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-black uppercase">Campaign Not Found</h2>
        <Link to="/campaigns" className="mt-4 inline-block text-sm font-bold underline">Return to Matrix</Link>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 pb-32">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
             <Link to="/campaigns" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#999] hover:text-black transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Matrix
             </Link>
             <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl shadow-black/20">
                  <Zap className="w-8 h-8" />
               </div>
               <div>
                  <h1 className="text-5xl font-black tracking-tighter uppercase italic italic-serif">{campaign.name}</h1>
                  <p className="text-[#999] font-medium mt-1">{campaign.description}</p>
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="outline" className="h-12 px-6 rounded-xl border-[#EEEEEE] font-black text-[10px] uppercase tracking-widest bg-white gap-2">
                <Settings className="w-4 h-4" /> Edit Matrix
             </Button>
             <Link to="/studio">
               <Button className="h-12 px-8 bg-black text-white rounded-xl shadow-xl shadow-black/20 font-black text-[10px] uppercase tracking-widest gap-2">
                  <Plus className="w-4 h-4" /> Forge New Asset
               </Button>
             </Link>
          </div>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Assets', value: assets.length, icon: HistoryIcon },
            { label: 'Avg Quality', value: '92/100', icon: BarChart3 },
            { label: 'Platform Reach', value: '1.2M', icon: Search },
            { label: 'Active Tasks', value: '4', icon: CheckCircle2 },
          ].map((stat, i) => (
             <Card key={i} className="p-8 rounded-[32px] border-[#EEEEEE] shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#999]">{stat.label}</p>
                  <stat.icon className="w-4 h-4 text-[#DDD]" />
                </div>
                <h3 className="text-3xl font-black tracking-tighter">{stat.value}</h3>
             </Card>
          ))}
       </div>

       {/* Assets List */}
       <div className="space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-black rounded-lg text-white">
                   <HistoryIcon className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-widest italic italic-serif">Asset Repository</h2>
             </div>
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 rounded-lg font-black text-[9px] uppercase tracking-widest gap-2">
                   <Filter className="w-3.5 h-3.5" /> Filter
                </Button>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {assets.length > 0 ? (
               assets.map((asset, i) => (
                 <motion.div
                   key={asset.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.05 }}
                   className="group bg-white border border-[#EEEEEE] rounded-[32px] p-8 hover:border-black hover:shadow-2xl hover:shadow-black/5 transition-all flex flex-col md:flex-row gap-10 items-start md:items-center"
                 >
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                       <div className="w-16 h-16 bg-[#F9F9F9] rounded-2xl flex items-center justify-center text-[#BBB] group-hover:bg-black group-hover:text-white transition-all shrink-0">
                          <Zap className="w-8 h-8" />
                       </div>
                       <div className="min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                             <Badge variant="secondary" className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-[#F5F5F5] border-none">{asset.platform}</Badge>
                             <span className="text-[10px] font-black uppercase text-[#BBB] tracking-widest">
                               <Clock className="inline w-3 h-3 mr-1" />
                               {asset.createdAt?.toDate?.() ? asset.createdAt.toDate().toLocaleDateString() : 'Active'}
                             </span>
                          </div>
                          <p className="text-sm font-medium leading-relaxed line-clamp-2 text-[#444]">{asset.content}</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-10 shrink-0 w-full md:w-auto">
                       <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#BBB] mb-1">Quality Score</span>
                          <span className="text-lg font-black italic">{asset.prediction?.score || '—'}/100</span>
                       </div>
                       <Button size="icon" variant="ghost" className="rounded-xl w-12 h-12 hover:bg-black hover:text-white transition-all">
                          <ArrowUpRight className="w-6 h-6" />
                       </Button>
                    </div>
                 </motion.div>
               ))
             ) : (
                <div className="p-20 bg-white border-2 border-dashed border-[#EEEEEE] rounded-[40px] text-center">
                    <HistoryIcon className="w-12 h-12 text-[#DDD] mx-auto mb-4" />
                    <h4 className="text-xl font-black uppercase italic italic-serif">No Assets Forged</h4>
                    <p className="text-[#BBB] font-medium mt-2">Initialize the studio to begin content dispersal.</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
