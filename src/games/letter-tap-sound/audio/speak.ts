import type { Lang } from '../../../stores/userStore';

// Format: `${lang}-${audio_key}`. Add entries as we identify letters
// where TTS quality is unacceptable on real devices.
export const FALLBACK_KEYS = new Set<string>();

type Synth = (text: string, lang: Lang) => Promise<void>;
type Mp3Player = (url: string) => Promise<void>;

export function playMp3(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(url);
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error(`audio failed: ${url}`));
      void audio.play().catch(reject);
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

export async function dispatchSpeak(
  key: string,
  lang: Lang,
  synth: Synth,
  mp3: Mp3Player = playMp3,
): Promise<void> {
  const compoundKey = `${lang}-${key}`;
  if (FALLBACK_KEYS.has(compoundKey)) {
    try {
      await mp3(`/audio/fallbacks/${compoundKey}.mp3`);
      return;
    } catch (err) {
      console.warn('mp3 fallback failed, using synth', err);
    }
  }
  await synth(key, lang);
}
