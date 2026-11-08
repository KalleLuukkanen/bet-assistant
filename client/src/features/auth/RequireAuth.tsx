import { Outlet } from "react-router-dom";
import { useUserState } from "../../context/AuthContext";
import AuthPage from "./AuthPage";
import Loading from "../../components/Loading";

function RequireAuth() {
    const { userState } = useUserState();

    if (userState.loading) {
        return <Loading />;
    }

    if (!userState.email) {
        return <AuthPage />
    }

    return <Outlet />;
}

export default RequireAuth;