import { BrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </BrowserRouter>
  );
}
