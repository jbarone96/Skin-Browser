import { useCallback, useEffect, useState } from "react";

export type SteamUser = {
  steamId: string;
  displayName: string;
  avatar: string;
  profileUrl: string;
};

type AuthResponse = {
  isAuthenticated: boolean;
  user: SteamUser | null;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

export function useSteamAuth() {
  const [user, setUser] = useState<SteamUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load Steam auth state.");
      }

      const data = (await response.json()) as AuthResponse;

      setUser(data.user);
      setIsAuthenticated(data.isAuthenticated);
    } catch (error) {
      console.error(error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(() => {
    window.location.href = `${API_BASE_URL}/auth/steam`;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    refresh,
  };
}
