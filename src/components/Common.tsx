export function LoadingState({ text = "Загрузка..." }: { text?: string }) {
  return <div className="loading">{text}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-state">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  );
}

export function DeckCard({ cards, label }: { cards: string[]; label?: string }) {
  return (
    <div className="deck-card">
      {label && <div className="deck-label">{label}</div>}
      <div className="deck-cards">{cards.join(", ")}</div>
    </div>
  );
}

export function BattleCard({
  opponent,
  won,
  trophyChange,
  matchupScore,
  onClick,
}: {
  opponent: string;
  won: boolean;
  trophyChange: number;
  matchupScore: number | null;
  onClick?: () => void;
}) {
  return (
    <button type="button" className={`battle-card ${won ? "win" : "loss"}`} onClick={onClick}>
      <div className="battle-header">
        <span>{won ? "🏆 Победа" : "💔 Поражение"}</span>
        <span className="trophy">{trophyChange >= 0 ? "+" : ""}{trophyChange} 🏆</span>
      </div>
      <div className="battle-opponent">vs {opponent}</div>
      {matchupScore !== null && (
        <div className="battle-matchup">Матчап: {matchupScore}/100</div>
      )}
    </button>
  );
}

export function SubscriptionGate({
  profile,
  children,
}: {
  profile: { player_tag: string | null; subscription: { active: boolean } } | null;
  children: React.ReactNode;
}) {
  if (!profile?.player_tag) {
    return (
      <div className="gate">
        <h2>Тег не привязан</h2>
        <p>Привяжите аккаунт Clash Royale в чате с ботом:</p>
        <code>/link #ВАШТЕГ</code>
      </div>
    );
  }
  if (!profile.subscription.active) {
    return (
      <div className="gate">
        <h2>Нужна подписка</h2>
        <p>Оформите подписку или пробный период в чате с ботом:</p>
        <code>/subscribe</code>
      </div>
    );
  }
  return <>{children}</>;
}
