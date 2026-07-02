'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useGameSocket } from '@/hooks/useGameSocket';

export default function HomePage() {
  const router = useRouter();
  const { room, error, connected, createRoom, joinRoom, setError } = useGameSocket();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');

  useEffect(() => {
    if (room) {
      router.push(`/room/${room.code}`);
    }
  }, [room, router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    if (mode === 'create') {
      createRoom(playerName.trim());
    } else {
      if (!roomCode.trim()) {
        setError('Enter a room code');
        return;
      }
      joinRoom(roomCode.trim(), playerName.trim());
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-300 tracking-tight">
            World Monopoly
          </h1>
          <p className="text-emerald-200 mt-2">
            Buy countries. Build empires. Play with 2–4 friends online.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm">
            <span
              className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-500'}`}
            />
            <span className="text-slate-400">
              {connected ? 'Connected to server' : 'Connecting...'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-700 p-6 shadow-xl">
          <div className="flex mb-6 bg-slate-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                mode === 'create'
                  ? 'bg-amber-500 text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Room
            </button>
            <button
              type="button"
              onClick={() => setMode('join')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                mode === 'join'
                  ? 'bg-amber-500 text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Join Room
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {mode === 'join' && (
              <div>
                <label className="block text-sm text-slate-400 mb-1">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase tracking-widest"
                />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm bg-red-900/30 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={!connected || !playerName.trim()}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold rounded-lg transition"
            >
              {mode === 'create' ? 'Create Waiting Room' : 'Join Game'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
