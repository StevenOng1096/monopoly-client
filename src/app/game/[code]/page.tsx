'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { CardReferencePanel } from '@/components/CardReferencePanel';
import { GameBoard } from '@/components/GameBoard';
import { GameControls } from '@/components/GameControls';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { PlayerPanel } from '@/components/PlayerPanel';
import { PropertyPortfolio } from '@/components/PropertyPortfolio';
import { useGameAnimations } from '@/hooks/useGameAnimations';
import { useGameSocket } from '@/hooks/useGameSocket';

type SidebarTab = 'players' | 'properties' | 'cards';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('players');

  const {
    room,
    error,
    connected,
    rollDice,
    buyProperty,
    skipBuy,
    payRent,
    resolveCard,
    payJailFine,
    endTurn,
    mortgageProperty,
    unmortgageProperty,
    leaveRoom,
  } = useGameSocket(code);

  const { displayPositions, diceAnimation, isAnimating } = useGameAnimations(room);

  const handleExit = useCallback(() => {
    leaveRoom();
    router.push('/');
  }, [leaveRoom, router]);

  if (!room || room.status === 'waiting') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">
            {connected ? 'Loading game...' : 'Connecting...'}
          </p>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>
      </main>
    );
  }

  const currentPlayer = room.game ? room.players[room.game.currentPlayerIndex] : null;
  const isYourTurn = currentPlayer?.id === room.yourPlayerId;
  const movingPlayerId = room.game?.lastMove?.playerId ?? null;
  const isFinished = room.status === 'finished';
  const canManageProperties =
    isYourTurn &&
    !isFinished &&
    (room.game?.phase === 'roll' || room.game?.phase === 'jail');

  const tabs: { id: SidebarTab; label: string; icon: string }[] = [
    { id: 'players', label: 'Players', icon: '👥' },
    { id: 'properties', label: 'My Properties', icon: '🏠' },
    { id: 'cards', label: 'Cards', icon: '🎴' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-3 sm:p-4">
      {isFinished && <GameOverOverlay room={room} onExit={handleExit} />}

      <div className="max-w-[1600px] mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight">
              World Monopoly
            </h1>
            <p className="text-sm text-slate-400">
              Room {room.code} · {room.players.filter((p) => !p.isBankrupt).length} active
              {isAnimating && (
                <span className="ml-2 text-amber-400/80 animate-pulse">· Animating...</span>
              )}
            </p>
          </div>
          {!isFinished && (
            <button
              onClick={handleExit}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-xl border border-slate-600 transition"
            >
              Leave Game
            </button>
          )}
        </header>

        {error && (
          <p className="text-red-400 text-sm bg-red-900/30 px-3 py-2 rounded-lg mb-4 border border-red-800/50">
            {error}
          </p>
        )}

        <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 items-start justify-center">
          <div className="w-full xl:flex-1 overflow-x-auto flex justify-center">
            <GameBoard
              room={room}
              displayPositions={displayPositions}
              diceAnimation={diceAnimation}
              movingPlayerId={isAnimating ? movingPlayerId : null}
              canManageProperties={canManageProperties}
              onMortgage={(idx) => mortgageProperty(code, idx)}
              onUnmortgage={(idx) => unmortgageProperty(code, idx)}
            />
          </div>

          <div className="w-full xl:w-[340px] shrink-0 flex flex-col gap-4">
            {!isFinished && (
              <GameControls
                room={room}
                isAnimating={isAnimating}
                onRoll={() => rollDice(code)}
                onBuy={() => buyProperty(code)}
                onSkip={() => skipBuy(code)}
                onPayRent={() => payRent(code)}
                onResolveCard={() => resolveCard(code)}
                onPayJail={() => payJailFine(code)}
                onEndTurn={() => endTurn(code)}
              />
            )}

            <div className="bg-slate-900/60 rounded-xl p-1 flex gap-1 border border-slate-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSidebarTab(tab.id)}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                    sidebarTab === tab.id
                      ? 'bg-amber-500 text-slate-900 shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {sidebarTab === 'players' && (
              <PlayerPanel room={room} isYourTurn={isYourTurn} />
            )}
            {sidebarTab === 'properties' && (
              <PropertyPortfolio
                room={room}
                canManage={canManageProperties}
                onMortgage={(idx) => mortgageProperty(code, idx)}
                onUnmortgage={(idx) => unmortgageProperty(code, idx)}
              />
            )}
            {sidebarTab === 'cards' && (
              <CardReferencePanel
                chanceCards={room.chanceCards ?? []}
                communityCards={room.communityCards ?? []}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
