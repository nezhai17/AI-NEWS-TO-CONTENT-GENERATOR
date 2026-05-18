import { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Copy, 
  Download,
  Palette,
  Maximize2,
  RefreshCw,
  Loader2,
  Share2,
  Check,
  Shapes,
  Crop,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { sendNotification } from '@/lib/notifications';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';

import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Suggestion {
  description: string;
  style: string;
  reason: string;
}

interface VisualGeneratorProps {
  content: string;
  platform: string;
}

const aspectRatios = [
  { label: 'Square', value: '1:1', icon: Shapes, description: 'Optimized for Instagram feed and LinkedIn profile posts.' },
  { label: 'Portrait', value: '3:4', icon: Crop, description: 'Ideal for Pinterest and high-engagement Instagram posts.' },
  { label: 'Landscape', value: '16:9', icon: Maximize2, description: 'Best for Twitter/X cards, YouTube thumbnails, and Facebook headers.' },
  { label: 'Mobile', value: '9:16', icon: ImageIcon, description: 'Designed for Reels, TikTok, and Instagram Stories.' },
];

export default function VisualGenerator({ content, platform }: VisualGeneratorProps) {
  const { user } = useAuth();
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [selectedRatio, setSelectedRatio] = useState('1:1');

  useEffect(() => {
    // Reset when content changes significantly
    if (!content) {
      setSuggestions([]);
      setGeneratedImageUrl('');
    }
  }, [content]);

  const handleFetchIdeas = async () => {
    if (!content) return;
    setIsGeneratingIdeas(true);
    try {
      const res = await fetch('/api/suggest-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platform })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate visual ideas');
      }

      setSuggestions(data);
      if (data.length > 0) setSelectedPrompt(data[0].description);
      toast.success('Visual intelligence matrix updated');
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate visual ideas');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleForgeImage = async () => {
    if (!selectedPrompt) return;
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: selectedPrompt,
          aspectRatio: selectedRatio
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await res.json();
      setGeneratedImageUrl(data.imageUrl);
      toast.success('Visual asset forged successfully');
      
      if (user) {
        sendNotification(user.uid, {
          title: 'Visual Asset Online',
          message: `High-fidelity image synthesized for ${platform.toUpperCase()} content.`,
          type: 'success'
        });
      }
    } catch (e: any) {
      toast.error(e.message || 'Image generation failed');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `forge-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-10">
      {!suggestions.length ? (
        <div className="p-12 border-2 border-dashed border-[#EEEEEE] rounded-[40px] bg-[#F9F9F9]/50 text-center">
           <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-[#DDD]">
              <ImageIcon className="w-10 h-10" />
           </div>
           <h3 className="text-2xl font-black tracking-tighter uppercase italic italic-serif">Visual Generation Node</h3>
           <p className="text-[11px] font-black uppercase tracking-widest text-[#BBB] mt-3 mb-10 max-w-sm mx-auto">
             Initialize the visual generator to synthesize relevant assets for your current content.
           </p>
           
           <Button 
             onClick={handleFetchIdeas} 
             disabled={isGeneratingIdeas || !content}
             className="bg-black text-white rounded-2xl h-16 px-10 font-black uppercase tracking-[0.2em] text-[11px] gap-3 shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all"
           >
             {isGeneratingIdeas ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
             Initialize Visual Matrix
           </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-black">Synthesis Prompts</h4>
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest gap-2"
                 onClick={handleFetchIdeas}
                 disabled={isGeneratingIdeas}
               >
                 <RefreshCw className={cn("w-3.5 h-3.5", isGeneratingIdeas && "animate-spin")} /> Regenerate
               </Button>
            </div>

            <div className="space-y-4">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPrompt(s.description)}
                  className={cn(
                    "w-full text-left p-6 rounded-3xl border transition-all group relative overflow-hidden",
                    selectedPrompt === s.description 
                      ? "bg-black border-black text-white shadow-xl shadow-black/10" 
                      : "bg-white border-[#EEEEEE] hover:border-black"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                      selectedPrompt === s.description ? "bg-white/10 text-white" : "bg-[#F5F5F5] text-[#999]"
                    )}>{s.style}</span>
                    {selectedPrompt === s.description && <Check className="w-4 h-4" />}
                  </div>
                  <p className="text-sm font-medium leading-relaxed line-clamp-2">{s.description}</p>
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-4">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-[#999]">Display Parameters</h4>
               <TooltipProvider delay={200}>
                 <div className="flex flex-wrap gap-2">
                   {aspectRatios.map((ratio) => (
                     <Tooltip key={ratio.value}>
                       <TooltipTrigger
                         onClick={() => setSelectedRatio(ratio.value)}
                         className={cn(
                           "flex items-center gap-2 px-4 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                           selectedRatio === ratio.value 
                             ? "bg-black text-white" 
                             : "bg-white border border-[#EEEEEE] text-[#999] hover:border-black hover:text-black"
                         )}
                       >
                         <ratio.icon className="w-3.5 h-3.5" />
                         {ratio.label}
                       </TooltipTrigger>
                       <TooltipContent className="bg-black text-white border-none p-3 rounded-xl shadow-xl max-w-[200px]">
                         <p className="font-bold text-[10px] uppercase tracking-widest mb-1">{ratio.label} Dimension</p>
                         <p className="text-[10px] text-white/70 leading-relaxed font-medium">{ratio.description}</p>
                       </TooltipContent>
                     </Tooltip>
                   ))}
                 </div>
               </TooltipProvider>
            </div>

            <Button 
               onClick={handleForgeImage}
               disabled={isGeneratingImage || !selectedPrompt}
               className="w-full h-16 bg-black text-white rounded-2xl shadow-2xl shadow-black/20 font-black uppercase tracking-[0.2em] text-[11px] gap-3 mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
               {isGeneratingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
               Forge Dynamic Asset
            </Button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-black">Asset Preview</h4>
               {generatedImageUrl && (
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={handleDownload}>
                       <Download className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 rounded-lg">
                       <Share2 className="w-3.5 h-3.5" />
                    </Button>
                 </div>
               )}
            </div>

            <div className={cn(
              "relative rounded-[40px] border-[#EEEEEE] bg-[#F9F9F9] overflow-hidden flex items-center justify-center min-h-[400px]",
              generatedImageUrl ? "border-none shadow-2xl shadow-black/5" : "border-2 border-dashed"
            )}>
               <AnimatePresence mode="wait">
                 {isGeneratingImage ? (
                   <motion.div 
                     key="loading"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="flex flex-col items-center gap-4 py-20"
                   >
                      <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
                         <Loader2 className="w-8 h-8 animate-spin text-black" />
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#999] animate-pulse">Synthesizing Pixel Matrix...</p>
                   </motion.div>
                 ) : generatedImageUrl ? (
                   <motion.img 
                     key="preview"
                     initial={{ opacity: 0, scale: 1.1 }}
                     animate={{ opacity: 1, scale: 1 }}
                     src={generatedImageUrl}
                     alt="AI Generated Synthesis"
                     className="w-full h-full object-cover"
                     referrerPolicy="no-referrer"
                   />
                 ) : (
                   <div className="flex flex-col items-center gap-4 text-[#DDD] py-20">
                      <ImageIcon className="w-16 h-16" />
                      <p className="text-[9px] font-black uppercase tracking-widest">Awaiting Output Signal</p>
                   </div>
                 )}
               </AnimatePresence>

               {generatedImageUrl && (
                 <div className="absolute bottom-6 right-6">
                    <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/70">Verified Asset</span>
                    </div>
                 </div>
               )}
            </div>

            {!generatedImageUrl && !isGeneratingImage && (
              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                 <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-blue-900">Operator Protocol</p>
                       <p className="text-[11px] text-blue-700 font-medium mt-1 leading-relaxed">
                         The engine will use the selected prompt to forge a high-fidelity visual asset matching your content's semantic weight.
                       </p>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
