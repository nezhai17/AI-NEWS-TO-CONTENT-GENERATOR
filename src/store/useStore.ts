import { create } from 'zustand';

export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  memberIds?: string[];
}

export interface TeamMember {
  userId: string;
  email: string;
  role: Role;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
}

export interface Project {
  id: string;
  name: string;
  title?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: any;
  workspaceId: string;
  campaignId?: string;
  sourceUrl?: string;
  sourceText?: string;
}

export interface ContentPiece {
  id: string;
  projectId: string;
  platform: string;
  content: string;
  workflow?: { agent: string; output: string }[];
}

export interface Approval {
  id: string;
  type: 'publish' | 'campaign' | 'strategy' | 'budget' | 'deletion';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'scheduled';
  data: any;
  createdAt: any;
}

export interface Subscription {
  planId: string;
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: any;
}

export interface Automation {
  id: string;
  name: string;
  trigger: string;
  steps: any[];
  isActive: boolean;
}

interface ForgeStore {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  members: TeamMember[];
  projects: Project[];
  campaigns: Campaign[];
  approvals: Approval[];
  automations: Automation[];
  subscription: Subscription | null;
  trends: string;
  isSyncingTrends: boolean;
  
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setMembers: (members: TeamMember[]) => void;
  setProjects: (projects: Project[]) => void;
  setCampaigns: (campaigns: Campaign[]) => void;
  setApprovals: (approvals: Approval[]) => void;
  setAutomations: (automations: Automation[]) => void;
  setSubscription: (sub: Subscription | null) => void;
  setTrends: (trends: string) => void;
  setIsSyncingTrends: (isSyncing: boolean) => void;
  
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
}

export const useStore = create<ForgeStore>((set) => ({
  currentWorkspace: null,
  workspaces: [],
  members: [],
  projects: [],
  campaigns: [],
  approvals: [],
  automations: [],
  subscription: null,
  trends: "",
  isSyncingTrends: false,
  
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  setWorkspaces: (workspaces) => set({ workspaces }),
  setMembers: (members) => set({ members }),
  setProjects: (projects) => set({ projects }),
  setCampaigns: (campaigns) => set({ campaigns }),
  setApprovals: (approvals) => set({ approvals }),
  setAutomations: (automations) => set({ automations }),
  setSubscription: (subscription) => set({ subscription }),
  setTrends: (trends) => set({ trends }),
  setIsSyncingTrends: (isSyncing) => set({ isSyncingTrends: isSyncing }),
  
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p)
  })),
}));
