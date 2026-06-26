import { NavLink, Route, Routes } from "react-router-dom";
import { SubscriptionGate } from "./components/Common";
import { useProfile, useTelegram } from "./hooks/useTelegram";
import { HomePage } from "./pages/HomePage";
import { BattleDetailPage, BattlesPage } from "./pages/BattlesPage";
import { CounterListPage, CounterPage, OpponentsPage } from "./pages/OpponentsPage";
import {
  CustomizePage,
  StatsPage,
  SynergyPage,
  WinratePage,
} from "./pages/OtherPages";
import { LoadingState } from "./components/Common";

function AppContent() {
  const { profile, loading } = useProfile();

  if (loading) return <LoadingState />;

  return (
    <SubscriptionGate profile={profile}>
      <Routes>
        <Route path="/" element={<HomePage profile={profile!} />} />
        <Route path="/battles" element={<BattlesPage />} />
        <Route path="/battles/:index" element={<BattleDetailPage />} />
        <Route path="/opponents" element={<OpponentsPage />} />
        <Route path="/counter" element={<CounterListPage />} />
        <Route path="/counter/:index" element={<CounterPage />} />
        <Route path="/winrate" element={<WinratePage />} />
        <Route path="/customize" element={<CustomizePage />} />
        <Route path="/synergy" element={<SynergyPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </SubscriptionGate>
  );
}

export default function App() {
  useTelegram();

  return (
    <div className="app">
      <main className="content">
        <AppContent />
      </main>
      <nav className="tab-bar">
        <NavLink to="/">🏠</NavLink>
        <NavLink to="/battles">📊</NavLink>
        <NavLink to="/opponents">🎯</NavLink>
        <NavLink to="/winrate">📈</NavLink>
        <NavLink to="/counter">⚔️</NavLink>
        <NavLink to="/customize">🔧</NavLink>
        <NavLink to="/synergy">✨</NavLink>
        <NavLink to="/stats">📋</NavLink>
      </nav>
    </div>
  );
}
