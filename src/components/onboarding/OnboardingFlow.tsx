import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Rocket, 
  Bot, 
  Target, 
  Cloud 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { workspaceService } from '@/lib/workspaceService';

interface OnboardingOverlayProps {
  onComplete: () => void;
}

export default function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [brandVoice, setBrandVoice] = useState('');
  const [goals, setGoals] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    {
      title: "Welcome to the Forge",
      description: "Let's set up your intelligence profile to personalize your experience.",
      icon: Zap
    },
    {
      title: "Your Brand Voice",
      description: "How should our AI represent you? (e.g., 'Professional but witty', 'Technical and direct')",
      icon: Bot
    },
    {
      title: "Mission Goals",
      description: "What are you looking to achieve with SignalForge?",
      icon: Target
    }
  ];

  const handleNext = () => {
    if (step < steps.length) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      // Update user profile
      await setDoc(doc(db, 'users', user.uid), {
        brandVoice,
        goals,
        onboardingComplete: true,
        updatedAt: new Date()
      }, { merge: true });
      
      // Create initial workspace
      await workspaceService.createWorkspace(user.uid, `${user.displayName || 'Personal'}'s Hub`, user.email || '');
      
      toast.success('System profile synchronized');
      onComplete();
    } catch (e) {
      toast.error('Sync failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
           {steps.map((_, i) => (
             <div 
               key={i} 
               className={`flex-1 transition-all duration-500 ${i + 1 <= step ? 'bg-black' : 'bg-black/5'}`} 
             />
           ))}
        </div>

        <div className="p-16">
           <AnimatePresence mode="wait">
             <motion.div
               key={step}
               initial={{ x: 20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: -20, opacity: 0 }}
               className="space-y-10"
             >
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white">
                      {(() => {
                        const Icon = steps[step-1].icon;
                        return <Icon className="w-8 h-8" />;
                      })()}
                   </div>
                   <div>
                      <h2 className="text-4xl font-black tracking-tighter uppercase italic italic-serif">{steps[step-1].title}</h2>
                      <p className="text-[#666] font-medium mt-1">{steps[step-1].description}</p>
                   </div>
                </div>

                <div className="min-h-[200px]">
                   {step === 1 && (
                     <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                           {['Founder', 'Creator', 'Agency', 'Enterprise'].map(type => (
                             <button key={type} className="h-20 border-2 border-[#EEEEEE] rounded-3xl font-black uppercase text-[10px] tracking-widest hover:border-black transition-colors bg-white">
                               {type} Mode
                             </button>
                           ))}
                        </div>
                     </div>
                   )}

                   {step === 2 && (
                     <div className="space-y-4">
                        <Textarea 
                          placeholder="Describe your tone of voice here..."
                          value={brandVoice}
                          onChange={(e) => setBrandVoice(e.target.value)}
                          className="h-40 rounded-3xl border-[#EEEEEE] p-6 text-lg font-medium focus-visible:ring-black resize-none"
                        />
                        <div className="flex flex-wrap gap-2">
                           {['Witty', 'Professional', 'Bold', 'Data-driven', 'Storyteller'].map(tag => (
                             <button 
                               key={tag} 
                               onClick={() => setBrandVoice(prev => prev ? `${prev}, ${tag}` : tag)}
                               className="px-4 py-2 bg-[#F5F5F5] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                             >
                               + {tag}
                             </button>
                           ))}
                        </div>
                     </div>
                   )}

                   {step === 3 && (
                     <div className="space-y-4">
                        <Textarea 
                          placeholder="What is your primary goal?"
                          value={goals}
                          onChange={(e) => setGoals(e.target.value)}
                          className="h-40 rounded-3xl border-[#EEEEEE] p-6 text-lg font-medium focus-visible:ring-black resize-none"
                        />
                     </div>
                   )}
                </div>
             </motion.div>
           </AnimatePresence>

           <div className="mt-12 flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={handleBack} 
                disabled={step === 1}
                className="font-black uppercase text-[10px] tracking-widest text-[#999] hover:text-black"
              >
                 <ChevronLeft className="w-4 h-4 mr-2" />
                 Back
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={isSubmitting || (step === 2 && !brandVoice)}
                className="h-14 px-10 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-black/20"
              >
                 {step === steps.length ? (
                   isSubmitting ? <Sparkles className="w-4 h-4 animate-spin" /> : 'Complete Setup'
                 ) : (
                   <>
                     Continue
                     <ChevronRight className="w-4 h-4 ml-2" />
                   </>
                 )}
              </Button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
