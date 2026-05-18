import { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { 
  Zap, 
  Check, 
  Shield, 
  Rocket, 
  CreditCard,
  History,
  ArrowRight,
  TrendingUp,
  Cpu,
  Globe
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/AuthContext';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const plans = [
  {
    id: 'free',
    name: 'Lite',
    price: '$0',
    tokens: '1,000',
    description: 'Entry-level node for individual creators.',
    features: [
      '3 Dedicated Workspaces',
      'Basic AI Content Engine',
      'Neural Dashboard Access',
      'Community Support'
    ],
    accent: 'border-slate-200 dark:border-slate-800'
  },
  {
    id: 'pro',
    name: 'Signal Pro',
    price: '$49',
    tokens: '50,000',
    description: 'High-throughput scaling for professional teams.',
    features: [
      'Unlimited Workspaces',
      'Trend Intelligence Node',
      'AI Image Generation Matrix',
      'Direct Team Collaboration',
      'Priority Neural Processing',
      '50,000 Monthly Tokens'
    ],
    popular: true,
    accent: 'border-primary ring-4 ring-primary/10'
  },
  {
    id: 'enterprise',
    name: 'Titanium',
    price: '$299',
    tokens: 'Unlimited',
    description: 'Full autonomous infrastructure for agencies.',
    features: [
      'Everything in Pro',
      'Custom AI Agent Architect',
      'Dedicated API Processing Node',
      'White-label Neural Output',
      'Enterprise SLA & Support',
      'SSO & Advanced Security'
    ],
    accent: 'border-emerald-500/20 shadow-emerald-500/10 shadow-2xl'
  }
];

export default function Billing() {
  const { user } = useAuth();
  const { subscription } = useStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = (planId: string) => {
    setLoading(planId);
    // Simulation of payment gateway integration
    setTimeout(() => {
      setLoading(null);
      toast.success(`Infrastructure upgrade initiated: ${planId.toUpperCase()} Tier.`);
      toast.info("This is a simulation. No actual charges were made.");
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h1 className="text-5xl font-black italic tracking-tighter uppercase font-display leading-none">Capital Matrix</h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium max-w-lg">
            Manage your neural compute capacity and infrastructure tiers. Upgrade to unlock higher throughput and specialized autonomous agents.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-muted/50 p-6 rounded-[32px] border border-border">
          <div className="flex flex-col text-right">
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Compute Balance</p>
             <p className="text-2xl font-black italic tracking-tight font-display italic">4,821 <span className="text-xs opacity-50 not-italic">TOKENS</span></p>
          </div>
          <div className="w-px h-10 bg-border mx-2" />
          <Button variant="outline" className="rounded-2xl font-black uppercase text-[10px] tracking-widest">
            Refill Matrix
          </Button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={cn(
              "p-10 h-full flex flex-col justify-between rounded-[40px] bg-card transition-all duration-500 hover:-translate-y-2 relative overflow-hidden",
              plan.accent
            )}>
              {plan.popular && (
                <div className="absolute top-0 right-0 p-8">
                   <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic shadow-lg">
                      Popular Choice
                   </div>
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-3 mb-6 opacity-40">
                  {plan.id === 'free' ? <Zap className="w-5 h-5" /> : plan.id === 'pro' ? <Rocket className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">{plan.name} Infrastructure</span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black italic tracking-tighter font-display italic">{plan.price}</span>
                    <span className="text-muted-foreground text-sm font-black uppercase tracking-widest">/mo</span>
                  </div>
                </div>

                <p className="text-sm font-medium text-muted-foreground mb-10 leading-relaxed">
                   {plan.description}
                </p>

                <div className="space-y-4 mb-12 border-t border-border pt-10">
                   {plan.features.map(f => (
                     <div key={f} className="flex items-center gap-4 group">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                           <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </div>
                        <span className="text-[11px] font-bold text-foreground group-hover:translate-x-1 transition-transform">{f}</span>
                     </div>
                   ))}
                </div>
              </div>

              <Button 
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={cn(
                  "w-full h-16 rounded-[24px] font-black uppercase text-[10px] tracking-[0.2em] transition-all",
                  plan.popular 
                    ? "bg-primary text-primary-foreground hover:scale-105 shadow-xl shadow-primary/20" 
                    : "bg-muted text-foreground hover:bg-muted/80 shadow-sm"
                )}
              >
                {loading === plan.id ? 'Connecting to Matrix...' : (idx === 0 ? 'Current Tier' : `Deploy ${plan.name}`)}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Technical Summary Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         <Card className="p-12 rounded-[48px] bg-black text-white relative overflow-hidden group">
            <div className="absolute inset-0 technical-grid opacity-10" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-primary-foreground" />
                     </div>
                     <h3 className="text-2xl font-black italic tracking-tighter uppercase font-display italic">Neural Compute Stats</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Uptime Reliability</p>
                        <p className="text-3xl font-black italic tracking-tight font-display italic">99.98%</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Sync Latency</p>
                        <p className="text-3xl font-black italic tracking-tight font-display italic">~140ms</p>
                     </div>
                  </div>
               </div>
               <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 flex-1 max-w-sm">
                  <p className="text-xs font-medium text-white/70 mb-4 leading-relaxed italic">
                    "The Titanium node has processed 12,400 content forge requests this month with zero neural drift."
                  </p>
                  <div className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-[9px] font-black uppercase tracking-widest opacity-50">System Stable</p>
                  </div>
               </div>
            </div>
         </Card>

         <Card className="p-12 rounded-[48px] border-border bg-card flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="space-y-2">
                  <h3 className="text-xl font-black italic tracking-tight uppercase font-display italic">Transaction History</h3>
                  <p className="text-xs font-medium text-muted-foreground">Neural ledger of compute allocation.</p>
               </div>
               <History className="w-6 h-6 text-muted opacity-30" />
            </div>
            
            <div className="space-y-4 mt-8">
               {[
                 { date: 'May 12, 2026', type: 'Pro Subscription', status: 'Settled', amount: '$49.00' },
                 { date: 'Apr 12, 2026', type: 'Pro Subscription', status: 'Settled', amount: '$49.00' },
                 { date: 'Mar 15, 2026', type: 'Token Refill', status: 'Settled', amount: '$20.00' },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-0 group cursor-pointer hover:translate-x-1 transition-transform">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-muted rounded-xl">
                          <CreditCard className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-sm font-bold">{item.type}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.date}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black">{item.amount}</p>
                       <p className="text-[9px] font-black uppercase text-emerald-500 tracking-widest uppercase">{item.status}</p>
                    </div>
                 </div>
               ))}
            </div>
         </Card>
      </div>
    </div>
  );
}
