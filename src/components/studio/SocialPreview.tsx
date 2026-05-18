import { Linkedin, Twitter, Instagram, Music2, MoreHorizontal, ThumbsUp, MessageSquare, Repeat, Send, Heart, Bookmark, Share2, Facebook, MessageCircle, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SocialPreviewProps {
  content: string;
  platform: 'linkedin' | 'twitter' | 'instagram' | 'tiktok' | 'summary';
}

export default function SocialPreview({ content, platform }: SocialPreviewProps) {
  if (platform === 'summary' || !content) return null;

  const handleShare = (target: string) => {
    const encodedContent = encodeURIComponent(content);
    const url = encodeURIComponent(window.location.origin);
    
    const shares: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedContent}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${encodedContent}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedContent}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodedContent}`,
      reddit: `https://www.reddit.com/submit?url=${url}&title=Insights from SignalForge&text=${encodedContent}`
    };

    if (shares[target]) {
      window.open(shares[target], '_blank');
      toast.success(`Redirecting to ${target}...`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast.success('Matrix data copied to clipboard');
  };

  const renderContent = () => {
     return (
       <div className="prose prose-sm prose-neutral max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 pb-4">
         <ReactMarkdown>{content}</ReactMarkdown>
       </div>
     );
  };

  if (platform === 'linkedin') {
    return (
      <div className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden shadow-sm max-w-[550px] mx-auto text-[14px]">
        <div className="p-4 flex items-start justify-between">
           <div className="flex gap-2">
              <div className="w-12 h-12 bg-[#F3F6F8] rounded-full flex items-center justify-center font-bold text-[#666]">SF</div>
              <div>
                 <p className="font-bold text-black flex items-center gap-1">SignalForge <span className="text-[#666] font-normal text-[12px]">• 1st</span></p>
                 <p className="text-[#666] text-[12px]">Autonomous Content Synthesis Engine</p>
                 <p className="text-[#666] text-[12px]">1h • 🌐</p>
              </div>
           </div>
           <MoreHorizontal className="w-5 h-5 text-[#666]" />
        </div>
        <div className="px-4 pb-4">
           {renderContent()}
        </div>
        <div className="border-t border-[#F2F2F2] px-3 py-1 flex items-center justify-between">
           <div className="flex">
              {[ThumbsUp, MessageSquare, Repeat, Send].map((Icon, i) => (
                <button key={i} className="flex items-center gap-1.5 px-3 py-3 hover:bg-[#F3F3F3] rounded-lg transition-colors text-[#666] font-bold text-[13px]">
                   <Icon className="w-5 h-5" />
                   {Icon === ThumbsUp && "Like"}
                   {Icon === MessageSquare && "Comment"}
                   {Icon === Repeat && "Repost"}
                   {Icon === Send && "Send"}
                </button>
              ))}
           </div>
        </div>
        <div className="mt-6 p-6 bg-[#F9F9F9] rounded-2xl border border-[#EEEEEE]">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#999]">Dissemination Matrix</span>
              <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black uppercase" onClick={copyToClipboard}>
                 <Link className="w-3 h-3 mr-1.5" /> Copy Data
              </Button>
           </div>
           <div className="flex flex-wrap gap-2">
              {[
                { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', color: 'hover:bg-[#25D366] hover:text-white' },
                { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-[#0077B5] hover:text-white' },
                { id: 'twitter', icon: Twitter, label: 'X / Twitter', color: 'hover:bg-black hover:text-white' },
                { id: 'facebook', icon: Facebook, label: 'Facebook', color: 'hover:bg-[#1877F2] hover:text-white' },
                { id: 'reddit', icon: Share2, label: 'Reddit', color: 'hover:bg-[#FF4500] hover:text-white' },
              ].map((target) => (
                <button
                  key={target.id}
                  onClick={() => handleShare(target.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 h-10 bg-white border border-[#EEEEEE] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    target.color
                  )}
                >
                  <target.icon className="w-3.5 h-3.5" />
                  {target.label}
                </button>
              ))}
           </div>
        </div>
      </div>
    );
  }

  if (platform === 'twitter') {
    return (
      <div className="bg-white border border-[#EFF3F4] rounded-2xl overflow-hidden shadow-sm max-w-[500px] mx-auto text-[15px] text-black">
        <div className="p-4 flex gap-3">
           <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-xs uppercase italic">SF</div>
           <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                 <p className="truncate flex items-center gap-1">
                    <span className="font-bold">SignalForge</span>
                    <span className="text-[#536471]">@signalforge_ai • 12m</span>
                 </p>
                 <MoreHorizontal className="w-4 h-4 text-[#536471]" />
              </div>
              <div className="mb-3 leading-normal">
                 {renderContent()}
              </div>
              <div className="flex items-center justify-between text-[#536471] max-w-[425px]">
                 {[MessageSquare, Repeat, Heart, Bookmark, Share2].map((Icon, i) => (
                    <button key={i} className="flex items-center gap-2 hover:bg-[#F7F7F7] p-2 rounded-full transition-colors">
                       <Icon className="w-4 h-4" />
                       {i === 0 && <span className="text-xs">24</span>}
                       {i === 1 && <span className="text-xs">12</span>}
                       {i === 2 && <span className="text-xs">148</span>}
                    </button>
                 ))}
              </div>
           </div>
        </div>
        <div className="mt-6 p-6 bg-[#F9F9F9] rounded-2xl border border-[#EEEEEE]">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#999]">Dissemination Matrix</span>
              <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black uppercase" onClick={copyToClipboard}>
                 <Link className="w-3 h-3 mr-1.5" /> Copy Data
              </Button>
           </div>
           <div className="flex flex-wrap gap-2">
              {[
                { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', color: 'hover:bg-[#25D366] hover:text-white' },
                { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-[#0077B5] hover:text-white' },
                { id: 'twitter', icon: Twitter, label: 'X / Twitter', color: 'hover:bg-black hover:text-white' },
                { id: 'facebook', icon: Facebook, label: 'Facebook', color: 'hover:bg-[#1877F2] hover:text-white' },
                { id: 'reddit', icon: Share2, label: 'Reddit', color: 'hover:bg-[#FF4500] hover:text-white' },
              ].map((target) => (
                <button
                  key={target.id}
                  onClick={() => handleShare(target.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 h-10 bg-white border border-[#EEEEEE] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    target.color
                  )}
                >
                  <target.icon className="w-3.5 h-3.5" />
                  {target.label}
                </button>
              ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-center bg-black/5 rounded-3xl border border-dashed border-black/10">
       <div className="w-12 h-12 bg-black text-white rounded-xl mx-auto flex items-center justify-center mb-4">
          <Share2 className="w-6 h-6" />
       </div>
       <p className="text-[10px] font-black uppercase tracking-widest text-black">Native Preview Node</p>
       <p className="text-[10px] font-medium text-[#999] mt-2">Visualizing asset dimensions for {platform}...</p>
    </div>
  );
}
