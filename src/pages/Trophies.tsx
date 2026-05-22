import { TrophyIcon } from '../components/icons';

export default function Trophies() {
  return (
    <section data-testid="trophies-page" className="px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <span aria-hidden="true">
          <TrophyIcon size={48} />
        </span>
        <h2 className="font-display text-2xl text-ink">Trophy Room</h2>
      </div>
    </section>
  );
}
