import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";
import { ToastProvider } from "./components/Toast";
import { AppProvider } from "./contexts/AppContext";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Workspace pages (inside AppShell)
import Overview from "./pages/Overview";
import Footprint from "./pages/Footprint";
import LogEntry from "./pages/LogEntry";          // multi-step Calculator
import Recommendations from "./pages/Recommendations";
import Benchmark from "./pages/Benchmark";
import Verifications from "./pages/Verifications";
import Reports from "./pages/Reports";
import Credential from "./pages/Credential";
import Cooperative from "./pages/Cooperative";
import Profile from "./pages/Profile";
import Holdings from "./pages/Holdings";
import HoldingDetail from "./pages/HoldingDetail";
import PublicProof from "./pages/PublicProof";

import "./theme/global.css";

/** All protected workspace pages share AppProvider (data) + AppShell (layout). */
function WorkspaceLayout() {
  return (
    <AppProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </AppProvider>
  );
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
        {/* Public routes */}
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/proof/:txId" element={<PublicProof />} />

        {/* Protected workspace — auth guard + data context + sidebar shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<WorkspaceLayout />}>
            <Route path="/dashboard"       element={<Overview />} />
            <Route path="/footprint"       element={<Footprint />} />
            <Route path="/calculator"      element={<LogEntry />} />
            <Route path="/log-entry"       element={<LogEntry />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/benchmark"       element={<Benchmark />} />
            <Route path="/verifications"   element={<Verifications />} />
            <Route path="/reports"         element={<Reports />} />
            <Route path="/credential"      element={<Credential />} />
            <Route path="/cooperative"     element={<Cooperative />} />
            <Route path="/profile"         element={<Profile />} />
            <Route path="/holdings"        element={<Holdings />} />
            <Route path="/holding/:id"     element={<HoldingDetail />} />
          </Route>
        </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
