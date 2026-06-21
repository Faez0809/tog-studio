import { DatasetSelector } from "./DatasetSelector";
import { TraceSelector } from "./TraceSelector";
import { Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "@/components/common/ThemeProvider";

export function TopBar({onMenu,onSearch}:{onMenu:()=>void;onSearch:()=>void}) {
  const {theme,setTheme}=useTheme();
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3"><button className="icon-button lg:hidden" onClick={onMenu} aria-label="Open navigation"><Menu className="h-5 w-5"/></button><div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">Educational Runtime Explorer</p>
        <p className="hidden text-xs text-slate-500 sm:block">Trace graph reasoning from question to answer</p>
      </div></div>
      <div className="flex items-center gap-2">
        <button className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 md:flex dark:border-slate-700" onClick={onSearch}><Search className="h-4 w-4"/>Search <kbd>Ctrl K</kbd></button>
        <button className="icon-button" onClick={()=>setTheme(theme==="dark"?"light":"dark")} aria-label={`Switch to ${theme==="dark"?"light":"dark"} theme`}>{theme==="dark"?<Sun className="h-5 w-5"/>:<Moon className="h-5 w-5"/>}</button>
        <div className="hidden items-center gap-2 xl:flex"><DatasetSelector /><TraceSelector /></div>
      </div>
    </header>
  );
}
