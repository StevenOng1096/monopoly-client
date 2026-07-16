'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGameSocket } from '@/hooks/useGameSocket';
import { PLAYER_COLORS } from '@/lib/types';

export default function WaitingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();
  const {
    room,
    error,
    connected,
    startGame,
    leaveRoom,
  } = useGameSocket(code);

  useEffect(() => {
    if (room?.status === 'playing') {
      router.push(`/game/${room.code}`);
    }
  }, [room?.status, room?.code, router]);

  if (!room) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">
            {connected ? 'Joining room...' : 'Connecting to server...'}
          </p>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>
      </main>
    );
  }

  const you = room.players.find((p) => p.id === room.yourPlayerId);
  const canStart =
    you?.isHost &&
    room.players.length >= room.minPlayers &&
    room.status === 'waiting';

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 flex items-center justify-center p-4 safe-area-padding">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-300">Waiting Room</h1>
          <div className="mt-3 inline-flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
            <span className="text-slate-400 text-sm">Room Code:</span>
            <span className="text-2xl font-mono font-bold text-white tracking-widest">
              {room.code}
            </span>
            <button
              onClick={copyCode}
              className="ml-2 text-xs bg-amber-500 text-slate-900 px-2 py-1 rounded font-medium hover:bg-amber-400"
            >
              Copy
            </button>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            Share this code with friends to join ({room.players.length}/{room.maxPlayers} players)
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-700 p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4">
            Players in Lobby
          </h2>

          <ul className="space-y-3 mb-6">
            {room.players.map((player, i) => (
              <li
                key={player.id}
                className="flex items-center gap-3 bg-slate-800/60 px-4 py-3 rounded-lg"
              >
                <div
                  className="w-5 h-5 rounded-full border-2 border-white/20"
                  style={{ backgroundColor: PLAYER_COLORS[i] }}
                />
                <span className="text-white font-medium flex-1">{player.name}</span>
                {player.isHost && (
                  <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded">
                    Host
                  </span>
                )}
                {player.id === room.yourPlayerId && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                    You
                  </span>
                )}
              </li>
            ))}

            {Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
              <li
                key={`empty-${i}`}
                className="flex items-center gap-3 bg-slate-800/20 px-4 py-3 rounded-lg border border-dashed border-slate-700"
              >
                <div className="w-5 h-5 rounded-full bg-slate-700" />
                <span className="text-slate-500 italic">Waiting for player...</span>
              </li>
            ))}
          </ul>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/30 px-3 py-2 rounded-lg mb-4">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            {canStart && (
              <button
                onClick={() => startGame(room.code)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
              >
                Start Game
              </button>
            )}

            {!you?.isHost && room.players.length < room.minPlayers && (
              <p className="flex-1 text-center text-slate-400 text-sm py-3">
                Need at least {room.minPlayers} players to start
              </p>
            )}

            <button
              onClick={() => {
                leaveRoom();
                router.push('/');
              }}
              className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
