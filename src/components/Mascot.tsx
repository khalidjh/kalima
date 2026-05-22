import { FoxMascot, type FoxMood } from './icons/FoxMascot';

export type MascotMood = FoxMood;

interface MascotProps {
  mood?: MascotMood;
  size?: number;
}

const ANIM: Record<MascotMood, string> = {
  idle: '',
  success: 'animate-bounce',
  fail: 'animate-pulse',
};

export function Mascot({ mood = 'idle', size = 96 }: MascotProps) {
  return (
    <div
      data-testid="mascot"
      data-mood={mood}
      className={`inline-block ${ANIM[mood]}`}
      aria-hidden="true"
    >
      <FoxMascot mood={mood} size={size} />
    </div>
  );
}
