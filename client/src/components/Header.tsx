import { useState } from "react";
import { LogIn, House } from "lucide-react";

const sports: Record<string, string[]> = {
    Basketball: ["NBA", "EuroLeague"],
    Football: ["LaLiga", "Premier League", "Bundesliga"],
    Hockey: ["Liiga", "NHL"],
};

function LeagueList({ leagues }: { leagues: string[] }) {
    return (
        <ul className="absolute left-0 top-full mt-2 z-10 flex flex-col space-y-2 bg-black p-3 rounded shadow-lg min-w-max">
            {leagues.map((l) => (
                <li key={l}>
                    <a
                        className="text-gray-300 hover:font-bold"
                        href={`/${l.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                        {l}
                    </a>
                </li>
            ))}
        </ul>
    );
}

function Header() {
    const [openSport, setOpenSport] = useState<string | null>(null);

    const toggleShowing = (sport: string) => {
        setOpenSport((current) => (current === sport ? null : sport));
    };

    return (
        <div className="flex bg-black p-4">
            <ul className="flex space-x-6 ml-4">
                <a
                    className="text-gray-300 cursor-pointer"
                    href="/"
                >
                    <House />
                </a>
                {Object.entries(sports).map(([sport, leagues]) => (
                    <li key={sport} className="relative">
                        <button
                            className="cursor-pointer text-gray-300 hover:font-bold"
                            onClick={() => toggleShowing(sport)}
                        >
                            {sport}
                        </button>
                        {openSport === sport && <LeagueList leagues={leagues} />}
                    </li>
                ))}
            </ul>
            <div className="ml-auto mr-4">
                <a
                    className="text-gray-300 flex cursor-pointer hover:font-bold"
                    href="/auth"
                >
                    <LogIn />Log in
                </a>
            </div>
        </div>
    );
}

export default Header;
