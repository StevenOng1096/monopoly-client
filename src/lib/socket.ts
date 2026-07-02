'use client';

import { io, Socket } from 'socket.io-client';
import { ClientRoomView } from './types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export type SocketEvents = {
  connected: (data: { message: string }) => void;
  roomJoined: (view: ClientRoomView) => void;
  roomUpdate: (view: ClientRoomView) => void;
  error: (data: { message: string }) => void;
};

export const SESSION_KEY = 'world-monopoly-session';

export interface SessionData {
  roomCode: string;
  playerId: string;
  playerName: string;
}

export function saveSession(data: SessionData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  }
}

export function loadSession(): SessionData | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}
