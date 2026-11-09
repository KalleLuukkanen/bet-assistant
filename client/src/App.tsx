import { Routes, Route } from "react-router-dom";
import AuthPage from "./features/auth/AuthPage";
import MainPage from "./pages/MainPage";
import RequireAuth from "./features/auth/RequireAuth";
import Layout from "./Layout";
import NotFoundPage from "./pages/NotFoundPage";

//protected routes inside RequireAuth
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />} >
        <Route path="/" element={<MainPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<RequireAuth />}></Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
