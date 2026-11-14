import { getRoster, getOne } from "../../../api/nba/nbaTeamsApi";
import { getTeamsPastGames } from "../../../api/nba/nbaGamesApi";
import { useEffect, useState } from "react";
import type { NbaTeam } from "../../../types/nba";
import { ApiError } from "../../../api/apiClient";

function NBAGameTeam({ team_id }: { team_id: number }) {

    const [loading, setLoading] = useState(true);

    const [team, setTeam] = useState<NbaTeam | null>(null);
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const team = await getOne(team_id);
                if (!cancelled) setTeam(team);
            } catch (err) {
                if (cancelled) return;
                if (err instanceof ApiError && err.status === 404) {
                    alert("Team data not found");
                } else {
                    alert("Something went wrong, please try again");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true };
    }, [team_id]);

    if (loading) return <p className="text-2xl">Loading...</p>;
    if (!team) return;

    return (
        <div className="flex flex-col space-y-4 mt-6">
            <span className="text-2xl underline">{team.name}</span>
            <div>
                <span className="text-xl">Last 5 games:</span>
            </div>
            <div>
                <span className="text-xl">Roster:</span>
            </div>
        </div>
    )
}

export default NBAGameTeam;