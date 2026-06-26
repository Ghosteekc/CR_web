import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError, OpponentEntry } from "../api/client";
import { DeckCard, ErrorState, LoadingState } from "../components/Common";

export function OpponentsPage() {
  const [opponents, setOpponents] = useState<OpponentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.getOpponents()
      .then(setOpponents)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <LoadingState text="Анализирую соперников..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="page">
      <h1>🎯 Колоды соперников</h1>
      <div className="list">
        {opponents.map((opp) => (
          <div key={opp.index} className="card">
            <div className="card-header">
              <strong>{opp.name}</strong>
              <span>{opp.won_against ? "✅ победа" : "❌ поражение"}</span>
            </div>
            <p className="meta">⚗️ {opp.avg_elixir} · ⚠️ {opp.threats.join(", ") || "нет WC"}</p>
            <DeckCard cards={opp.deck} />
            <Link to={`/counter/${opp.index}`} className="btn-link">
              ⚔️ Подобрать контр-колоду
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CounterListPage() {
  const [opponents, setOpponents] = useState<OpponentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getOpponents()
      .then(setOpponents)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState text="Загружаю соперников..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="page">
      <h1>⚔️ Контр-колоды</h1>
      <p className="meta">Выберите соперника</p>
      <div className="list">
        {opponents.map((opp) => (
          <Link key={opp.index} to={`/counter/${opp.index}`} className="btn-link block">
            {opp.name} — {opp.won_against ? "✅" : "❌"}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CounterPage() {
  const { index: indexStr } = useParams();
  const index = Number(indexStr);
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getCounter>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(index)) return;
    api.getCounter(index)
      .then(setData)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [index]);

  if (loading) return <LoadingState text="Подбираю контр-колоду..." />;
  if (error || !data) return <ErrorState message={error ?? "Не найдено"} />;

  return (
    <div className="page">
      <Link to="/opponents" className="back">← Назад</Link>
      <h1>⚔️ Контр vs {data.opponent_name}</h1>
      <section>
        <h3>Колода соперника</h3>
        <DeckCard cards={data.opponent_deck} />
      </section>
      <section>
        <h3>Рекомендуемая колода</h3>
        <DeckCard cards={data.counter_deck} />
      </section>
      <p className="meta">
        Счётчики на: {data.threats.join(", ") || "универсальный пул"}
        {data.preferred_cards.length > 0 && (
          <> · ⭐ {data.preferred_cards.join(", ")}</>
        )}
      </p>
    </div>
  );
}
