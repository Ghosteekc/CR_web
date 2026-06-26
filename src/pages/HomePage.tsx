import { useEffect, useState } from "react";
import { api, ApiError, Profile, RecommendationsResponse } from "../api/client";
import { LoadingState, ErrorState, DeckCard } from "../components/Common";

export function HomePage({ profile }: { profile: Profile }) {
  const [recs, setRecs] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getRecommendations()
      .then(setRecs)
      .catch((e: ApiError | unknown) => setError(e instanceof ApiError ? e.message : "Ошибка загрузки рекомендаций"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState text="Загружаю данные..." />;
  if (error || !recs) return <ErrorState message={error ?? "Нет данных"} />;

  return (
    <div className="page home">
      <h1>👑 CR Coach</h1>
      {profile.player_name && (
        <div className="profile-card">
          <p className="meta">
            {profile.player_name} · {profile.trophies} 🏆
            {profile.arena_name && ` · ${profile.arena_name}`}
          </p>
        </div>
      )}

      {recs.last_battle && (
        <section className="home-section">
          <h3>Последний бой</h3>
          <div className={`battle-mini ${recs.last_battle.won ? "win" : "loss"}`}>
            <div className="battle-mini-header">
              <span>{recs.last_battle.won ? "🏆 Победа" : "💔 Поражение"} vs {recs.last_battle.opponent_name}</span>
              <span>{recs.last_battle.trophy_change >= 0 ? "+" : ""}{recs.last_battle.trophy_change} 🏆</span>
            </div>
            <div className="meta">Матчап: {recs.last_battle.matchup_score}/100</div>
            {recs.last_battle.top_reason && (
              <p className="reason">{recs.last_battle.top_reason}</p>
            )}
          </div>
        </section>
      )}

      {recs.current_deck && recs.current_deck.length > 0 ? (
        <section className="home-section">
          <h3>Текущая колода</h3>
          <DeckCard cards={recs.current_deck} />
          <p className="meta">⚗️ {recs.avg_elixir} средний эликсир</p>
        </section>
      ) : (
        <section className="home-section">
          <p className="hint">Нет данных о текущей колоде. Сыграйте бой в Clash Royale.</p>
        </section>
      )}

      {(recs.issues && recs.issues.length > 0) || (recs.customized_deck && recs.customized_deck.length > 0) ? (
        <section className="home-section">
          <h3>Рекомендации</h3>
          {recs.issues.map((issue, i) => (
            <p key={i} className="issue">{issue}</p>
          ))}
          {recs.customized_deck && recs.customized_deck.length > 0 && (
            <div>
              <p><strong>Оптимизированная колода:</strong></p>
              <DeckCard cards={recs.customized_deck} />
            </div>
          )}
        </section>
      ) : null}

      {recs.synergy_deck && recs.synergy_deck.length > 0 && (
        <section className="home-section">
          <h3>Синергии</h3>
          <p className="meta">⭐ Основа: {recs.synergy_core.join(", ")}</p>
          <DeckCard cards={recs.synergy_deck} />
        </section>
      )}
    </div>
  );
}
