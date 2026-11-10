import SportInfo from "../features/sports/mainpage/SportInfo";
import { sports } from "../types/sports";
import { useState } from "react";

function MainPage() {
    // all sports open by default
    const [openSports, setOpenSports] = useState<string[]>(() => Object.keys(sports));

    const toggleShowing = (sport: string) => {
        setOpenSports((prev) =>
            prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
        );
    };

    return (
        <ul className="flex flex-col space-y-4">
            {Object.entries(sports).map(([sport, leagues]) => (
                <li key={sport} className="relative">
                    <button
                        className="cursor-pointer text-gray-300 text-3xl hover:font-bold"
                        onClick={() => toggleShowing(sport)}
                    >
                        {sport}
                    </button>
                    {openSports.includes(sport) && <SportInfo leagues={leagues} />}
                </li>
            ))}
        </ul>
    )
}

export default MainPage;