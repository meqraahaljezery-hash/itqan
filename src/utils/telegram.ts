/**
 * Telegram Web App (TMA) Helper Utilities
 */

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        openTelegramLink: (url: string) => void;
        openLink: (url: string) => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        platform?: string;
        isExpanded?: boolean;
        viewportHeight?: number;
      };
    };
  }
}

export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && Boolean(window.Telegram?.WebApp?.initDataUnsafe?.user?.id);
}

export function initTelegramWebApp() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    try {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor?.('#064e3b');
      window.Telegram.WebApp.setBackgroundColor?.('#fbf8f1');
    } catch {
      // Safe fallback if not running in Telegram client
    }
  }
}

export function triggerHaptic(type: 'success' | 'warning' | 'error' | 'light' | 'medium') {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
    try {
      if (type === 'success' || type === 'warning' || type === 'error') {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    } catch {
      // ignore
    }
  }
}

export function openTelegramShare(text: string, url?: string) {
  const encodedText = encodeURIComponent(text);
  const shareUrl = url 
    ? `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodedText}`
    : `https://t.me/share/url?text=${encodedText}`;
  
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openTelegramLink) {
    window.Telegram.WebApp.openTelegramLink(shareUrl);
  } else {
    window.open(shareUrl, '_blank');
  }
}
