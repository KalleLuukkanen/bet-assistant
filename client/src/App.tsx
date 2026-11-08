import { Routes, Route } from "react-router-dom";
import AuthPage from "./features/auth/AuthPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
    </Routes>
  );
}
