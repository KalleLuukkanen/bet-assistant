import type { NbaGame } from "../../../types/nba";

function NBAGameCard({ game }: { game: NbaGame }) {
    return (
        <div className="flex flex-col shadow rounded bg-gray-300 p-2 space-y-2 w-64">
            <p>{game.away_team} @ {game.home_team} </p>
            <p>{new Date(game.game_date).toLocaleDateString("fi-FI")}</p>
            <a className="ml-auto mt-2 text-blue-500 hover:underline text-lg" href={`/nba/${game.id}`}>See more</a>
        </div>
    )
}

export default NBAGameCard;