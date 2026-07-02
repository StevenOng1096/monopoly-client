'use client';

import { ClientRoomView, PLAYER_COLORS, PLAYER_ICONS } from '@/lib/types';

interface PlayerPanelProps {
  room: ClientRoomView;
  isYourTurn: boolean;
}

export function PlayerPanel({ room, isYourTurn }: PlayerPanelProps) {
  const currentPlayer = room.game
    ? room.players[room.game.currentPlayerIndex]
    : null;

  return (
    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-700 w-full max-w-sm">
      <h3 className="text-lg font-bold text-amber-300 mb-3">Players</h3>
      <ul className="space-y-2">
        {room.players.map((player, index) => {
          const isCurrent = currentPlayer?.id === player.id;
          const isYou = player.id === room.yourPlayerId;
          const propCount = player.properties?.length ?? 0;

          return (
            <li
              key={player.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-amber-900/30 ring-2 ring-amber-500/60 shadow-lg shadow-amber-900/20'
                  : 'bg-slate-800/40'
              } ${player.isBankrupt ? 'opacity-40 grayscale' : ''}`}
            >
              <div
                className="w-9 h-9 rounded-full shrink-0 border-2 border-white/40 flex items-center justify-center text-base shadow-md"
                style={{ backgroundColor: PLAYER_COLORS[index] }}
              >
                {PLAYER_ICONS[index]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="font-semibold text-white truncate">{player.name}</span>
                  {isYou && (
                    <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                      YOU
                    </span>
                  )}
                  {player.isHost && (
                    <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                      HOST
                    </span>
                  )}
                </div>
                {room.status === 'playing' && player.money !== undefined && (
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-sm text-emerald-400 font-medium">${player.money}</span>
                    {propCount > 0 && (
                      <span className="text-xs text-slate-500">{propCount} properties</span>
                    )}
                  </div>
                )}
                {player.inJail && (
                  <span className="text-xs text-red-400 block mt-0.5">🔒 In Jail</span>
                )}
                {player.isBankrupt && (
                  <span className="text-xs text-red-500 block mt-0.5">Bankrupt</span>
                )}
              </div>
              {isCurrent && (
                <span
                  className={`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ${
                    isYourTurn
                      ? 'bg-amber-500 text-slate-900 animate-pulse'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {isYourTurn ? 'Your turn' : 'Turn'}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
