import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useNavigate: () => vi.fn(),
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: () => null,
  Navigate: () => null,
}));

// Mock AuthProvider and useAuth
vi.mock("./components/AuthProvider", () => ({
  __esModule: true,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({ user: null, loading: false }),
}));

describe("App", () => {
  it("renders App component", () => {
    render(<App />);
    const elements = screen.getAllByText(/Cosmic Insights/);
    expect(elements.length).toBeGreaterThan(0);
  });
});