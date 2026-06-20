import type { PropsWithChildren } from "react";
import { InspectorDrawer } from "@/components/inspector";
import { SidebarNav } from "./SidebarNav";
import { TopBar } from "./TopBar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      <SidebarNav />
      <TopBar />
      <main>{children}</main>
      <InspectorDrawer />
    </div>
  );
}
