'use client';

import { useEffect, useRef, useState } from 'react';
import { ClientRoomView, getStepPath } from '@/lib/types';

const STEP_MS = 500;
const DICE_ROLL_MS = 1400;

export interface DiceAnimation {
  rolling: boolean;
  values: [number, number] | null;
  playerName: string;
  playerIndex: number;
}

export function useGameAnimations(room: ClientRoomView | null) {
  const [displayPositions, setDisplayPositions] = useState<Record<string, number>>({});
  const [diceAnimation, setDiceAnimation] = useState<DiceAnimation | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const processedMoveCounter = useRef(0);
  const processedDiceKey = useRef('');
  const animatingRef = useRef(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!room || room.status !== 'playing' || !room.game) return;

    if (!initialized.current) {
      const positions: Record<string, number> = {};
      for (const p of room.players) {
        if (p.position !== undefined) positions[p.id] = p.position;
      }
      setDisplayPositions(positions);
      processedMoveCounter.current = room.game.moveCounter;
      if (room.game.lastDice) {
        processedDiceKey.current = `${room.game.moveCounter}-${room.game.lastDice.join(',')}-${room.game.lastRollPlayerId}`;
      }
      initialized.current = true;
      return;
    }

    if (animatingRef.current) return;

    const game = room.game;
    const diceKey = game.lastDice
      ? `${game.moveCounter}-${game.lastDice.join(',')}-${game.lastRollPlayerId}`
      : '';

    const shouldAnimateDice =
      !!game.lastDice &&
      !!game.lastRollPlayerId &&
      diceKey !== processedDiceKey.current;

    const shouldAnimateMove =
      !!game.lastMove &&
      game.moveCounter > processedMoveCounter.current;

    if (!shouldAnimateDice && !shouldAnimateMove) {
      setDisplayPositions((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const p of room.players) {
          if (p.position !== undefined && p.isBankrupt !== true) {
            if (next[p.id] !== p.position) {
              next[p.id] = p.position;
              changed = true;
            }
          } else if (p.id in next && p.isBankrupt) {
            delete next[p.id];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
      return;
    }

    animatingRef.current = true;
    setIsAnimating(true);

    const runAnimation = async () => {
      try {
        if (shouldAnimateDice && game.lastDice && game.lastRollPlayerId) {
          const roller = room.players.find((p) => p.id === game.lastRollPlayerId);
          const rollerIndex = room.players.findIndex((p) => p.id === game.lastRollPlayerId);

          setDiceAnimation({
            rolling: true,
            values: null,
            playerName: roller?.name ?? 'Player',
            playerIndex: rollerIndex >= 0 ? rollerIndex : 0,
          });

          await sleep(DICE_ROLL_MS);

          setDiceAnimation({
            rolling: false,
            values: game.lastDice,
            playerName: roller?.name ?? 'Player',
            playerIndex: rollerIndex >= 0 ? rollerIndex : 0,
          });

          processedDiceKey.current = diceKey;
          await sleep(700);
        }

        if (shouldAnimateMove && game.lastMove) {
          const { playerId, from, to, animateSteps } = game.lastMove;

          if (animateSteps && from !== to) {
            setDisplayPositions((prev) => ({ ...prev, [playerId]: from }));

            const path = getStepPath(from, to);
            for (const step of path) {
              setDisplayPositions((prev) => ({ ...prev, [playerId]: step }));
              await sleep(STEP_MS);
            }
          } else {
            setDisplayPositions((prev) => ({ ...prev, [playerId]: to }));
          }

          processedMoveCounter.current = game.moveCounter;
        } else if (shouldAnimateDice) {
          processedMoveCounter.current = game.moveCounter;
        }
      } finally {
        setDiceAnimation(null);
        setIsAnimating(false);
        animatingRef.current = false;
      }
    };

    runAnimation();
  }, [room]);

  return {
    displayPositions,
    diceAnimation,
    isAnimating,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
