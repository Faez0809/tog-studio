import type { PropsWithChildren } from "react";
import { InspectorDrawer } from "@/components/inspector";
import { SidebarNav } from "./SidebarNav";
import { TopBar } from "./TopBar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] grid-rows-[64px_1fr] bg-slate-50">
      <SidebarNav />
      <TopBar />
      <main className="col-start-2 row-start-2 p-8">{children}</main>
      <InspectorDrawer />
    </div>
  );
}
