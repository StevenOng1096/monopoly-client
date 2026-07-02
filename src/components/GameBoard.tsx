'use client';

import { useState } from 'react';
import { DiceAnimation } from '@/hooks/useGameAnimations';
import {
  BoardSpace,
  ClientRoomView,
  COLOR_MAP,
  PLAYER_COLORS,
  PLAYER_ICONS,
  PropertyColor,
} from '@/lib/types';
import { DiceRollOverlay } from './DiceRollOverlay';
import { PlayerToken } from './PlayerToken';
import { SpaceDetailPopup } from './SpaceDetailPopup';

interface BoardProps {
  room: ClientRoomView;
  displayPositions: Record<string, number>;
  diceAnimation: DiceAnimation | null;
  movingPlayerId?: string | null;
  canManageProperties?: boolean;
  onMortgage?: (spaceIndex: number) => void;
  onUnmortgage?: (spaceIndex: number) => void;
}

function SpaceCell({
  space,
  ownerIndex,
  playersHere,
  houseCount,
  isMortgaged,
  orientation,
  movingPlayerId,
  onTap,
}: {
  space: BoardSpace;
  ownerIndex: number;
  playersHere: Array<{ playerIndex: number; playerId: string }>;
  houseCount: number;
  isMortgaged: boolean;
  orientation: 'bottom' | 'left' | 'top' | 'right' | 'corner';
  movingPlayerId?: string | null;
  onTap: (spaceIndex: number) => void;
}) {
  const colorBar = space.color ? COLOR_MAP[space.color as PropertyColor] : null;

  const sizeClass =
    orientation === 'corner'
      ? 'w-[72px] h-[72px] sm:w-24 sm:h-24'
      : orientation === 'bottom' || orientation === 'top'
        ? 'w-12 h-[72px] sm:w-16 sm:h-24'
        : 'w-[72px] h-12 sm:w-24 sm:h-16';

  const typeIcon =
    space.type === 'chance'
      ? '?'
      : space.type === 'community'
        ? '🌍'
        : space.type === 'tax'
          ? '$'
          : space.type === 'railroad'
            ? '🚂'
            : space.type === 'utility'
              ? '⚡'
              : null;

  return (
    <button
      type="button"
      onClick={() => onTap(space.index)}
      aria-label={`View details for ${space.name}`}
      className={`${sizeClass} relative border border-emerald-800/80 bg-gradient-to-br from-emerald-900 to-emerald-950 flex flex-col overflow-hidden shrink-0 cursor-pointer select-none touch-manipulation hover:brightness-110 active:brightness-125 transition-all p-0 text-left`}
    >
      {isMortgaged && (
        <div className="absolute inset-0 z-[5] bg-slate-950/55 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] sm:text-[10px] font-bold text-red-400 rotate-[-24deg] border border-red-500/60 px-1 rounded">
              MORTGAGED
            </span>
          </div>
        </div>
      )}

      {colorBar && (
        <div
          className={`h-3 w-full shrink-0 ${isMortgaged ? 'opacity-40' : ''}`}
          style={{ backgroundColor: colorBar }}
        />
      )}
      {space.type === 'railroad' && (
        <div className={`h-3 w-full bg-slate-500 shrink-0 ${isMortgaged ? 'opacity-40' : ''}`} />
      )}
      {space.type === 'utility' && (
        <div className={`h-3 w-full bg-yellow-500 shrink-0 ${isMortgaged ? 'opacity-40' : ''}`} />
      )}

      <div className="flex-1 p-0.5 flex flex-col items-center justify-center text-center relative w-full pointer-events-none">
        {typeIcon && (
          <span className="text-xs sm:text-sm mb-0.5 opacity-90">{typeIcon}</span>
        )}
        <span className="text-[8px] sm:text-[10px] leading-tight font-semibold text-white line-clamp-3 px-0.5">
          {space.name}
        </span>
        {space.price && (
          <span className="text-[7px] sm:text-[9px] text-emerald-300/90 font-medium">
            ${space.price}
          </span>
        )}
      </div>

      {ownerIndex >= 0 && (
        <div
          className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-white/80 shadow z-[6] pointer-events-none"
          style={{ backgroundColor: PLAYER_COLORS[ownerIndex] }}
        />
      )}

      {houseCount > 0 && space.type === 'property' && !isMortgaged && (
        <div className="absolute bottom-0.5 left-0.5 flex gap-px z-[6] pointer-events-none">
          {Array.from({ length: Math.min(houseCount, 4) }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-green-400 rounded-sm" />
          ))}
          {houseCount >= 5 && <span className="text-[8px] leading-none">🏨</span>}
        </div>
      )}

      {playersHere.map(({ playerIndex, playerId }, i) => (
        <PlayerToken
          key={playerId}
          playerIndex={playerIndex}
          offsetIndex={i}
          isMoving={movingPlayerId === playerId}
        />
      ))}
    </button>
  );
}

