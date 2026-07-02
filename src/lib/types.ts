export type RoomStatus = 'waiting' | 'playing' | 'finished';
export type GamePhase =
  | 'waiting'
  | 'roll'
  | 'buy'
  | 'pay_rent'
  | 'card'
  | 'jail'
  | 'game_over';

export type SpaceType =
  | 'go'
  | 'property'
  | 'railroad'
  | 'utility'
  | 'tax'
  | 'chance'
  | 'community'
  | 'jail'
  | 'parking'
  | 'gotojail';

export type PropertyColor =
  | 'brown'
  | 'lightblue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'darkblue';

export interface BoardSpace {
  index: number;
  type: SpaceType;
  name: string;
  price?: number;
  rent?: number[];
  color?: PropertyColor;
  houseCost?: number;
  taxAmount?: number;
}

export interface PropertyState {
  spaceIndex: number;
  ownerId: string | null;
  houses: number;
  isMortgaged: boolean;
}

export interface CardEffect {
  type: string;
  amount?: number;
  targetPosition?: number;
  description: string;
}

export interface LastMove {
  playerId: string;
  from: number;
  to: number;
  animateSteps: boolean;
}

export interface GameState {
  phase: GamePhase;
  currentPlayerIndex: number;
  lastDice: [number, number] | null;
  lastRollPlayerId: string | null;
  lastMove: LastMove | null;
  moveCounter: number;
  message: string;
  winnerId: string | null;
  pendingCard: { description: string } | null;
  freeParkingPot: number;
  endReason: 'bankruptcy' | 'opponent_left' | null;
}

export interface ClientRoomView {
  code: string;
  status: RoomStatus;
  maxPlayers: number;
  minPlayers: number;
  players: Array<{
    id: string;
    name: string;
    isHost: boolean;
    money?: number;
    position?: number;
    properties?: number[];
    inJail?: boolean;
    isBankrupt?: boolean;
  }>;
  properties: PropertyState[];
  game: GameState | null;
  board: BoardSpace[];
  chanceCards: CardEffect[];
  communityCards: CardEffect[];
  yourPlayerId: string | null;
}

export const PLAYER_COLORS = ['#E63946', '#457B9D', '#2A9D8F', '#E9C46A'];
export const PLAYER_ICONS = ['🚗', '🎩', '🐕', '⛵'];

export const COLOR_MAP: Record<PropertyColor, string> = {
  brown: '#8B4513',
  lightblue: '#87CEEB',
  pink: '#FF69B4',
  orange: '#FFA500',
  red: '#DC2626',
  yellow: '#EAB308',
  green: '#16A34A',
  darkblue: '#1E3A8A',
};

export const BOARD_SIZE = 40;

/** Clockwise order around the board: GO(0) → bottom → jail → left → top → right → GO */
export const BOARD_CLOCKWISE = Array.from({ length: BOARD_SIZE }, (_, i) => i);

export function getStepPath(from: number, to: number): number[] {
  if (from === to) return [];

  const path: number[] = [];
  let current = from;
  let safety = 0;

  while (current !== to && safety < BOARD_SIZE) {
    current = (current + 1) % BOARD_SIZE;
    path.push(current);
    safety += 1;
  }

  return path;
}

export function getHouseUpgradeCosts(houseCost: number) {
  return {
    house1: houseCost,
    house2: houseCost * 2,
    house3: houseCost * 3,
    house4: houseCost * 4,
    hotel: houseCost * 5,
  };
}

export const HOUSE_LABELS = ['1 House', '2 Houses', '3 Houses', '4 Houses', 'Hotel'] as const;

export function getMortgageValue(price: number): number {
  return Math.floor(price / 2);
}

export function getUnmortgageCost(price: number): number {
  return Math.ceil(getMortgageValue(price) * 1.1);
}

export const RENT_LABELS = ['Base', '1🏠', '2🏠', '3🏠', '4🏠', '🏨'] as const;

export function getSpaceTypeLabel(type: SpaceType): string {
  const labels: Record<SpaceType, string> = {
    go: 'GO',
    property: 'Country Property',
    railroad: 'Railroad',
    utility: 'Utility',
    tax: 'Tax',
    chance: 'Global Chance',
    community: 'World Fund',
    jail: 'Jail',
    parking: 'Free Parking',
    gotojail: 'Go To Jail',
  };
  return labels[type];
}
