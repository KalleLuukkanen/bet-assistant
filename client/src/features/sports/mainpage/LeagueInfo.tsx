import { useState } from "react";

function LeagueInfo({ league }: { league: string }) {

    const [upcomingGames, setUpcomingGames] = useState([]);

    if (upcomingGames.length === 0) {
        return (
            <div className="flex flex-col space-y-4">
                <p className="text-xl">Upcoming games not found...</p>
                <p className="text-xl">See more <a href={`/${league}`} className="text-gray-300 hover:underline">here</a></p>
            </div>
        )
    }

    return (
        <>
            <span>Upcoming games:</span>
            <ul className="flex flex-col space-y-4 p-4">
                {upcomingGames.map((g) => (
                    <li key={g}>
                        {g}
                    </li>
                ))}
            </ul>
        </>

    )
}

export default LeagueInfo;