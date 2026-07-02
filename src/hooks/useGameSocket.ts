'use client';

import { useCallback, useEffect, useState } from 'react';
import { clearSession, disconnectSocket, getSocket, loadSession, saveSession } from '@/lib/socket';
import { ClientRoomView } from '@/lib/types';

export function useGameSocket(roomCode?: string) {
  const [room, setRoom] = useState<ClientRoomView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onRoomJoined = (view: ClientRoomView) => {
      setRoom(view);
      setError(null);
      if (view.yourPlayerId) {
        const player = view.players.find((p) => p.id === view.yourPlayerId);
        saveSession({
          roomCode: view.code,
          playerId: view.yourPlayerId,
          playerName: player?.name ?? '',
        });
      }
    };
    const onRoomUpdate = (view: ClientRoomView) => {
      setRoom((prev) => ({
        ...view,
        yourPlayerId: view.yourPlayerId ?? prev?.yourPlayerId ?? null,
      }));
    };
    const onError = (data: { message: string }) => setError(data.message);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('roomJoined', onRoomJoined);
    socket.on('roomUpdate', onRoomUpdate);
    socket.on('error', onError);

    if (socket.connected) setConnected(true);

    const session = loadSession();
    if (roomCode && session?.roomCode === roomCode.toUpperCase() && session.playerId) {
      socket.emit('reconnect', {
        roomCode: session.roomCode,
        playerId: session.playerId,
      });
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('roomJoined', onRoomJoined);
      socket.off('roomUpdate', onRoomUpdate);
      socket.off('error', onError);
    };
  }, [roomCode]);

  const createRoom = useCallback((playerName: string) => {
    setError(null);
    getSocket().emit('createRoom', { playerName });
  }, []);

  const joinRoom = useCallback((code: string, playerName: string) => {
    setError(null);
    getSocket().emit('joinRoom', { roomCode: code, playerName });
  }, []);

  const startGame = useCallback((code: string) => {
    getSocket().emit('startGame', { roomCode: code });
  }, []);

  const rollDice = useCallback((code: string) => {
    getSocket().emit('rollDice', { roomCode: code });
  }, []);

  const buyProperty = useCallback((code: string) => {
    getSocket().emit('buyProperty', { roomCode: code });
  }, []);

  const skipBuy = useCallback((code: string) => {
    getSocket().emit('skipBuy', { roomCode: code });
  }, []);

  const payRent = useCallback((code: string) => {
    getSocket().emit('payRent', { roomCode: code });
  }, []);

  const resolveCard = useCallback((code: string) => {
    getSocket().emit('resolveCard', { roomCode: code });
  }, []);

  const payJailFine = useCallback((code: string) => {
    getSocket().emit('payJailFine', { roomCode: code });
  }, []);

  const endTurn = useCallback((code: string) => {
    getSocket().emit('endTurn', { roomCode: code });
  }, []);

  const mortgageProperty = useCallback((code: string, spaceIndex: number) => {
    getSocket().emit('mortgageProperty', { roomCode: code, spaceIndex });
  }, []);

  const unmortgageProperty = useCallback((code: string, spaceIndex: number) => {
    getSocket().emit('unmortgageProperty', { roomCode: code, spaceIndex });
  }, []);

  const leaveRoom = useCallback(() => {
    clearSession();
    disconnectSocket();
    setRoom(null);
  }, []);

  return {
    room,
    error,
    connected,
    createRoom,
    joinRoom,
    startGame,
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
    setError,
  };
}
