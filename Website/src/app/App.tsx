import { BrowserRouter, useLocation } from "react-router-dom";
import { AppShell } from "@/components/layout";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const { pathname } = useLocation();
  if (pathname === "/" || pathname === "/home") return <AppRoutes />;
  return <AppShell><AppRoutes /></AppShell>;
}
