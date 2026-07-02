'use client';

import {
  ClientRoomView,
  COLOR_MAP,
  getHouseUpgradeCosts,
  getMortgageValue,
  getUnmortgageCost,
  HOUSE_LABELS,
  PropertyColor,
} from '@/lib/types';

interface PropertyPortfolioProps {
  room: ClientRoomView;
  canManage?: boolean;
  onMortgage?: (spaceIndex: number) => void;
  onUnmortgage?: (spaceIndex: number) => void;
}

export function PropertyPortfolio({
  room,
  canManage = false,
  onMortgage,
  onUnmortgage,
}: PropertyPortfolioProps) {
  const yourId = room.yourPlayerId;
  const you = room.players.find((p) => p.id === yourId);
  const ownedIndices = you?.properties ?? [];

  const ownedSpaces = ownedIndices
    .map((idx) => {
      const space = room.board.find((s) => s.index === idx);
      const propState = room.properties.find((p) => p.spaceIndex === idx);
      return space ? { space, propState } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.space.index - b!.space.index) as Array<{
    space: (typeof room.board)[0];
    propState: (typeof room.properties)[0] | undefined;
  }>;

  if (!yourId) return null;

  return (
    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-700 w-full max-w-sm">
      <h3 className="text-lg font-bold text-amber-300 mb-1">My Properties</h3>
      <p className="text-xs text-slate-400 mb-4">
        Manage countries · mortgage for cash or unmortgage to collect rent
      </p>

      {ownedSpaces.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm italic bg-slate-800/30 rounded-lg">
          No properties yet — buy countries when you land on them!
        </div>
      ) : (
        <ul className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {ownedSpaces.map(({ space, propState }) => {
            const isBuildable = space.type === 'property' && space.houseCost;
            const costs = isBuildable ? getHouseUpgradeCosts(space.houseCost!) : null;
            const houses = propState?.houses ?? 0;
            const isMortgaged = propState?.isMortgaged ?? false;
            const color = space.color ? COLOR_MAP[space.color as PropertyColor] : '#64748b';
            const mortgageVal = space.price ? getMortgageValue(space.price) : 0;
            const unmortgageCost = space.price ? getUnmortgageCost(space.price) : 0;
            const canMortgage = canManage && !isMortgaged && houses === 0;

            return (
              <li
                key={space.index}
                className={`bg-slate-800/50 rounded-xl overflow-hidden border ${
                  isMortgaged ? 'border-red-800/50 opacity-80' : 'border-slate-700/50'
                }`}
              >
                <div className="h-1.5" style={{ backgroundColor: color }} />
                <div className="p-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold text-white text-sm">{space.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Bought for ${space.price}
                        {isMortgaged && (
                          <span className="text-red-400 ml-2">· Mortgaged</span>
                        )}
                      </p>
                    </div>
                    {houses > 0 && isBuildable && !isMortgaged && (
                      <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full shrink-0">
                        {houses >= 5 ? 'Hotel' : `${houses}🏠`}
                      </span>
                    )}
                  </div>

                  {space.rent && !isMortgaged && (
                    <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                      <div className="bg-slate-900/60 px-1.5 py-1 rounded text-center">
                        <span className="text-slate-500 block">Rent</span>
                        <span className="text-emerald-300 font-medium">${space.rent[0]}</span>
                      </div>
                      {isBuildable && space.rent[5] && (
                        <div className="bg-slate-900/60 px-1.5 py-1 rounded text-center col-span-2">
                          <span className="text-slate-500 block">Max (Hotel)</span>
                          <span className="text-amber-300 font-medium">${space.rent[5]}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {isMortgaged && space.price && (
                    <p className="mt-2 text-xs text-slate-400">
                      Unmortgage for <span className="text-amber-300">${unmortgageCost}</span>
                    </p>
                  )}

                  {costs && !isMortgaged && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                        Build costs (${space.houseCost} each)
                      </p>
                      <div className="grid grid-cols-5 gap-1">
                        {HOUSE_LABELS.map((label, i) => {
                          const costKey = ['house1', 'house2', 'house3', 'house4', 'hotel'][
                            i
                          ] as keyof typeof costs;
                          const totalCost = costs[costKey];
                          const level = i + 1;
                          const isCurrent =
                            (level < 5 && houses === level) || (level === 5 && houses >= 5);
                          const isPast = houses > level;

                          return (
                            <div
                              key={label}
                              className={`text-center px-0.5 py-1.5 rounded-lg text-[9px] leading-tight ${
                                isCurrent
                                  ? 'bg-amber-600/30 ring-1 ring-amber-500 text-amber-200'
                                  : isPast
                                    ? 'bg-emerald-900/30 text-emerald-400'
                                    : 'bg-slate-900/40 text-slate-400'
                              }`}
                            >
                              <span className="block font-medium">
                                {i < 4 ? `${level}🏠` : '🏨'}
                              </span>
                              <span className="block mt-0.5">${totalCost}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {canManage && space.price && (
                    <div className="mt-3 flex gap-2">
                      {canMortgage && onMortgage && (
                        <button
                          type="button"
                          onClick={() => onMortgage(space.index)}
                          className="flex-1 py-1.5 text-xs font-semibold bg-orange-700/80 hover:bg-orange-600 text-white rounded-lg transition"
                        >
                          Mortgage ${mortgageVal}
                        </button>
                      )}
                      {isMortgaged && onUnmortgage && (
                        <button
                          type="button"
                          onClick={() => onUnmortgage(space.index)}
                          className="flex-1 py-1.5 text-xs font-semibold bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg transition"
                        >
                          Unmortgage ${unmortgageCost}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {you?.money !== undefined && (
        <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center">
          <span className="text-sm text-slate-400">Your balance</span>
          <span className="text-lg font-bold text-emerald-400">${you.money}</span>
        </div>
      )}
    </div>
  );
}
