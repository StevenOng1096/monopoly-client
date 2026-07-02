'use client';

import { useEffect, useState } from 'react';

function DieFace({ value, rolling }: { value: number; rolling?: boolean }) {
  const dots: Record<number, number[][]> = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  };

  return (
    <div
      className={`w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-2xl grid grid-cols-3 grid-rows-3 p-2.5 border-2 border-slate-200 ${
        rolling ? 'animate-dice-shake' : 'animate-dice-land'
      }`}
    >
      {Array.from({ length: 9 }).map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const show = dots[value]?.some(([r, c]) => r === row && c === col);
        return (
          <div key={i} className="flex items-center justify-center">
            {show && <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-slate-900 rounded-full" />}
          </div>
        );
      })}
    </div>
  );
}

function RollingDice({ rolling }: { rolling: boolean }) {
  const [vals, setVals] = useState<[number, number]>([1, 1]);

  useEffect(() => {
    if (!rolling) return;
    const id = setInterval(() => {
      setVals([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
    }, 80);
    return () => clearInterval(id);
  }, [rolling]);

  return (
    <>
      <DieFace value={vals[0]} rolling={rolling} />
      <span className="text-2xl font-bold text-amber-400 animate-pulse">+</span>
      <DieFace value={vals[1]} rolling={rolling} />
    </>
  );
}

export function DiceRollOverlay({
  rolling,
  values,
  playerName,
  playerIndex,
  playerColor,
  playerIcon,
}: {
  rolling: boolean;
  values: [number, number] | null;
  playerName: string;
  playerIndex: number;
  playerColor: string;
  playerIcon: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
      <div className="bg-slate-950/90 backdrop-blur-md rounded-2xl px-5 py-4 sm:px-6 sm:py-5 border border-amber-500/40 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg border-2 border-white/30 shadow-lg"
            style={{ backgroundColor: playerColor }}
          >
            {playerIcon}
          </span>
          <p className="text-amber-200 font-semibold text-sm sm:text-base">
            {rolling ? `${playerName} is rolling...` : `${playerName} rolled`}
          </p>
        </div>

        <div className="flex gap-3 sm:gap-4 items-center justify-center">
          {rolling ? (
            <>
              <RollingDice rolling={rolling} />
            </>
          ) : (
            <>
              <DieFace value={values?.[0] ?? 1} />
              <span className="text-2xl font-bold text-amber-400">+</span>
              <DieFace value={values?.[1] ?? 1} />
            </>
          )}
        </div>

        {!rolling && values && (
          <p className="text-center mt-4 text-2xl sm:text-3xl font-black text-white animate-fade-in">
            = {values[0] + values[1]}
          </p>
        )}
      </div>
    </div>
  );
}
