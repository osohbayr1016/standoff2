import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { API_ENDPOINTS, WS_BASE_URL } from "../../../config/api";

interface LobbyPlayer {
  userId: string;
  inGameName: string;
  standoff2Id?: string;
  elo: number;
  isReady: boolean;
}

interface LobbyData {
  lobbyId: string;
  players: LobbyPlayer[];
  teamAlpha: string[];
  teamBravo: string[];
  leaderId: string;
  lobbyLink: string;
  selectedMap: string;
  allPlayersReady?: boolean;
}

export function useLobby(lobbyId: string, user: any, getToken: () => Promise<string | null>) {
  const router = useRouter();
  const [lobbyData, setLobbyData] = useState<LobbyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const fetchLobby = async () => {
    if (!user || !lobbyId) return;
    try {
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.LOBBY.GET(lobbyId), {
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      });
      if (!response.ok) {
        if (response.status === 404) {
          setError("Lobby not found");
          setTimeout(() => router.push("/matchmaking"), 3000);
        } else { setError("Failed to load lobby"); }
        return;
      }
      const result = await response.json();
      if (result.success && result.data) {
        const lobby = result.data;
        setLobbyData({
          lobbyId: lobby._id,
          leaderId: lobby.leader?._id || lobby.leader,
          lobbyLink: lobby.lobbyLink,
          selectedMap: lobby.selectedMap,
          players: lobby.players.map((p: any) => ({
            userId: p.userId.toString(),
            inGameName: p.inGameName,
            standoff2Id: p.standoff2Id,
            elo: p.elo,
            isReady: p.isReady,
          })),
          teamAlpha: lobby.teamAlpha.map((id: any) => id.toString()),
          teamBravo: lobby.teamBravo.map((id: any) => id.toString()),
          allPlayersReady: lobby.allPlayersReady || false,
        });
      }
    } catch (err) {
      setError("Failed to load lobby");
    } finally {
      setLoading(false);
    }
  };

  const joinLobby = async () => {
    if (!user || !lobbyId) return;
    try {
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.LOBBY.JOIN(lobbyId), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({}), // Empty body to satisfy Content-Type header
      });
      if (response.ok) {
        console.log("[useLobby] Successfully joined lobby");
        // Refresh lobby data after joining
        await fetchLobby();
      } else {
        const result = await response.json();
        console.error("[useLobby] Failed to join lobby:", result.message);
      }
    } catch (err) {
      console.error("[useLobby] Error joining lobby:", err);
    }
  };

  useEffect(() => {
    const initLobby = async () => {
      await fetchLobby();
      // Join the lobby after fetching initial data
      await joinLobby();
    };
    initLobby();
  }, [user, lobbyId]);

  useEffect(() => {
    if (!user || !lobbyId) return;
    const socket = io(WS_BASE_URL, { auth: { token: "" }, transports: ["websocket", "polling"] });
    const initSocket = async () => {
      const token = await getToken();
      if (!token) return;
      socket.auth = { token };
      socket.connect();
    };
    initSocket();
    socketRef.current = socket;
    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("join_lobby", { lobbyId });
    });
    socket.on("lobby_state", (data) => {
      if (data.lobby) {
        setLobbyData({
          lobbyId: data.lobby._id,
          leaderId: data.lobby.leader?._id || data.lobby.leader,
          lobbyLink: data.lobby.lobbyLink,
          selectedMap: data.lobby.selectedMap,
          players: data.lobby.players.map((p: any) => ({
            userId: p.userId.toString(),
            inGameName: p.inGameName,
            standoff2Id: p.standoff2Id,
            elo: p.elo,
            isReady: p.isReady,
          })),
          teamAlpha: data.lobby.teamAlpha.map((id: any) => id.toString()),
          teamBravo: data.lobby.teamBravo.map((id: any) => id.toString()),
          allPlayersReady: data.lobby.allPlayersReady || false,
        });
      }
    });
    socket.on("lobby_update", (data) => {
      if (data.lobby) {
        setLobbyData(prev => ({
          ...prev!,
          players: data.lobby.players.map((p: any) => ({
            userId: p.userId.toString(),
            inGameName: p.inGameName,
            standoff2Id: p.standoff2Id,
            elo: p.elo,
            isReady: p.isReady,
          })),
          teamAlpha: data.lobby.teamAlpha.map((id: any) => id.toString()),
          teamBravo: data.lobby.teamBravo.map((id: any) => id.toString()),
          allPlayersReady: data.lobby.allPlayersReady || false,
        }));
      }
    });
    socket.on("player_kicked", (data) => {
      if (data.targetUserId === user.id) {
        setError("You have been kicked from the lobby");
        setTimeout(() => router.push("/matchmaking"), 3000);
      } else { fetchLobby(); }
    });
    socket.on("lobby_cancelled", () => {
      setError("The lobby has been closed by the host");
      setTimeout(() => router.push("/matchmaking"), 3000);
    });
    return () => { socket.disconnect(); };
  }, [user, lobbyId]);

  return { lobbyData, loading, error, socketRef, fetchLobby, setError };
}

