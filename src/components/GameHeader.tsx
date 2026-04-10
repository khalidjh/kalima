"use client";

import BackToHome from "@/components/BackToHome";

interface GameHeaderProps {
  left?: React.ReactNode;   // e.g. BackToHome (default)
  center?: React.ReactNode; // e.g. puzzle number
  right?: React.ReactNode;  // e.g. icons or dots
}

export default function GameHeader({ left, center, right }: GameHeaderProps) {
  return (
    <div className="w-full border-b-4 border-b-[#CCFF00] flex-shrink-0 bg-white">
      <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between gap-2 text-black">
        <div className="flex items-center gap-2 min-w-0 font-brutal">
          {left ?? <BackToHome />}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {center}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {right}
        </div>
      </div>
    </div>
  );
}
