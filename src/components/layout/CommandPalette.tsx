import * as React from "react"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Zap,
  Search,
  MessageSquare,
  History,
  TrendingUp,
  LayoutDashboard,
  Target,
  Shield
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <>
      <div 
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 h-10 w-64 bg-muted/50 rounded-xl border border-border/50 hover:border-border cursor-pointer transition-all group"
      >
        <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Search anything...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/studio"))}>
              <Zap className="mr-2 h-4 w-4" />
              <span>Content Studio</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/strategy"))}>
              <Target className="mr-2 h-4 w-4" />
              <span>Campaign Strategy</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/analytics"))}>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/team"))}>
              <Smile className="mr-2 h-4 w-4" />
              <span>Neural Team</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/admin"))}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Kernel Admin</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Intelligence">
            <CommandItem onSelect={() => runCommand(() => navigate("/history"))}>
              <History className="mr-2 h-4 w-4" />
              <span>History Archive</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>System Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
