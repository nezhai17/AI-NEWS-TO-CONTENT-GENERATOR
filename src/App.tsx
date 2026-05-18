import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ContentStudio from './pages/ContentStudio';
import Strategy from './pages/Strategy';
import Calendar from './pages/Calendar';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Team from './pages/Team';
import Admin from './pages/Admin';
import Billing from './pages/Billing';
import Automations from './pages/Automations';
import ApprovalCenter from './pages/ApprovalCenter';
import { Shell } from './components/layout/Shell';
import { TooltipProvider } from './components/ui/tooltip';
import { AuthProvider } from './lib/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            {/* App Routes */}
            <Route path="/dashboard" element={<Shell><Dashboard /></Shell>} />
            <Route path="/billing" element={<Shell><Billing /></Shell>} />
            <Route path="/automations" element={<Shell><Automations /></Shell>} />
            <Route path="/studio" element={<Shell><ContentStudio /></Shell>} />
            <Route path="/strategy" element={<Shell><Strategy /></Shell>} />
            <Route path="/calendar" element={<Shell><Calendar /></Shell>} />
            <Route path="/campaigns" element={<Shell><Campaigns /></Shell>} />
            <Route path="/campaigns/:id" element={<Shell><CampaignDetail /></Shell>} />
            <Route path="/analytics" element={<Shell><Analytics /></Shell>} />
            <Route path="/settings" element={<Shell><Settings /></Shell>} />
            <Route path="/team" element={<Shell><Team /></Shell>} />
            <Route path="/admin" element={<Shell><Admin /></Shell>} />
            <Route path="/approvals" element={<Shell><ApprovalCenter /></Shell>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  );
}
