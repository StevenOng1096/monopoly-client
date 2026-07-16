'use client';

import { ClientRoomView } from '@/lib/types';

interface GameControlsProps {
  room: ClientRoomView;
  isAnimating?: boolean;
  onRoll: () => void;
  onBuy: () => void;
  onSkip: () => void;
  onPayRent: () => void;
  onResolveCard: () => void;
  onPayJail: () => void;
  onEndTurn: () => void;
}

export function GameControls({
  room,
  isAnimating = false,
  onRoll,
  onBuy,
  onSkip,
  onPayRent,
  onResolveCard,
  onPayJail,
  onEndTurn,
}: GameControlsProps) {
  const game = room.game;
  if (!game || room.status !== 'playing') return null;

  const currentPlayer = room.players[game.currentPlayerIndex];
  const isYourTurn = currentPlayer?.id === room.yourPlayerId;

  const btn =
    'px-4 py-2.5 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg';

  if (!isYourTurn || currentPlayer?.isBankrupt) {
    return (
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-700 text-center w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-slate-300 font-medium">Waiting for {currentPlayer?.name}...</p>
        </div>
        {isAnimating && (
          <p className="text-xs text-slate-500">Watch the board for dice & movement</p>
        )}
      </div>
    );
  }

  if (game.phase === 'game_over') {
    const winner = room.players.find((p) => p.id === game.winnerId);
    return (
      <div className="bg-gradient-to-br from-amber-900/50 to-amber-950/50 rounded-xl p-6 border border-amber-500/50 text-center w-full max-w-sm">
        <p className="text-3xl font-black text-amber-300">Game Over!</p>
        <p className="text-white mt-2 text-lg">{winner?.name} wins!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 rounded-xl p-4 sm:p-5 border border-slate-700 space-y-3 sm:space-y-4 w-full max-w-sm shadow-xl">
      <div className="bg-slate-800/50 rounded-lg px-3 py-2 min-h-[3rem] flex items-center">
        <p className="text-sm text-slate-200 leading-snug">{game.message}</p>
      </div>

      {game.phase === 'roll' && (
        <button
          onClick={onRoll}
          disabled={isAnimating}
          className={`${btn} w-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 text-lg`}
        >
          {isAnimating ? 'Rolling...' : '🎲 Roll Dice'}
        </button>
      )}

      {game.phase === 'buy' && (
        <div className="flex gap-2">
          <button
            onClick={onBuy}
            disabled={isAnimating}
            className={`${btn} flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white`}
          >
            Buy
          </button>
          <button
            onClick={onSkip}
            disabled={isAnimating}
            className={`${btn} flex-1 bg-slate-600 text-white`}
          >
            Pass
          </button>
        </div>
      )}

      {game.phase === 'pay_rent' && (
        <button
          onClick={onPayRent}
          disabled={isAnimating}
          className={`${btn} w-full bg-gradient-to-r from-red-600 to-red-500 text-white`}
        >
          Pay Rent
        </button>
      )}

      {game.phase === 'card' && game.pendingCard && (
        <div className="space-y-3">
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3">
            <p className="text-purple-200 text-sm italic">{game.pendingCard.description}</p>
          </div>
          <button
            onClick={onResolveCard}
            disabled={isAnimating}
            className={`${btn} w-full bg-purple-600 text-white`}
          >
            OK
          </button>
        </div>
      )}

      {game.phase === 'jail' && (
        <div className="flex gap-2">
          <button
            onClick={onPayJail}
            disabled={isAnimating}
            className={`${btn} flex-1 bg-yellow-500 text-slate-900`}
          >
            Pay $50
          </button>
          <button
            onClick={onRoll}
            disabled={isAnimating}
            className={`${btn} flex-1 bg-amber-500 text-slate-900`}
          >
            Roll
          </button>
        </div>
      )}

      {game.phase === 'roll' && game.lastDice && !isAnimating && (
        <button onClick={onEndTurn} className={`${btn} w-full bg-slate-700 text-white text-sm`}>
          End Turn
        </button>
      )}
    </div>
  );
}
