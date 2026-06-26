import { useEffect, useState } from "react";
import { api, ApiError, WinrateEntry } from "../api/client";
import { DeckCard, ErrorState, LoadingState } from "../components/Common";

function wrEmoji(wr: number) {
  if (wr >= 55) return "🟢";
  if (wr >= 45) return "🟡";
  return "🔴";
}

export function WinratePage() {
  const [entries, setEntries] = useState<WinrateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getWinrates()
      .then(setEntries)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState text="Считаю винрейт..." />;
  if (error) return <ErrorState message={error} />;
  if (!entries.length) return <div className="page"><p>Недостаточно данных.</p></div>;

  return (
    <div className="page">
      <h1>📈 Винрейт колод</h1>
      <div className="list">
        {entries.map((e, i) => (
          <div key={i} className="card">
            <div className="card-header">
              <span>{wrEmoji(e.winrate)} <strong>{e.winrate}%</strong></span>
              <span>{e.wins}W / {e.losses}L</span>
            </div>
            <DeckCard cards={e.cards} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomizePage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getCustomize>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getCustomize()
      .then(setData)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState text="Анализирую колоду..." />;
  if (error || !data) return <ErrorState message={error ?? "Нет данных"} />;

  return (
    <div className="page">
      <h1>🔧 Кастомизация колоды</h1>
      <p className="meta">⚗️ Средний эликсир: {data.avg_elixir}</p>
      <section>
        <h3>Было</h3>
        <DeckCard cards={data.original} />
      </section>
      <section>
        <h3>Стало</h3>
        <DeckCard cards={data.customized} />
      </section>
      <section>
        <h3>Изменения</h3>
        <ul className="reasons">
          {(data.issues.length ? data.issues : ["✅ Колода уже оптимальна"]).map((issue, i) => (
            <li key={i}>{issue}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function SynergyPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getSynergy>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getSynergy()
      .then(setData)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState text="Строю колоду..." />;
  if (error || !data) return <ErrorState message={error ?? "Нет данных"} />;

  return (
    <div className="page">
      <h1>✨ Синергии</h1>
      <p className="meta">⭐ Основа: {data.core.join(", ")} · ⚗️ {data.avg_elixir}</p>
      <section>
        <h3>Рекомендуемая колода</h3>
        <DeckCard cards={data.deck} />
      </section>
      <section>
        <h3>Синергии</h3>
        <ul className="reasons">
          {Object.entries(data.synergies).map(([card, syns]) =>
            syns.length ? (
              <li key={card}>{card} → {syns.join(", ")}</li>
            ) : null
          )}
        </ul>
      </section>
    </div>
  );
}

export function StatsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getStats()
      .then(setData)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState text="Загружаю статистику..." />;
  if (error || !data) return <ErrorState message={error ?? "Нет данных"} />;

  return (
    <div className="page">
      <h1>📊 Статистика</h1>
      <p className="meta">{data.player_tag}</p>
      <div className="stats-grid">
        <div className="stat-box"><span>{data.total}</span> боёв</div>
        <div className="stat-box"><span>{data.wins}W</span> / {data.losses}L</div>
        <div className="stat-box"><span>{data.winrate}%</span> WR</div>
      </div>
      {(data.win_streak > 0 || data.loss_streak > 0) && (
        <p className="meta">
          {data.win_streak > 0 && `🔥 Серия побед: ${data.win_streak}`}
          {data.loss_streak > 0 && `💧 Серия поражений: ${data.loss_streak}`}
        </p>
      )}
      <section>
        <h3>Топ колод</h3>
        {data.top_decks.map((d, i) => (
          <div key={i} className="card compact">
            <DeckCard cards={d.cards} />
            <span className="meta">{d.total} игр · {d.winrate}%</span>
          </div>
        ))}
      </section>
      <section>
        <h3>Частые карты</h3>
        <ul className="reasons">
          {data.top_cards.map((c) => (
            <li key={c.name}>{c.name} — {c.count} раз</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
