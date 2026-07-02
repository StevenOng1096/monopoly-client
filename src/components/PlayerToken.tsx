'use client';

import { PLAYER_COLORS, PLAYER_ICONS } from '@/lib/types';

export function PlayerToken({
  playerIndex,
  offsetIndex,
  isMoving,
}: {
  playerIndex: number;
  offsetIndex: number;
  isMoving?: boolean;
}) {
  const offsets = [
    { top: '2px', left: '2px' },
    { top: '2px', right: '2px' },
    { bottom: '2px', left: '2px' },
    { bottom: '2px', right: '2px' },
  ];
  const pos = offsets[offsetIndex] ?? offsets[0];

  return (
    <div
      className={`absolute z-10 transition-all duration-300 ${isMoving ? 'scale-125 drop-shadow-lg' : ''}`}
      style={pos}
      title={`Player ${playerIndex + 1}`}
    >
      <div
        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm border-2 border-white shadow-md ${
          isMoving ? 'animate-token-bounce' : ''
        }`}
        style={{
          backgroundColor: PLAYER_COLORS[playerIndex],
          boxShadow: `0 2px 8px ${PLAYER_COLORS[playerIndex]}88`,
        }}
      >
        {PLAYER_ICONS[playerIndex]}
      </div>
    </div>
  );
}
