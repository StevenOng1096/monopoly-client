'use client';

import {
  BoardSpace,
  ClientRoomView,
  COLOR_MAP,
  getHouseUpgradeCosts,
  getMortgageValue,
  getSpaceTypeLabel,
  getUnmortgageCost,
  PLAYER_COLORS,
  PropertyColor,
  RENT_LABELS,
} from '@/lib/types';

interface SpaceDetailPopupProps {
  space: BoardSpace;
  room: ClientRoomView;
  onClose: () => void;
  onMortgage?: (spaceIndex: number) => void;
  onUnmortgage?: (spaceIndex: number) => void;
  canManage?: boolean;
}

export function SpaceDetailPopup({
  space,
  room,
  onClose,
  onMortgage,
  onUnmortgage,
  canManage = false,
}: SpaceDetailPopupProps) {
  const propState = room.properties.find((p) => p.spaceIndex === space.index);
  const owner = propState?.ownerId
    ? room.players.find((p) => p.id === propState.ownerId)
    : null;
  const ownerIndex = owner ? room.players.findIndex((p) => p.id === owner.id) : -1;
  const isYours = propState?.ownerId === room.yourPlayerId;
  const isPurchasable = ['property', 'railroad', 'utility'].includes(space.type);
  const color = space.color ? COLOR_MAP[space.color as PropertyColor] : null;
  const houses = propState?.houses ?? 0;
  const isMortgaged = propState?.isMortgaged ?? false;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="space-detail-title"
    >
      <div
        className="bg-slate-900 border border-slate-600 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {color && <div className="h-3 rounded-t-2xl" style={{ backgroundColor: color }} />}
        {!color && space.type === 'railroad' && (
          <div className="h-3 rounded-t-2xl bg-slate-500" />
        )}
        {!color && space.type === 'utility' && (
          <div className="h-3 rounded-t-2xl bg-yellow-500" />
        )}

        <div className="p-5">
          <div className="flex justify-between items-start gap-3 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                {getSpaceTypeLabel(space.type)}
              </p>
              <h3 id="space-detail-title" className="text-2xl font-bold text-white mt-0.5">
                {space.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl leading-none px-1"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {owner && (
            <div className="flex items-center gap-2 mb-4 bg-slate-800/60 rounded-lg px-3 py-2">
              <div
                className="w-4 h-4 rounded-full border border-white/30"
                style={{ backgroundColor: PLAYER_COLORS[ownerIndex] }}
              />
              <span className="text-sm text-slate-200">
                Owned by <strong>{owner.name}</strong>
                {isYours && <span className="text-blue-400 ml-1">(You)</span>}
              </span>
              {isMortgaged && (
                <span className="ml-auto text-xs bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full">
                  Mortgaged
                </span>
              )}
            </div>
          )}

          {!owner && isPurchasable && (
            <p className="text-emerald-400 text-sm mb-4 bg-emerald-900/20 rounded-lg px-3 py-2">
              Available to buy — unowned
            </p>
          )}

          <div className="space-y-3 text-sm">
            {space.price != null && (
              <Row label="Purchase price" value={`$${space.price}`} highlight />
            )}

            {isPurchasable && space.price != null && (
              <>
                <Row label="Mortgage value (50%)" value={`$${getMortgageValue(space.price)}`} />
                <Row
                  label="Unmortgage cost (+10%)"
                  value={`$${getUnmortgageCost(space.price)}`}
                />
              </>
            )}

            {space.taxAmount != null && (
              <Row label="Tax amount" value={`$${space.taxAmount}`} highlight />
            )}

            {space.type === 'go' && (
              <Row label="Passing bonus" value="$200" highlight />
            )}

            {space.houseCost != null && (
              <Row label="House / hotel cost" value={`$${space.houseCost} each`} />
            )}

            {houses > 0 && (
              <Row
                label="Buildings"
                value={houses >= 5 ? '1 Hotel' : `${houses} House${houses > 1 ? 's' : ''}`}
              />
            )}
          </div>

          {space.rent && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Rent</p>
              <div className="h-scroll-slider -mx-1 px-1 pb-1">
                <div className="grid grid-cols-3 gap-2 min-w-[280px] sm:min-w-0">
                {space.rent.map((rent, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/60 rounded-lg px-2 py-2 text-center"
                  >
                    <span className="text-[10px] text-slate-500 block">{RENT_LABELS[i]}</span>
                    <span className="text-emerald-300 font-semibold">${rent}</span>
                  </div>
                ))}
                </div>
              </div>
            </div>
          )}

          {space.houseCost != null && space.type === 'property' && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                Cost to build 1–4 houses & 1 hotel
              </p>
              <div className="h-scroll-slider -mx-1 px-1 pb-1">
                <div className="grid grid-cols-5 gap-2 min-w-[300px] sm:min-w-0">
                {(['1 House', '2 Houses', '3 Houses', '4 Houses', 'Hotel'] as const).map(
                  (label, i) => {
                    const costs = getHouseUpgradeCosts(space.houseCost!);
                    const costKey = ['house1', 'house2', 'house3', 'house4', 'hotel'][
                      i
                    ] as keyof typeof costs;
                    return (
                      <div key={label} className="bg-slate-800/60 rounded-lg py-2 text-center">
                        <span className="text-[10px] text-slate-400 block">
                          {i < 4 ? `${i + 1}🏠` : '🏨'}
                        </span>
                        <span className="text-sm text-amber-300 font-semibold block mt-1">
                          ${costs[costKey]}
                        </span>
                        <span className="text-[9px] text-slate-500">total</span>
                      </div>
                    );
                  },
                )}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                ${space.houseCost} per house · cumulative from empty lot
              </p>
            </div>
          )}

          {isYours && canManage && isPurchasable && !isMortgaged && onMortgage && (
            <button
              type="button"
              onClick={() => onMortgage(space.index)}
              className="mt-5 w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl transition"
            >
              Mortgage for ${getMortgageValue(space.price ?? 0)}
            </button>
          )}

          {isYours && canManage && isMortgaged && onUnmortgage && (
            <button
              type="button"
              onClick={() => onUnmortgage(space.index)}
              className="mt-5 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition"
            >
              Unmortgage for ${getUnmortgageCost(space.price ?? 0)}
            </button>
          )}

          <p className="text-[10px] text-slate-500 text-center mt-4">
            Tap outside or press × to close
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className={highlight ? 'text-amber-300 font-semibold' : 'text-white font-medium'}>
        {value}
      </span>
    </div>
  );
}
