import { authClient } from "../utils/auth";
import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";

type UserState = {
    loading: boolean;
    email: string | null;
    createdAt?: Date;
};

type AuthContextValue = {
    userState: UserState;
    logout: () => Promise<void>;
    deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [userState, setUserState] = useState<UserState>({ loading: true, email: null });
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        authClient.getSession().then((session) => {
            if (session?.data?.user?.email) {
                setUserState({ email: session.data.user.email, loading: false, createdAt: session.data.user.createdAt });
            } else {
                setUserState({ loading: false, email: null });
            }
        })
    }, []);

    const logout = async () => {
        await authClient.signOut();
    };

    const deleteAccount = async () => {
        await authClient.deleteUser();
    };

    return (
        <AuthContext.Provider value={{ userState, logout, deleteAccount }
        }>
            {children}
        </AuthContext.Provider>
    );
}

export function useUserState() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useUserState must be used within AuthProvider");
    return ctx;
}