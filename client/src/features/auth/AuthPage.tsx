import { LogIn, LogOut, UserPlus } from "lucide-react";
import { authClient } from "../../utils/auth";
import { useState, type FormEvent } from "react";
import Loading from "../../components/Loading";

function AuthPage() {
    const { data: session, isPending } = authClient.useSession();
    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        const { error } =
            mode === "signup"
                ? await authClient.signUp.email({ name, email, password })
                : await authClient.signIn.email({ email, password });
        if (error) setError(error.message ?? "Something went wrong");
    };

    if (isPending) return <Loading />;

    if (session) {
        return (
            <div className="mx-auto mt-16 max-w-sm space-y-4 p-4">
                <h1 className="text-2xl font-semibold">Hi, {session.user.name}</h1>
                <button
                    onClick={() => authClient.signOut()}
                    className="flex items-center gap-2 rounded bg-gray-900 px-4 py-2 text-white"
                >
                    <LogOut size={16} /> Sign out
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="mx-auto mt-16 max-w-sm space-y-3 p-4">
            <h1 className="text-2xl font-semibold">
                {mode === "signup" ? "Create account" : "Sign in"}
            </h1>
            {mode === "signup" && (
                <input className="w-full rounded border p-2" placeholder="Name"
                    value={name} onChange={(e) => setName(e.target.value)} required />
            )}
            <input className="w-full rounded border p-2" type="email" placeholder="Email"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="w-full rounded border p-2" type="password" placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit"
                className="flex w-full items-center justify-center gap-2 rounded bg-gray-900 px-4 py-2 text-white cursor-pointer">
                {mode === "signup" ? <><UserPlus size={16} /> Sign up</> : <><LogIn size={16} /> Sign in</>}
            </button>
            <button type="button" className="w-full text-sm text-gray-600 underline cursor-pointer"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
                {mode === "signup" ? "Have an account? Sign in" : "No account? Sign up"}
            </button>
        </form>
    );
}

export default AuthPage;