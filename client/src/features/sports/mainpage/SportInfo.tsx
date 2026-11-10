import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import LeagueInfo from "./LeagueInfo";

function SportInfo({ leagues }: { leagues: string[] }) {
    // all leagues open by default
    const [openLeagues, setOpenLeagues] = useState<string[]>([]);

    const toggleShowing = (league: string) => {
        setOpenLeagues((prev) =>
            prev.includes(league) ? prev.filter((l) => l !== league) : [...prev, league]
        );
    };

    return (
        <ul className="flex flex-col space-y-4 p-4">
            {leagues.map((l) => (
                <li key={l}>
                    <button
                        className="text-xl underline cursor-pointer flex items-center"
                        onClick={() => toggleShowing(l)}
                    >
                        {l} {openLeagues.includes(l) ? <ChevronDown /> : <ChevronRight />}
                    </button>
                    {openLeagues.includes(l) &&
                        <div className="p-4">
                            <LeagueInfo league={l} />
                        </div>
                    }
                </li>
            ))}
        </ul>
    )
}

export default SportInfo;