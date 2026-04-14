import Link from "next/link";

const games = [
  {
    title: "حروفي",
    description: "تعلّم الحروف العربية",
    href: "/kids/horouf",
    icon: "🔤",
    bg: "#FFE0E0",
    border: "#FF6B6B",
    stars: 0,
    total: 5,
  },
  {
    title: "أرقامي",
    description: "تعلّم العدّ والأرقام",
    href: "/kids/arqam",
    icon: "🔢",
    bg: "#D4F4DD",
    border: "#51CF66",
    stars: 0,
    total: 5,
  },
  {
    title: "أشكالي",
    description: "تعرّف على الأشكال",
    href: "/kids/ashkal",
    icon: "🔷",
    bg: "#E0E8FF",
    border: "#4A90D9",
    stars: 0,
    total: 5,
  },
  {
    title: "ألواني",
    description: "تعلّم الألوان الجميلة",
    href: "/kids/alwan",
    icon: "🎨",
    bg: "#F3E0FF",
    border: "#CC5DE8",
    stars: 0,
    total: 5,
  },
];

function Stars({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex gap-1" dir="ltr">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="text-lg"
          style={{ opacity: i < filled ? 1 : 0.25 }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

export default function KidsHomePage() {
  return (
    <div className="max-w-lg mx-auto px-5 pt-8 pb-12">
      {/* Greeting */}
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "#2D3436" }}
        >
          مرحباً! 🌟
        </h1>
        <p
          className="text-xl font-semibold"
          style={{ color: "#636E72" }}
        >
          اختر لعبة
        </p>
      </div>

      {/* Game Cards - 2x2 grid on sm+, single column on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {games.map((game) => (
          <Link key={game.href} href={game.href} className="block group">
            <div
              className="rounded-3xl p-6 border-[3px] transition-transform duration-200 group-hover:scale-[1.03] group-active:scale-95"
              style={{
                background: game.bg,
                borderColor: game.border,
                minHeight: "180px",
              }}
            >
              {/* Icon */}
              <div className="text-5xl mb-3">{game.icon}</div>

              {/* Title */}
              <h2
                className="text-2xl font-bold mb-1"
                style={{ color: "#2D3436" }}
              >
                {game.title}
              </h2>

              {/* Description */}
              <p
                className="text-sm font-medium mb-3"
                style={{ color: "#636E72" }}
              >
                {game.description}
              </p>

              {/* Stars */}
              <Stars filled={game.stars} total={game.total} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
