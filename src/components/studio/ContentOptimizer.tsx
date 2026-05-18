import { useState } from 'react';
import { 
  Zap, 
  Sparkles, 
  Target, 
  MessageSquare, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface Suggestion {
  title: string;
  advice: string;
  category: 'Engagement' | 'Clarity' | 'Conciseness';
  prompt: string;
}

interface ContentOptimizerProps {
  content: string;
  platform: string;
  onRefine: (instruction: string) => Promise<void>;
}

export default function ContentOptimizer({ content, platform, onRefine }: ContentOptimizerProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!content) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platform })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Strategic analysis nodes failed');
      }

      setSuggestions(data);
      setSelectedIdx(0);
      toast.success('Linguistic analysis complete');
    } catch (e: any) {
      toast.error(e.message || 'Strategic analysis nodes failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyRefinement = async () => {
    if (selectedIdx === null || !suggestions[selectedIdx]) return;
    setIsRefining(true);
    try {
      await onRefine(suggestions[selectedIdx].prompt);
      toast.success('Matrix refinement sequence executed');
      // Clear suggestions after application to avoid stale advice
      setSuggestions([]);
      setSelectedIdx(null);
    } catch (e) {
      toast.error('Refinement transmission failed');
    } finally {
      setIsRefining(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Engagement': return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'Clarity': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'Conciseness': return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      default: return <Target className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-10">
      {!suggestions.length ? (
        <div className="p-12 border-2 border-dashed border-[#EEEEEE] rounded-[40px] bg-[#F9F9F9]/50 text-center">
           <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-[#DDD]">
              <Target className="w-10 h-10" />
           </div>
           <h3 className="text-2xl font-black tracking-tighter uppercase italic italic-serif">Optimization Matrix</h3>
           <p className="text-[11px] font-black uppercase tracking-widest text-[#BBB] mt-3 mb-10 max-w-sm mx-auto">
             Initialize the logic core to scan your content for structural vulnerabilities and engagement potential.
           </p>
           
           <Button 
             onClick={handleAnalyze} 
             disabled={isAnalyzing || !content}
             className="bg-black text-white rounded-2xl h-16 px-10 font-black uppercase tracking-[0.2em] text-[11px] gap-3 shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all"
           >
             {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
             Analyze Content Core
           </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-black">Improvement Signals</h4>
               <span className="text-[9px] font-black uppercase tracking-widest text-[#999]">{suggestions.length} Active Vectors</span>
            </div>

            <div className="space-y-4">
               {suggestions.map((s, i) => (
                 <button
                   key={i}
                   onClick={() => setSelectedIdx(i)}
                   className={cn(
                     "w-full text-left p-6 rounded-3xl border transition-all relative overflow-hidden group",
                     selectedIdx === i 
                       ? "bg-black border-black text-white shadow-xl shadow-black/10" 
                       : "bg-white border-[#EEEEEE] hover:border-black"
                   )}
                 >
                    <div className="flex items-center justify-between mb-3">
                       <div className={cn(
                         "flex items-center gap-2 px-2 py-1 rounded-lg",
                         selectedIdx === i ? "bg-white/10" : "bg-[#F5F5F5]"
                       )}>
                          {getCategoryIcon(s.category)}
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            selectedIdx === i ? "text-white/80" : "text-[#999]"
                          )}>{s.category}</span>
                       </div>
                       {selectedIdx === i && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <h5 className="text-sm font-black uppercase tracking-tight mb-2">{s.title}</h5>
                    <p className={cn(
                      "text-xs leading-relaxed",
                      selectedIdx === i ? "text-white/70" : "text-[#666]"
                    )}>{s.advice}</p>
                 </button>
               ))}
            </div>

            <Button 
               onClick={handleApplyRefinement}
               disabled={isRefining || selectedIdx === null}
               className="w-full h-16 bg-black text-white rounded-2xl shadow-2xl shadow-black/20 font-black uppercase tracking-[0.2em] text-[11px] gap-3 mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
               {isRefining ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
               Execute Refinement
            </Button>
          </div>

          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-black">Linguistic Preview</h4>
             </div>

             <div className="p-10 bg-white border border-[#EEEEEE] rounded-[40px] shadow-sm relative min-h-[400px] flex flex-col">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                         <MessageSquare className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-black">Active Stream</span>
                   </div>
                   <div className="prose prose-sm max-w-none">
                      <p className="text-[#444] font-medium leading-relaxed italic border-l-4 border-black pl-6 py-2">
                        "{content}"
                      </p>
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-[#F5F5F5]">
                   <div className="p-6 bg-[#F9F9F9] rounded-2xl border border-[#EEEEEE]">
                      <h6 className="text-[9px] font-black uppercase tracking-widest text-[#999] mb-3">Refinement Prompt</h6>
                      <code className="text-[10px] text-black font-mono break-all leading-tight block">
                        {selectedIdx !== null ? suggestions[selectedIdx].prompt : "Awaiting Strategy Selection..."}
                      </code>
                   </div>
                </div>

                <AnimatePresence>
                   {isRefining && (
                     <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[40px] flex flex-col items-center justify-center z-10"
                     >
                        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-lg relative">
                           <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-full animate-spin" />
                           <Zap className="w-8 h-8 text-white fill-white animate-pulse" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black mt-6 animate-pulse">Reconfiguring Logic Nodes...</p>
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
