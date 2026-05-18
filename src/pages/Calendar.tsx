import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Music2,
  Clock,
  ExternalLink,
  Filter,
  MoreVertical,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useStore } from '@/store/useStore';

const PLATFORM_ICONS: Record<string, any> = {
  summary: Sparkles,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  tiktok: Music2
};

export default function Calendar() {
  const { user } = useAuth();
  const { currentWorkspace } = useStore();
  const [currentDate] = useState(new Date());
  
  // Real scheduled content from workspace projects
  const [scheduledContent, setScheduledContent] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !currentWorkspace) return;
    const q = query(
      collection(db, `workspaces/${currentWorkspace.id}/projects`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
       const assets = snap.docs.map(doc => {
         const data = doc.data();
         const dateObj = data.createdAt ? (typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt.toDate?.() || new Date()) : new Date();
         const dateStr = `2026-05-${String(dateObj.getDate()).padStart(2, '0')}`;
         const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
         
         return {
           id: doc.id,
           date: dateStr,
           time: timeStr,
           platform: data.platform,
           title: (data.content || '').substring(0, 40) + '...',
           status: 'ready'
         };
       });
       setScheduledContent(assets);
    });

    return () => unsubscribe();
  }, [user, currentWorkspace]);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Logic to generate days for the current month view (May 2026)
  // Simplified for the purpose of the UI demo
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="h-24 px-10 flex items-center justify-between border-b border-[#EEEEEE] shrink-0">
         <div className="flex items-center gap-10">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic italic-serif">Scheduling Ledger</h1>
            
            <div className="flex items-center gap-2 bg-[#F5F5F5] p-1.5 rounded-2xl">
               <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-sm">
                  <ChevronLeft className="w-5 h-5" />
               </Button>
               <span className="text-[11px] font-black uppercase tracking-widest px-4">{monthNames[currentDate.getMonth()]} 2026</span>
               <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-sm">
                  <ChevronRight className="w-5 h-5" />
               </Button>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <Button variant="outline" className="h-12 px-6 rounded-2xl border-[#EEEEEE] font-black text-[10px] uppercase tracking-widest gap-3">
               <Filter className="w-3.5 h-3.5" /> Filter Matrix
            </Button>
            <Button className="h-12 px-8 bg-black text-white rounded-2xl shadow-xl shadow-black/10 font-black text-[10px] uppercase tracking-widest gap-3">
               <Plus className="w-4 h-4" /> New Sequence
            </Button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-[#FAFAFA]">
         <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-7 gap-px bg-[#EEEEEE] border border-[#EEEEEE] rounded-[40px] overflow-hidden shadow-2xl shadow-black/5">
                {days.map(day => (
                  <div key={day} className="bg-[#F9F9F9] py-6 px-10 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#999]">{day}</span>
                  </div>
                ))}

                {/* Simplified Grid Generation */}
                {Array.from({ length: 35 }).map((_, i) => {
                  const day = i - 3; // Offset to start May 2026 (Starts on Friday, i=5)
                  const isCurrentMonth = day > 0 && day <= 31;
                  const dateStr = `2026-05-${String(day).padStart(2, '0')}`;
                  const dailyContent = scheduledContent.filter(c => c.date === dateStr);

                  return (
                    <div key={i} className={cn(
                      "min-h-[220px] bg-white p-6 transition-all group relative",
                      !isCurrentMonth && "bg-[#FBFBFB] opacity-40",
                      isCurrentMonth && "hover:bg-[#FDFDFD] cursor-pointer"
                    )}>
                       <div className="flex justify-between items-center mb-6">
                          <span className={cn(
                            "text-sm font-black italic italic-serif",
                            day === 16 ? "w-8 h-8 flex items-center justify-center bg-black text-white rounded-lg shadow-lg rotate-12" : "text-black"
                          )}>
                            {isCurrentMonth ? day : ''}
                          </span>
                          {isCurrentMonth && (
                            <button className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white">
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                       </div>

                       <div className="space-y-3">
                          {dailyContent.map(content => {
                            const Icon = PLATFORM_ICONS[content.platform];
                            return (
                              <motion.div 
                                key={content.id}
                                whileHover={{ scale: 1.05 }}
                                className={cn(
                                  "p-4 rounded-2xl border flex flex-col gap-3 group/item shadow-sm transition-all",
                                  content.status === 'ready' ? "bg-white border-[#F0F0F0]" : "bg-[#F9F9F9] border-dashed border-[#DDD] border-2"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                   <div className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center",
                                      content.status === 'ready' ? "bg-black text-white" : "bg-[#EEE] text-[#999]"
                                   )}>
                                      <Icon className="w-4 h-4 shrink-0" />
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <Clock className="w-3 h-3 text-[#BBB]" />
                                      <span className="text-[9px] font-black text-[#999] tracking-widest">{content.time}</span>
                                   </div>
                                </div>
                                <p className="text-[10px] font-bold leading-relaxed text-[#444] line-clamp-2 uppercase">
                                   {content.title}
                                </p>
                                <div className="flex items-center justify-between mt-2 pt-3 border-t border-black/5 opacity-0 group-hover/item:opacity-100 transition-all">
                                   <span className={cn(
                                      "text-[8px] font-black uppercase tracking-widest",
                                      content.status === 'ready' ? "text-emerald-500" : "text-orange-400"
                                   )}>
                                      {content.status}
                                   </span>
                                   <ExternalLink className="w-3 h-3 text-[#BBB]" />
                                </div>
                              </motion.div>
                            );
                          })}
                       </div>
                    </div>
                  );
                })}
            </div>
         </div>
      </div>
    </div>
  );
}
