'use client';

import { useState } from 'react';
import { CardEffect } from '@/lib/types';

interface CardReferencePanelProps {
  chanceCards: CardEffect[];
  communityCards: CardEffect[];
}

function CardList({
  title,
  icon,
  cards,
  accent,
}: {
  title: string;
  icon: string;
  cards: CardEffect[];
  accent: string;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-slate-700/80 overflow-hidden bg-slate-900/60">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 transition"
      >
        <span className="flex items-center gap-2 font-semibold text-white">
          <span className={`text-lg ${accent}`}>{icon}</span>
          {title}
          <span className="text-xs font-normal text-slate-400">({cards.length} cards)</span>
        </span>
        <span className="text-slate-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <ul className="px-3 pb-3 space-y-1.5 max-h-52 overflow-y-auto scrollbar-thin">
          {cards.map((card, i) => (
            <li
              key={i}
              className="text-xs text-slate-300 bg-slate-800/40 px-3 py-2 rounded-lg leading-relaxed border-l-2 border-transparent hover:border-amber-500/50"
            >
              <span className="text-slate-500 mr-2">{i + 1}.</span>
              {card.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CardReferencePanel({ chanceCards, communityCards }: CardReferencePanelProps) {
  return (
    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-700 w-full max-w-sm">
      <h3 className="text-lg font-bold text-amber-300 mb-1">Card Reference</h3>
      <p className="text-xs text-slate-400 mb-4">
        All possible Global Chance & World Fund (Opportunity) cards
      </p>
      <div className="space-y-3">
        <CardList
          title="Global Chance"
          icon="🎲"
          cards={chanceCards}
          accent="text-orange-400"
        />
        <CardList
          title="World Fund (Opportunity)"
          icon="🌍"
          cards={communityCards}
          accent="text-blue-400"
        />
      </div>
    </div>
  );
}
