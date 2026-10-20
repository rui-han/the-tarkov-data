"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_GAME_MODE, isGameMode, type GameMode } from "@/lib/tarkovApi";

export const STORAGE_KEY = "tarkov-data:game-mode";

interface GameModeContextValue {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  /**
   * False until the saved mode has been read from localStorage (which is only
   * possible after mount). Data hooks wait for it so a PvE user doesn't first
   * download the PvP files.
   */
  isReady: boolean;
}

const GameModeContext = createContext<GameModeContextValue>({
  gameMode: DEFAULT_GAME_MODE,
  setGameMode: () => {},
  isReady: true,
});

export function GameModeProvider({ children }: { children: ReactNode }) {
  // Always start from the default so the server render and the first client
  // render match (no hydration mismatch); the saved value is applied on mount.
  const [gameMode, setGameModeState] = useState<GameMode>(DEFAULT_GAME_MODE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isGameMode(stored)) setGameModeState(stored);
    } catch {
      // storage can be unavailable (private mode, blocked cookies): use default
    }
    setIsReady(true);
  }, []);

  const setGameMode = useCallback((mode: GameMode) => {
    setGameModeState(mode);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // not persisted, still applies for this session
    }
  }, []);

  const value = useMemo(
    () => ({ gameMode, setGameMode, isReady }),
    [gameMode, setGameMode, isReady],
  );

  return (
    <GameModeContext.Provider value={value}>
      {children}
    </GameModeContext.Provider>
  );
}

export function useGameMode(): GameModeContextValue {
  return useContext(GameModeContext);
}
