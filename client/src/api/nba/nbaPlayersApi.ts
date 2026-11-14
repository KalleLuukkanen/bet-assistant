import { get, post } from "../apiClient";
import type { NbaPlayer } from "../../types/nba";

// get one player based on id
const getOne = (playerId: number) =>
    get<NbaPlayer>(`/api/nba/players/${playerId}`);

// get one player based on exact name, case insensitive ('anthony edwards')
const getByName = (name: string) =>
    post<NbaPlayer>("/api/nba/players/name", { name });

// search players by part of name ('edwa'), at least 2 characters
const searchPlayers = (query: string, limit?: number) =>
    post<NbaPlayer[]>("/api/nba/players/search", { query, limit });

export {
    getOne,
    getByName,
    searchPlayers,
};
