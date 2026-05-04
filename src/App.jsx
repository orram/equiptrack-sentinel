import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './layout.jsx';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import Soldiers from './pages/Soldiers';
import DataHealth from './pages/DataHealth';
import AssignmentTool from './pages/AssignmentTool';
import DocumentGenerator from './pages/DocumentGenerator';
import ReturnTool from './pages/ReturnTool';
import WeaponControlTable from './pages/WeaponControlTable';
import EquipmentControlTable from './pages/EquipmentControlTable';
import AmralControlTable from './pages/AmralControlTable';
import StaffIssueTool from './pages/StaffIssueTool';
import BulkRepairTool from './pages/BulkRepairTool';
import Settings from './pages/Settings';
import Inventory from './pages/Inventory';
import UserProfile from './pages/UserProfile';
import SupplantingItems from './pages/SupplantingItems';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout><Outlet /></Layout>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Equipment" element={<Equipment />} />
        <Route path="/Soldiers" element={<Soldiers />} />
        <Route path="/DataHealth" element={<DataHealth />} />
        <Route path="/AssignmentTool" element={<AssignmentTool />} />
        <Route path="/DocumentGenerator" element={<DocumentGenerator />} />
        <Route path="/ReturnTool" element={<ReturnTool />} />
        <Route path="/WeaponControlTable" element={<WeaponControlTable />} />
        <Route path="/EquipmentControlTable" element={<EquipmentControlTable />} />
        <Route path="/AmralControlTable" element={<AmralControlTable />} />
        <Route path="/StaffIssueTool" element={<StaffIssueTool />} />
        <Route path="/BulkRepairTool" element={<BulkRepairTool />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/Inventory" element={<Inventory />} />
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/SupplantingItems" element={<SupplantingItems />} />
        {/* Add your page Route elements here */}
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App