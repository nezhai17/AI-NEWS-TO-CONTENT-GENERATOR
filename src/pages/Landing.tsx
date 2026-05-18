import { motion, useScroll, useTransform } from "motion/react";
import { 
  Zap, 
  ArrowRight, 
  Shield, 
  Globe, 
  Layers, 
  BarChart3, 
  MessageSquare,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Target,
  FileText,
  Youtube,
  Rss,
  CheckCircle2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { useRef } from "react";

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.21, 1.11, 0.81, 0.99] }}
    className="group p-8 rounded-[32px] bg-white border border-[#F0F0F0] hover:border-black transition-all duration-500 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" />
    </div>
    <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-black/10">
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold tracking-tight mb-3 font-display uppercase">{title}</h3>
    <p className="text-[#666] leading-relaxed text-sm">{description}</p>
  </motion.div>
);

const PlatformIcon = ({ icon: Icon, label }: any) => (
  <div className="flex flex-col items-center gap-3">
    <div className="w-14 h-14 rounded-2xl bg-white border border-[#EEE] flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
      <Icon className="w-6 h-6 text-[#999] group-hover:text-black transition-colors" />
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-[#BBB]">{label}</span>
  </div>
);

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  const handleStart = () => {
    if (user) navigate("/dashboard");
    else navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#F0F0F0]/50 bg-white/70 backdrop-blur-xl px-10 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <Zap className="text-white w-6 h-6 fill-white" />
          </div>
          <span className="font-display font-black text-xl tracking-tighter uppercase italic">SignalForge</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          <a href="#features" className="text-[10px] font-black uppercase tracking-widest text-[#666] hover:text-black transition-colors">Architecture</a>
          <a href="#solutions" className="text-[10px] font-black uppercase tracking-widest text-[#666] hover:text-black transition-colors">Intelligence</a>
          <a href="#workflow" className="text-[10px] font-black uppercase tracking-widest text-[#666] hover:text-black transition-colors">Core Systems</a>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/auth")}
            className="text-[10px] font-black uppercase tracking-widest px-6 h-10 rounded-full"
          >
            Access Matrix
          </Button>
          <Button 
            onClick={handleStart}
            className="bg-black text-white rounded-full h-10 px-8 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all"
          >
            Initialize Protocol
          </Button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section ref={heroRef} className="relative pt-40 pb-20 px-6 min-h-screen flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 technical-grid opacity-[0.03] pointer-events-none" />
          
          {/* Animated Background Elements */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-orange-100 rounded-full blur-[120px] mix-blend-multiply" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] mix-blend-multiply" 
          />

          <motion.div 
            style={{ opacity, scale, y }}
            className="relative z-10 text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full border border-black/5 mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333]">V3.2 Engine Initialized</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase mb-10 font-display italic"
            >
              Convert Raw Intel <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-[#666] to-black bg-[length:200%_auto] animate-text-shimmer">
                Into Content Gold
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-2xl text-[#666] max-w-3xl mx-auto leading-relaxed mb-14 font-medium"
            >
              The world's most advanced AI architecture for transforming complex reports, videos, and articles into viral social assets. Built for elite creators and enterprise growth teams.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Button 
                size="lg"
                onClick={handleStart}
                className="h-20 px-12 bg-black text-white rounded-3xl font-display font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all group gap-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Start Forging
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="h-20 px-12 border-[#EEE] bg-white rounded-3xl font-display font-black uppercase tracking-[0.2em] text-xs hover:bg-[#F9F9F9] transition-all"
              >
                Watch Blueprint
              </Button>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1, duration: 1 }}
               className="mt-24 pt-10 border-t border-[#F0F0F0]"
            >
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BBB] mb-10">Trusted by Global Growth Nodes</p>
               <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                  <div className="font-display font-black text-2xl tracking-tighter underline decoration-4 decoration-orange-500 italic">SERIES A</div>
                  <div className="font-display font-black text-2xl tracking-tighter italic">VENTURE.CO</div>
                  <div className="font-display font-black text-2xl tracking-tighter italic line-through">OLD WAY</div>
                  <div className="font-display font-black text-2xl tracking-tighter decoration-double underline italic">FORGE.XO</div>
               </div>
            </motion.div>
          </motion.div>

          {/* Floating UI Elements */}
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="absolute right-[-10%] top-1/2 -translate-y-1/2 hidden xl:block w-[400px]"
          >
            <div className="p-8 bg-white/70 backdrop-blur-2xl rounded-[40px] border border-[#EEE] shadow-2xl rotate-3">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-3 h-3 rounded-full bg-orange-500" />
                 <div className="w-3 h-3 rounded-full bg-emerald-500" />
                 <div className="w-3 h-3 rounded-full bg-blue-500" />
               </div>
               <div className="space-y-4">
                 <div className="h-4 w-3/4 bg-[#F5F5F5] rounded-full" />
                 <div className="h-4 w-full bg-[#F5F5F5] rounded-full" />
                 <div className="h-4 w-1/2 bg-[#F5F5F5] rounded-full" />
                 <div className="pt-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#BBB]">
                    <span>Synthesis Progress</span>
                    <span>89%</span>
                 </div>
                 <div className="h-2 w-full bg-[#F5F5F5] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '89%' }}
                      transition={{ duration: 2, delay: 1 }}
                      className="h-full bg-black shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                    />
                 </div>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-40 bg-white relative">
           <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-24 max-w-3xl mx-auto">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 mb-6">Multi-Vector Processing</h2>
                 <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase font-display italic mb-8">One Core, Total Content Dominance</h3>
                 <p className="text-[#666] font-medium leading-relaxed">
                   SignalForge isn't just an AI writer. It's a strategic synthesis engine that understands deep context across multiple input vectors.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 <FeatureCard 
                    icon={Target}
                    title="Strategic Hooks"
                    description="Our model analyzes high-performance hooks across 50M+ data points to ensure your first sentence stops the scroll."
                    delay={0.1}
                 />
                 <FeatureCard 
                    icon={TrendingUp}
                    title="Virality Logic"
                    description="Predictive engagement scoring tells you exactly how your content will perform before you hit 'Publish'."
                    delay={0.2}
                 />
                 <FeatureCard 
                    icon={Shield}
                    title="Brand Safe"
                    description="Enterprise-grade filtering ensures your AI outputs always adhere to your brand's strict narrative guidelines."
                    delay={0.3}
                 />
                 <FeatureCard 
                    icon={Globe}
                    title="Global Reach"
                    description="Simultaneously generate localized variants for different markets, cultures, and platforms."
                    delay={0.4}
                 />
              </div>
           </div>
        </section>

        {/* Multi-Input Showcase */}
        <section className="py-40 bg-[#F9F9F9] border-y border-[#F0F0F0]">
           <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                 <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6">Omni-Ingestion Architecture</h2>
                 <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase font-display italic mb-10 leading-none">Feed the Forge. <br/>Any Source.</h3>
                 <p className="text-[#666] font-medium leading-relaxed mb-12">
                   Directly ingest intelligence from any corner of the web. Our neural scrapers and parsers extract the atomic essence of any document or stream.
                 </p>
                 
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-[#EEE]">
                    <PlatformIcon icon={Youtube} label="YouTube" />
                    <PlatformIcon icon={FileText} label="PDFs" />
                    <PlatformIcon icon={Globe} label="Web" />
                    <PlatformIcon icon={Rss} label="RSS" />
                 </div>
              </div>

              <div className="relative">
                 <div className="aspect-square bg-white rounded-[60px] border border-[#EEE] shadow-2xl p-10 flex flex-col relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
                    <div className="flex-1 space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white font-black text-xs">SF</div>
                          <div className="flex-1">
                             <div className="h-4 w-2/3 bg-[#F5F5F5] rounded-full mb-2" />
                             <div className="h-3 w-1/3 bg-[#F5F5F5] rounded-full" />
                          </div>
                       </div>
                       <div className="space-y-3">
                          {[1,2,3,4,5].map(i => (
                            <motion.div 
                              key={i}
                              initial={{ width: 0 }}
                              whileInView={{ width: '100%' }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className="h-4 bg-[#F5F5F5] rounded-full" 
                            />
                          ))}
                       </div>
                    </div>
                    
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="mt-10 p-6 bg-black text-white rounded-3xl flex items-center justify-between shadow-2xl"
                    >
                       <div className="flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-orange-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Optimizing Matrix...</span>
                       </div>
                       <ChevronRight className="w-5 h-5" />
                    </motion.div>
                 </div>
                 
                 {/* Decorative elements */}
                 <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50" />
                 <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50" />
              </div>
           </div>
        </section>

        {/* CTAction Section */}
        <section className="py-40 px-6 relative overflow-hidden">
           <div className="absolute inset-0 bg-black" />
           <div className="absolute inset-0 technical-grid opacity-[0.05] pointer-events-none" />
           
           <div className="relative z-10 max-w-4xl mx-auto text-center">
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic font-display mb-10">Ready to Upgrade <br/>Your Logic Core?</h3>
              <p className="text-[#999] text-xl font-medium mb-16">
                 Join 2,500+ elite creators and growth operators building the future of content.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                 <Button 
                   size="lg"
                   onClick={handleStart}
                   className="h-20 px-12 bg-white text-black rounded-3xl font-display font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-white/10 hover:scale-105 active:scale-95 transition-all"
                 >
                    Get Protocol Access
                 </Button>
                 <div className="flex flex-col items-center">
                    <div className="flex -space-x-4 mb-3">
                       {[1,2,3,4].map(i => (
                         <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-[#333] flex items-center justify-center text-[10px] font-bold text-white">
                            OP
                         </div>
                       ))}
                       <div className="w-10 h-10 rounded-full border-2 border-black bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white">
                          +2k
                       </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#666]">Operators Online Now</span>
                 </div>
              </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="py-20 px-10 border-t border-[#F0F0F0] bg-white">
           <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
              <div className="col-span-2">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                       <Zap className="text-white w-5 h-5 fill-white" />
                    </div>
                    <span className="font-display font-black text-lg tracking-tighter uppercase italic">SignalForge</span>
                 </div>
                 <p className="text-sm text-[#666] max-w-sm font-medium leading-relaxed">
                    The autonomous content synthesis matrix for the new media age. Built on top of Gemini Flash architectures.
                 </p>
              </div>
              
              <div className="grid grid-cols-2 gap-10 col-span-2">
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-black">System Systems</h4>
                    <ul className="space-y-4">
                       <li><a href="#" className="text-xs font-bold text-[#999] hover:text-black transition-colors">Documentation</a></li>
                       <li><a href="#" className="text-xs font-bold text-[#999] hover:text-black transition-colors">API Core</a></li>
                       <li><a href="#" className="text-xs font-bold text-[#999] hover:text-black transition-colors">Nodes</a></li>
                    </ul>
                 </div>
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-black">Protocol</h4>
                    <ul className="space-y-4">
                       <li><a href="#" className="text-xs font-bold text-[#999] hover:text-black transition-colors">Security</a></li>
                       <li><a href="#" className="text-xs font-bold text-[#999] hover:text-black transition-colors">Ethics</a></li>
                       <li><a href="#" className="text-xs font-bold text-[#999] hover:text-black transition-colors">Legal</a></li>
                    </ul>
                 </div>
              </div>
           </div>
           
           <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-[#F5F5F5] flex flex-col sm:flex-row justify-between items-center gap-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#BBB]">© 2026 SignalForge AI. Licensed under Antigravity Protocol.</span>
              <div className="flex gap-6">
                 <div className="w-2 h-2 rounded-full bg-[#EEE]" />
                 <div className="w-2 h-2 rounded-full bg-[#EEE]" />
                 <div className="w-2 h-2 rounded-full bg-[#EEE]" />
              </div>
           </div>
        </footer>
      </main>
    </div>
  );
}
