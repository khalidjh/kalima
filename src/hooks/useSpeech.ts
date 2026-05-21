import { useCallback, useState } from 'react';
import type { Lang } from '../stores/userStore';

const LANG_TAGS: Record<Lang, string> = {
  ar: 'ar-SA',
  en: 'en-US',
};

export interface UseSpeech {
  speak: (text: string, lang: Lang) => Promise<void>;
  speaking: boolean;
  supported: boolean;
}

export function useSpeech(): UseSpeech {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(
    (text: string, lang: Lang): Promise<void> => {
      if (!supported) return Promise.resolve();
      return new Promise<void>((resolve) => {
        try {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = LANG_TAGS[lang];
          u.onend = () => {
            setSpeaking(false);
            resolve();
          };
          u.onerror = () => {
            setSpeaking(false);
            resolve();
          };
          setSpeaking(true);
          window.speechSynthesis.speak(u);
        } catch (err) {
          console.error('useSpeech failed', err);
          setSpeaking(false);
          resolve();
        }
      });
    },
    [supported],
  );

  return { speak, speaking, supported };
}
