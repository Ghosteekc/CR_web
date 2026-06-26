import { useEffect, useState } from "react";
import { api, ApiError, Profile } from "../api/client";

export function useTelegram() {
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    tg?.ready();
    tg?.expand();
  }, [tg]);

  return {
    tg,
    theme: tg?.colorScheme ?? "light",
    initData: tg?.initData ?? "",
    openBotLink: (path: string) => tg && tg.openTelegramLink ? tg.openTelegramLink(`https://t.me/${path}`) : window.open(`https://t.me/${path}`, '_blank'),
  };
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProfile()
      .then(setProfile)
      .catch((e) => setError(e instanceof ApiError ? e : new ApiError(String(e), 500)))
      .finally(() => setLoading(false));
  }, []);

  return { profile, error, loading };
}
