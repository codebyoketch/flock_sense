import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Holdings from "./pages/Holdings";
import HoldingDetail from "./pages/HoldingDetail";
import LogEntry from "./pages/LogEntry";
import Verifications from "./pages/Verifications";
import Profile from "./pages/Profile";
import "./styles/pages.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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