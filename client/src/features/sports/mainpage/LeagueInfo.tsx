import NBAInfo from "../nba/NBAInfo";

function LeagueInfo({ league }: { league: string }) {

    if (league === "NBA") {
        return (
            <NBAInfo />
        )
    } else {
        return (
            <div className="flex flex-col space-y-4">
                <p className="text-xl">Upcoming games not found...</p>
            </div>
        )
    }
}

export default LeagueInfo;