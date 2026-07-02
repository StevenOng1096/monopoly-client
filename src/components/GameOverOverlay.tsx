'use client';

import { useEffect } from 'react';
import { ClientRoomView, PLAYER_COLORS } from '@/lib/types';

interface GameOverOverlayProps {
  room: ClientRoomView;
  onExit: () => void;
}

export function GameOverOverlay({ room, onExit }: GameOverOverlayProps) {
  const game = room.game;
  if (!game || room.status !== 'finished') return null;

  const winner = room.players.find((p) => p.id === game.winnerId);
  const isYou = winner?.id === room.yourPlayerId;
  const opponentLeft = game.endReason === 'opponent_left';

  useEffect(() => {
    const delay = opponentLeft ? 4000 : 8000;
    const timer = setTimeout(onExit, delay);
    return () => clearTimeout(timer);
  }, [onExit, opponentLeft]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in">
        <p className="text-5xl mb-4">{isYou ? '🏆' : '🎮'}</p>
        <h2 className="text-3xl font-black text-amber-300 mb-2">
          {isYou ? 'You Win!' : 'Game Over'}
        </h2>

        {winner && (
          <p className="text-xl text-white mb-2">
            {isYou ? 'Congratulations!' : `${winner.name} wins!`}
          </p>
        )}

        <p className="text-slate-400 text-sm mb-6">{game.message}</p>

        {opponentLeft && (
          <p className="text-amber-200/80 text-sm mb-4 bg-amber-900/20 rounded-lg px-3 py-2">
            {isYou
              ? 'Your opponent left the game. Returning to home...'
              : 'A player left the game. Returning to home...'}
          </p>
        )}

        <button
          onClick={onExit}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition"
        >
          Return to Home
        </button>

        <p className="text-xs text-slate-500 mt-3">
          Auto-redirect in {opponentLeft ? '4' : '8'} seconds
        </p>
      </div>
    </div>
  );
}