export function GameBoard({
  room,
  displayPositions,
  diceAnimation,
  movingPlayerId,
  canManageProperties,
  onMortgage,
  onUnmortgage,
}: BoardProps) {
  const board = room.board;
  const [inspectedIndex, setInspectedIndex] = useState<number | null>(null);

  const inspectedSpace = inspectedIndex != null ? board[inspectedIndex] : null;

  const getOwnerIndex = (spaceIndex: number) => {
    const prop = room.properties.find((p) => p.spaceIndex === spaceIndex);
    if (!prop?.ownerId) return -1;
    return room.players.findIndex((p) => p.id === prop.ownerId);
  };

  const getHouseCount = (spaceIndex: number) =>
    room.properties.find((p) => p.spaceIndex === spaceIndex)?.houses ?? 0;

  const isMortgaged = (spaceIndex: number) =>
    room.properties.find((p) => p.spaceIndex === spaceIndex)?.isMortgaged ?? false;

  const getPlayersAt = (spaceIndex: number) =>
    room.players
      .map((p, i) => {
        const pos = displayPositions[p.id] ?? p.position;
        return pos === spaceIndex && !p.isBankrupt
          ? { playerIndex: i, playerId: p.id }
          : null;
      })
      .filter(Boolean) as Array<{ playerIndex: number; playerId: string }>;

  const bottomRow = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((i) => board[i]);
  const leftCol = [19, 18, 17, 16, 15, 14, 13, 12, 11].map((i) => board[i]);
  const topRow = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((i) => board[i]);
  const rightCol = [31, 32, 33, 34, 35, 36, 37, 38, 39].map((i) => board[i]);

  const currentPlayer = room.game ? room.players[room.game.currentPlayerIndex] : null;

  const cellProps = {
    onTap: setInspectedIndex,
    movingPlayerId,
  };

  return (
    <>
      <div className="inline-block bg-gradient-to-br from-emerald-950 to-slate-950 p-2 sm:p-3 rounded-2xl shadow-2xl border-4 border-amber-600/80">
        <p className="text-[10px] sm:text-xs text-slate-400 text-center mb-2">
          Tap any space for full property details
        </p>

        <div className="flex flex-col">
          <div className="flex">
            <SpaceCell
              space={topRow[0]}
              ownerIndex={getOwnerIndex(topRow[0].index)}
              playersHere={getPlayersAt(topRow[0].index)}
              houseCount={getHouseCount(topRow[0].index)}
              isMortgaged={isMortgaged(topRow[0].index)}
              orientation="corner"
              {...cellProps}
            />
            {topRow.slice(1, -1).map((space) => (
              <SpaceCell
                key={space.index}
                space={space}
                ownerIndex={getOwnerIndex(space.index)}
                playersHere={getPlayersAt(space.index)}
                houseCount={getHouseCount(space.index)}
                isMortgaged={isMortgaged(space.index)}
                orientation="top"
                {...cellProps}
              />
            ))}
            <SpaceCell
              space={topRow[topRow.length - 1]}
              ownerIndex={getOwnerIndex(topRow[topRow.length - 1].index)}
              playersHere={getPlayersAt(topRow[topRow.length - 1].index)}
              houseCount={getHouseCount(topRow[topRow.length - 1].index)}
              isMortgaged={isMortgaged(topRow[topRow.length - 1].index)}
              orientation="corner"
              {...cellProps}
            />
          </div>

          <div className="flex">
            <div className="flex flex-col">
              {leftCol.map((space) => (
                <SpaceCell
                  key={space.index}
                  space={space}
                  ownerIndex={getOwnerIndex(space.index)}
                  playersHere={getPlayersAt(space.index)}
                  houseCount={getHouseCount(space.index)}
                  isMortgaged={isMortgaged(space.index)}
                  orientation="left"
                  {...cellProps}
                />
              ))}
            </div>

            <div className="relative flex-1 min-w-[220px] sm:min-w-[300px] min-h-[108px] sm:min-h-[144px] bg-gradient-to-br from-emerald-800/70 via-emerald-900/80 to-slate-900/90 flex flex-col items-center justify-center p-3 border border-emerald-700/50 overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 to-transparent" />

              {!diceAnimation && (
                <div className="relative z-10 text-center pointer-events-none">
                  <h2 className="text-lg sm:text-2xl font-black text-amber-300 tracking-wide drop-shadow">
                    WORLD MONOPOLY
                  </h2>
                  <p className="text-emerald-200/80 text-[10px] sm:text-sm mt-0.5">
                    Countries Around the Globe
                  </p>
                  {currentPlayer && room.game?.phase !== 'game_over' && (
                    <p className="mt-2 text-xs text-white/70">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
                        style={{
                          backgroundColor: PLAYER_COLORS[room.game!.currentPlayerIndex],
                        }}
                      />
                      {currentPlayer.name}&apos;s turn
                    </p>
                  )}
                  {room.game?.message && !diceAnimation && (
                    <p className="mt-2 text-[10px] sm:text-xs text-amber-200/60 max-w-[200px] line-clamp-2">
                      {room.game.message}
                    </p>
                  )}
                </div>
              )}

              {diceAnimation && (
                <DiceRollOverlay
                  rolling={diceAnimation.rolling}
                  values={diceAnimation.values}
                  playerName={diceAnimation.playerName}
                  playerIndex={diceAnimation.playerIndex}
                  playerColor={PLAYER_COLORS[diceAnimation.playerIndex]}
                  playerIcon={PLAYER_ICONS[diceAnimation.playerIndex]}
                />
              )}
            </div>

            <div className="flex flex-col">
              {rightCol.map((space) => (
                <SpaceCell
                  key={space.index}
                  space={space}
                  ownerIndex={getOwnerIndex(space.index)}
                  playersHere={getPlayersAt(space.index)}
                  houseCount={getHouseCount(space.index)}
                  isMortgaged={isMortgaged(space.index)}
                  orientation="right"
                  {...cellProps}
                />
              ))}
            </div>
          </div>

          <div className="flex">
            <SpaceCell
              space={bottomRow[0]}
              ownerIndex={getOwnerIndex(bottomRow[0].index)}
              playersHere={getPlayersAt(bottomRow[0].index)}
              houseCount={getHouseCount(bottomRow[0].index)}
              isMortgaged={isMortgaged(bottomRow[0].index)}
              orientation="corner"
              {...cellProps}
            />
            {bottomRow.slice(1, -1).map((space) => (
              <SpaceCell
                key={space.index}
                space={space}
                ownerIndex={getOwnerIndex(space.index)}
                playersHere={getPlayersAt(space.index)}
                houseCount={getHouseCount(space.index)}
                isMortgaged={isMortgaged(space.index)}
                orientation="bottom"
                {...cellProps}
              />
            ))}
            <SpaceCell
              space={bottomRow[bottomRow.length - 1]}
              ownerIndex={getOwnerIndex(bottomRow[bottomRow.length - 1].index)}
              playersHere={getPlayersAt(bottomRow[bottomRow.length - 1].index)}
              houseCount={getHouseCount(bottomRow[bottomRow.length - 1].index)}
              isMortgaged={isMortgaged(bottomRow[bottomRow.length - 1].index)}
              orientation="corner"
              {...cellProps}
            />
          </div>
        </div>
      </div>

      {inspectedSpace && (
        <SpaceDetailPopup
          space={inspectedSpace}
          room={room}
          canManage={canManageProperties}
          onClose={() => setInspectedIndex(null)}
          onMortgage={(idx) => {
            onMortgage?.(idx);
            setInspectedIndex(null);
          }}
          onUnmortgage={(idx) => {
            onUnmortgage?.(idx);
            setInspectedIndex(null);
          }}
        />
      )}
    </>
  );
}
