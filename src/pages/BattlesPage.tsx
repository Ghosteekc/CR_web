import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError, BattleDetail, BattleSummary } from "../api/client";
import { BattleCard, ErrorState, LoadingState } from "../components/Common";

export function BattlesPage() {
  const [battles, setBattles] = useState<BattleSummary[]>([]);
  const [meta, setMeta] = useState<{ total: number | null; wr: number | null }>({ total: null, wr: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.getBattles()
      .then((data) => {
        setBattles(data.battles);
        setMeta({ total: data.cached_total, wr: data.cached_winrate });
      })
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <LoadingState text="Загружаю бои..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="page">
      <h1>📊 Анализ боёв</h1>
      {meta.total !== null && (
        <p className="meta">Сохранено: {meta.total} боёв, WR {meta.wr}%</p>
      )}
      <div className="list">
        {battles.map((b) => (
          <Link key={b.index} to={`/battles/${b.index}`}>
            <BattleCard
              opponent={b.opponent_name}
              won={b.won}
              trophyChange={b.trophy_change}
              matchupScore={b.matchup_score}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BattleDetailPage() {
  const { index } = useParams();
  const [battle, setBattle] = useState<BattleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const idx = Number(index);
    if (Number.isNaN(idx)) return;
    api.getBattle(idx)
      .then(setBattle)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [index]);

  if (loading) return <LoadingState />;
  if (error || !battle) return <ErrorState message={error ?? "Бой не найден"} />;

  return (
    <div className="page">
      <Link to="/battles" className="back">← Назад</Link>
      <h1>{battle.won ? "🏆 Победа" : "💔 Поражение"} vs {battle.opponent_name}</h1>
      <p className="meta">
        {battle.trophy_change >= 0 ? "+" : ""}{battle.trophy_change} 🏆 · Матчап {battle.matchup_score}/100
      </p>
      <section>
        <h3>Ваша колода ({battle.user_stats.avg_elixir} ⚗️)</h3>
        <p>{battle.user_deck.join(", ")}</p>
      </section>
      <section>
        <h3>Колода соперника ({battle.opponent_stats.avg_elixir} ⚗️)</h3>
        <p>{battle.opponent_deck.join(", ")}</p>
      </section>
      <section>
        <h3>Анализ</h3>
        <ul className="reasons">
          {battle.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </section>
      {battle.opponent_threats.length > 0 && (
        <p className="threats">⚠️ Угрозы: {battle.opponent_threats.join(", ")}</p>
      )}
    </div>
  );
}
