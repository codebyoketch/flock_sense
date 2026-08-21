import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Holdings from "./pages/Holdings";
import HoldingDetail from "./pages/HoldingDetail";
import LogEntry from "./pages/LogEntry";
import Verifications from "./pages/Verifications";
import Profile from "./pages/Profile";
import "./theme/global.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/holding/:id" element={<HoldingDetail />} />
          <Route path="/log-entry" element={<LogEntry />} />
          <Route path="/verifications" element={<Verifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;