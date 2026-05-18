import { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  Trash2, 
  Check
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { subscribeToNotifications, markAsRead, Notification } from '@/lib/notifications';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToNotifications(user.uid, (newNotifications) => {
      setNotifications(newNotifications);
    });
    return () => unsubscribe();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    await markAsRead(user.uid, id);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative w-12 h-12 rounded-2xl hover:bg-[#F5F5F5] transition-all group flex items-center justify-center outline-none border-none">
        <Bell className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-black text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-2 rounded-[30px] shadow-2xl border-[#EEEEEE] max-h-[600px] overflow-y-auto flex flex-col bg-card custom-scrollbar">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Intelligence Feedback</p>
              <h3 className="text-sm font-black italic mt-1 text-foreground">Signal Stream</h3>
            </div>
            {unreadCount > 0 && (
               <div className="px-2 py-1 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest rounded-lg">
                  {unreadCount} New Signals
               </div>
            )}
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-border/50" />
          
            <AnimatePresence initial={false}>
              {notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                   <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground mb-4">
                      <Bell className="w-6 h-6" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#BBB]">Silence in the forge</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem 
                    key={n.id} 
                    className={cn(
                      "p-4 rounded-2xl focus:bg-muted cursor-pointer mb-1 mx-1 group",
                      !n.read ? "bg-card border border-border" : "opacity-60"
                    )}
                    onClick={() => handleMarkAsRead(n.id)}
                  >
                    <div className="flex gap-4 items-start w-full">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        n.type === 'success' ? "bg-emerald-50 text-emerald-500" : 
                        n.type === 'error' ? "bg-rose-50 text-rose-500" : 
                        n.type === 'warning' ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-500"
                      )}>
                        {getTypeIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-black uppercase tracking-tight truncate text-foreground">{n.title}</p>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed mt-1 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-3">
                          {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </AnimatePresence>

          {notifications.length > 0 && (
            <>
              <DropdownMenuSeparator className="bg-border/50" />
              <div className="p-2">
                <Button variant="ghost" className="w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:bg-primary hover:text-white transition-all">
                  Clear All Signals
                </Button>
              </div>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
