import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Loader2, ArrowLeft, Mail, Lock, User, Github, Sparkles, Globe, Shield } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'sonner';

export default function Auth() {
  const { login, loginEmail, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginEmail(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.name);
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await login();
      navigate('/dashboard');
    } catch (e) {
      toast.error('Google synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Left Column: Brand & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative flex-col justify-between p-16 overflow-hidden">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-40">
           <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] technical-grid z-0" />
           <motion.div 
             animate={{ 
               scale: [1, 1.2, 1],
               rotate: [0, 10, -10, 0]
             }}
             transition={{ duration: 20, repeat: Infinity }}
             className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px]" 
           />
           <motion.div 
             animate={{ 
               scale: [1.2, 1, 1.2],
               rotate: [0, -15, 15, 0]
             }}
             transition={{ duration: 25, repeat: Infinity }}
             className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" 
           />
        </div>

        <div className="relative z-10">
           <Link to="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                 <Zap className="w-6 h-6 fill-black" />
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter text-white italic font-display">SignalForge AI</span>
           </Link>
        </div>

        <div className="relative z-10 max-w-xl">
           <div className="space-y-8">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
             >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-8 backdrop-blur-md">
                   <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Neural Content Protocol v4.0</span>
                </div>
                <h2 className="text-6xl font-black tracking-tighter text-white uppercase italic leading-[0.9] font-display italic-serif mb-8">
                  Forge your digital <span className="text-transparent outline-white" style={{ WebkitTextStroke: '1px white' }}>authority</span>.
                </h2>
                <p className="text-white/60 font-medium text-lg leading-relaxed">
                  Join 10,000+ top creators and enterprise leaders using SignalForge to synchronize their intelligence across the global signal mesh.
                </p>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.4 }}
               className="grid grid-cols-2 gap-8 py-10"
             >
                {[
                  { label: 'Latency', val: '< 200ms', icon: Globe },
                  { label: 'Encryption', val: 'AES-256', icon: Shield }
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex items-center gap-3">
                        <stat.icon className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{stat.label}</span>
                     </div>
                     <p className="text-xl font-bold text-white font-mono">{stat.val}</p>
                  </div>
                ))}
             </motion.div>
           </div>
        </div>

        <div className="relative z-10">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">© 2026 SignalForge Laboratory. All Protocol Rights Reserved.</p>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-20 relative bg-background">
         <div className="absolute inset-0 technical-grid opacity-[0.02] lg:hidden" />
         
         <div className="w-full max-w-md relative z-10">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-10"
            >
              <div className="flex flex-col items-center lg:items-start">
                 <div className="w-16 h-16 bg-primary text-primary-foreground rounded-[24px] flex items-center justify-center shadow-2xl mb-8 lg:hidden">
                    <Zap className="w-8 h-8 fill-primary-foreground" />
                 </div>
                 <h1 className="text-4xl font-black tracking-tighter uppercase italic font-display leading-tight">{mode === 'login' ? 'Sync Identity' : 'Create Protocol'}</h1>
                 <p className="text-muted-foreground font-medium mt-2">Initialize your neural access credentials.</p>
              </div>

              <div className="space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={handleGoogle} 
                      disabled={loading}
                      className="h-14 rounded-2xl border-border font-black text-[10px] uppercase tracking-widest gap-3 shadow-sm hover:bg-muted transition-all"
                    >
                       <svg className="w-4 h-4" viewBox="0 0 24 24">
                         <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                         <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                         <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                         <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                       </svg>
                       Google
                    </Button>
                    <Button 
                      variant="outline" 
                      disabled={loading}
                      className="h-14 rounded-2xl border-border font-black text-[10px] uppercase tracking-widest gap-3 shadow-sm hover:bg-muted transition-all"
                    >
                       <Github className="w-4 h-4" />
                       Github
                    </Button>
                 </div>

                 <div className="relative flex items-center gap-4">
                    <div className="flex-1 h-[1px] bg-border" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-background px-4">Secure Transfer</span>
                    <div className="flex-1 h-[1px] bg-border" />
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-6">
                    <AnimatePresence mode="wait">
                      {mode === 'signup' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                           <label className="text-[10px] font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                             <User className="w-3 h-3" />
                             Identifier Name
                           </label>
                           <Input 
                             required
                             value={formData.name}
                             onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                             className="h-14 rounded-2xl bg-muted/30 border-border focus-visible:ring-primary font-medium"
                             placeholder="Operator ID"
                           />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                         <Mail className="w-3 h-3" />
                         Email Signal
                       </label>
                       <Input 
                         required
                         type="email"
                         value={formData.email}
                         onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                         className="h-14 rounded-2xl bg-muted/30 border-border focus-visible:ring-primary font-medium"
                         placeholder="intelligence@signalforge.ai"
                       />
                    </div>

                    <div className="space-y-3">
                       <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                            <Lock className="w-3 h-3" />
                            Security Key
                          </label>
                          {mode === 'login' && (
                            <Link to="/forgot-password" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">Forgot?</Link>
                          )}
                       </div>
                       <Input 
                         required
                         type="password"
                         value={formData.password}
                         onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                         className="h-14 rounded-2xl bg-muted/30 border-border focus-visible:ring-primary font-medium"
                         placeholder="••••••••"
                       />
                    </div>

                    <Button 
                      disabled={loading}
                      className="w-full h-16 bg-primary text-primary-foreground rounded-[20px] shadow-2xl shadow-primary/20 font-display font-black uppercase tracking-[0.2em] text-[11px] gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-primary-foreground" />}
                      {mode === 'login' ? 'Sync Identity' : 'Forge Protocol'}
                    </Button>
                 </form>

                 <div className="text-center pt-8 border-t border-border">
                    <button 
                      onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                      className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {mode === 'login' ? "New Operator? Create Protocol" : "Existing Identity? Sync Node"}
                    </button>
                 </div>
              </div>
            </motion.div>
         </div>
      </div>
    </div>
  );
}
