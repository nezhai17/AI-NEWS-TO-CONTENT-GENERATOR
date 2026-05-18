import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  LayoutDashboard, 
  PenTool, 
  Settings, 
  Users, 
  Bell, 
  Search,
  Zap,
  LogOut,
  TrendingUp,
  Clock,
  ArrowUpRight,
  FolderOpen,
  Moon,
  Sun,
  ShieldCheck,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { useStore, Workspace } from '@/store/useStore';
import { workspaceService } from '@/lib/workspaceService';

import NotificationCenter from './NotificationCenter';
import { CommandPalette } from './CommandPalette';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Approval Portal', icon: ShieldCheck, href: '/approvals', badge: true },
  { label: 'Campaign Hub', icon: FolderOpen, href: '/campaigns' },
  { label: 'Content Studio', icon: PenTool, href: '/studio' },
  { label: 'Intelligence Strategy', icon: Target, href: '/strategy' },
  { label: 'Automations', icon: Zap, href: '/automations' },
  { label: 'Forge Calendar', icon: Clock, href: '/calendar' },
  { label: 'Capital Ledger', icon: BarChart3, href: '/billing' },
  { label: 'Neural Team', icon: Users, href: '/team' },
  { label: 'System Settings', icon: Settings, href: '/settings' },
];

export function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentWorkspace, workspaces, setWorkspaces, setCurrentWorkspace, approvals } = useStore();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    if (!user) return;
    
    // Subscribe to profile
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (!snap.exists() || !snap.data().onboardingComplete) {
        setNeedsOnboarding(true);
      } else {
        setNeedsOnboarding(false);
      }
    }, (err) => {
      console.warn("Profile sync node inhibited:", err.message);
    });

    // Subscribe to workspaces
    const unsubWS = workspaceService.getUserWorkspaces(user.uid, (wsList) => {
      setWorkspaces(wsList);
      if (wsList.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(wsList[0]);
      }
    });

    return () => {
      unsubProfile();
      unsubWS();
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <AnimatePresence>
        {needsOnboarding && (
          <OnboardingFlow onComplete={() => setNeedsOnboarding(false)} />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col z-20 overflow-hidden relative">
        <div className="p-8 pb-10 flex items-center gap-3 relative z-10">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/10"
          >
            <Zap className="text-primary-foreground w-6 h-6 fill-primary-foreground" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-tighter leading-none italic uppercase">SIGNALFORGE</span>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black tracking-[0.2em] text-muted-foreground uppercase">Core Alpha</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 relative z-10 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "group flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/10 translate-x-1" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-4 h-4 transition-transform duration-300", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground group-hover:scale-110")} />
                  <span className="tracking-tight">{item.label}</span>
                </div>
                {(item as any).badge && approvals.length > 0 && !isActive && (
                   <span className="w-5 h-5 rounded-lg bg-orange-500 text-[10px] font-black text-white flex items-center justify-center animate-bounce shadow-lg shadow-orange-500/20">
                     {approvals.length}
                   </span>
                )}
                {isActive && (
                  <motion.div layoutId="active-pill" className="w-1 h-4 bg-primary-foreground/30 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 relative z-10 border-t border-border">
          <div className="flex items-center gap-4 px-2">
            <div className="relative group cursor-pointer">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-orange-400 via-rose-400 to-blue-500 p-[2px] shadow-lg group-hover:scale-110 transition-transform duration-300">
                 <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden border-2 border-background">
                    {user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : <div className="text-[10px] font-black">OP</div>}
                 </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black truncate text-foreground tracking-tight">{user.displayName || 'Operator'}</p>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em]">Titanium Tier</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute inset-0 technical-grid opacity-[0.03] pointer-events-none" />

        {/* Header */}
        <header className="h-20 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-10 z-10 shrink-0">
          <div className="flex items-center flex-1 max-w-2xl gap-8">
            <CommandPalette />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl hover:bg-muted transition-all"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 p-1.5 pr-4 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border outline-none group">
                 <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-black shadow-lg shadow-black/10 group-hover:scale-105 transition-transform italic font-display">
                    {currentWorkspace?.name?.[0] || 'SF'}
                 </div>
                 <div className="text-left hidden xl:block">
                   <p className="text-xs font-black leading-none uppercase tracking-tight">{currentWorkspace?.name || 'Main Hub'}</p>
                   <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Enterprise</p>
                 </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-border bg-card">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-3 pt-3 pb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Workspaces</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {workspaces.map(ws => (
                    <DropdownMenuItem 
                      key={ws.id}
                      onClick={() => setCurrentWorkspace(ws)}
                      className={cn(
                        "rounded-xl py-3 px-4 focus:bg-muted cursor-pointer group",
                        currentWorkspace?.id === ws.id && "bg-muted"
                      )}
                    >
                      <div className="flex flex-col text-foreground">
                          <span className="text-sm font-black tracking-tight group-hover:translate-x-1 transition-transform">{ws.name}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{ws.ownerId === user?.uid ? 'Personal' : 'Team'}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem 
                    className="rounded-xl py-3 px-4 focus:bg-muted cursor-pointer text-primary"
                    onClick={() => navigate('/settings')}
                  >
                     <span className="text-sm font-black tracking-tight font-bold">+ New Workspace</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem 
                  className="rounded-xl py-3 px-4 text-rose-500 focus:bg-rose-500/10 focus:text-rose-600 cursor-pointer transition-all"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="text-sm font-black uppercase tracking-widest text-[10px]">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto z-0 custom-scrollbar">
          <div className="p-8 lg:p-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
