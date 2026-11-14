import { useParams } from "react-router-dom";
import { getOne } from "../api/nba/nbaGamesApi";
import { useState, useEffect } from "react";
import type { NbaGame } from "../types/nba";
import { APIError } from "better-auth";
import Loading from "../components/Loading";
import NBAGameTeam from "../features/sports/nba/NBAGameTeam";

function NBAGame() {

    const { gameId } = useParams();

    const [loading, setLoading] = useState(true);

    const [game, setGame] = useState<NbaGame | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const game = await getOne(gameId as string);
                if (!cancelled) setGame(game);
            } catch (err) {
                if (!cancelled) {
                    if (err instanceof APIError && err.statusCode === 404) {
                        alert("Game data not found");
                    } else {
                        alert("Something went wrong, please try again");
                    }
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true };
    }, [gameId]);

    if (loading) return <Loading />;
    if (!game) return;

    return (
        <div className="flex flex-col bg-gray-300 p-2 rounded">
            <span className="text-3xl font-bold">{game.away_team} @ {game.home_team} - {new Date(game.game_date).toLocaleDateString("fi-FI")}</span>
            <div className="grid grid-cols-2 gap-4">
                <NBAGameTeam team_id={game.away_team_id} />
                <NBAGameTeam team_id={game.home_team_id} />
            </div>
        </div>
    )
}

export default NBAGame;