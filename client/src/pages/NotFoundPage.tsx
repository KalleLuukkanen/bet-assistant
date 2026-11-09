import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-white">
            <h1 className="text-4xl font-bold">404</h1>
            <p>This page doesn't exist.</p>
            <Link to="/" className="underline hover:font-bold">
                Back to home
            </Link>
        </div>
    );
}
