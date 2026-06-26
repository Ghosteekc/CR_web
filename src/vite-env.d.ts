/// <reference types="vite/client" />

interface Window {
  Telegram: {
    WebApp: {
      initData: string;
      initDataUnsafe: any;
      ready(): void;
      expand(): void;
      close(): void;
      colorScheme: string;
      themeParams: any;
      platform: string;
      openTelegramLink?: (url: string) => void;
      openLink?: (url: string) => void;
    };
  };
}