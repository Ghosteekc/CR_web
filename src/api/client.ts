const API_BASE = import.meta.env.VITE_API_URL ?? "";

function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? "";
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string): Promise<T> {
  const initData = getInitData();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "X-Telegram-Init-Data": initData,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(body.detail ?? "Request failed", res.status);
  }
  return res.json();
}

export interface Profile {
  player_tag: string | null;
  player_name: string | null;
  trophies: number | null;
  exp_level: number | null;
  arena_name: string | null;
  subscription: { active: boolean; expires_at: string | null; trial_used: boolean };
}

export interface BattleSummary {
  index: number;
  opponent_name: string;
  won: boolean;
  trophy_change: number;
  matchup_score: number | null;
}

export interface BattleDetail {
  index: number;
  won: boolean;
  opponent_name: string;
  trophy_change: number;
  matchup_score: number;
  user_deck: string[];
  opponent_deck: string[];
  user_stats: { avg_elixir: number; win_conditions: string[]; spells: string[] };
  opponent_stats: { avg_elixir: number; win_conditions: string[]; spells: string[] };
  reasons: string[];
  opponent_threats: string[];
}

export interface WinrateEntry {
  cards: string[];
  wins: number;
  losses: number;
  total: number;
  winrate: number;
}

export interface OpponentEntry {
  index: number;
  name: string;
  deck: string[];
  threats: string[];
  avg_elixir: number;
  won_against: boolean;
}

export interface CounterDeck {
  opponent_name: string;
  opponent_deck: string[];
  counter_deck: string[];
  threats: string[];
  preferred_cards: string[];
}

export interface CustomizeResult {
  original: string[];
  customized: string[];
  issues: string[];
  avg_elixir: number;
}

export interface SynergyResult {
  core: string[];
  deck: string[];
  synergies: Record<string, string[]>;
  avg_elixir: number;
}

export interface StatsResult {
  player_tag: string;
  total: number;
  wins: number;
  losses: number;
  winrate: number;
  top_decks: { cards: string[]; total: number; winrate: number }[];
  top_cards: { name: string; count: number }[];
  win_streak: number;
  loss_streak: number;
}

export interface LastBattleSummary {
  won: boolean;
  opponent_name: string;
  trophy_change: number;
  matchup_score: number;
  top_reason: string | null;
}

export interface RecommendationsResponse {
  current_deck: string[];
  avg_elixir: number;
  issues: string[];
  customized_deck: string[];
  synergy_core: string[];
  synergy_deck: string[];
  last_battle: LastBattleSummary | null;
}

export const api = {
  getProfile: () => request<Profile>("/api/me"),
  getBattles: () => request<{ battles: BattleSummary[]; cached_total: number | null; cached_winrate: number | null }>("/api/battles"),
  getBattle: (index: number) => request<BattleDetail>(`/api/battles/${index}`),
  getWinrates: () => request<WinrateEntry[]>("/api/winrates"),
  getOpponents: () => request<OpponentEntry[]>("/api/opponents"),
  getCounter: (index: number) => request<CounterDeck>(`/api/opponents/${index}/counter`),
  getCustomize: () => request<CustomizeResult>("/api/customize"),
  getSynergy: () => request<SynergyResult>("/api/synergy"),
  getStats: () => request<StatsResult>("/api/stats"),
  getRecommendations: () => request<RecommendationsResponse>("/api/recommendations"),
};
