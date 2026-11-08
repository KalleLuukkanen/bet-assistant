import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

vi.mock("./utils/auth", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: false }),
    signIn: { email: vi.fn() },
    signUp: { email: vi.fn() },
    signOut: vi.fn(),
  },
}));

test("renders sign-in form when logged out", () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
});
