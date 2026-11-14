import { useState, useEffect } from "react";
import { getUpcomingGames } from "../../../api/nba/nbaGamesApi";
import type { NbaGame } from "../../../types/nba";
import NBAGameCard from "./NBAGameCard";

function NBAInfo() {

    const [loading, setLoading] = useState<boolean>(true);

    const [upcomingGames, setUpcomingGames] = useState<NbaGame[]>([]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const games = await getUpcomingGames();
                if (!cancelled) setUpcomingGames(games);
            } catch (error) {
                if (!cancelled) {
                    alert("Something went wrong, please try again");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true };
    }, []);


    if (loading) {
        return (
            <p className="text-2xl">Loading...</p>
        )
    }

    if (upcomingGames.length === 0) {
        return (
            <div className="flex flex-col space-y-4">
                <p className="text-xl">Upcoming games not found...</p>
            </div>
        )
    }

    return (
        <>
            <span className="text-xl">Upcoming games:</span>
            <ul className="flex flex-wrap gap-4 p-4">
                {upcomingGames.map((g) => (
                    <li key={g.id}>
                        <NBAGameCard game={g} />
                    </li>
                ))}
            </ul>
        </>

    )
}

export default NBAInfo;