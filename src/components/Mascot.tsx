export type MascotMood = 'idle' | 'success' | 'fail';

interface MascotProps {
  mood?: MascotMood;
}

const EMOJI: Record<MascotMood, string> = {
  idle: '🦊',
  success: '🎉',
  fail: '😅',
};

const ANIM: Record<MascotMood, string> = {
  idle: '',
  success: 'animate-bounce',
  fail: 'animate-pulse',
};

export function Mascot({ mood = 'idle' }: MascotProps) {
  return (
    <div
      data-testid="mascot"
      data-mood={mood}
      className={`text-6xl inline-block ${ANIM[mood]}`}
      aria-hidden="true"
    >
      {EMOJI[mood]}
    </div>
  );
}
