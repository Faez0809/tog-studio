import { useEffect, useState, type PropsWithChildren } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { routes } from "@/app/routes/routes";
import { InspectorDrawer } from "@/components/inspector";
import { GlobalSearch } from "@/components/common/GlobalSearch";
import { SidebarNav } from "./SidebarNav";
import { TopBar } from "./TopBar";

export function AppShell({ children }: PropsWithChildren) {
  const [navOpen,setNavOpen]=useState(false); const [searchOpen,setSearchOpen]=useState(false); const location=useLocation();
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setSearchOpen(true)}if(e.key==="Escape")setNavOpen(false)};addEventListener("keydown",onKey);return()=>removeEventListener("keydown",onKey)},[]);
  useEffect(()=>setNavOpen(false),[location.pathname]);
  useEffect(()=>{document.body.style.overflow=navOpen?"hidden":"";return()=>{document.body.style.overflow=""}},[navOpen]);
  const current=Object.values(routes).find(route=>route.path===location.pathname);
  return (
    <div className="app-shell min-h-screen bg-slate-50 dark:bg-slate-950">
      <SidebarNav open={navOpen} onClose={()=>setNavOpen(false)} />
      <TopBar onMenu={()=>setNavOpen(true)} onSearch={()=>setSearchOpen(true)} />
      <AnimatePresence mode="wait"><motion.main key={location.pathname} id="main-content" className="min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:.18}}><nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-slate-600"><Link className="rounded px-1 py-1 font-medium hover:text-cyan-700" to="/">Home</Link>{current&&current.path!=="/"&&<><ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-slate-400"/><span aria-current="page" className="truncate font-semibold text-slate-800">{current.label}</span></>}</nav>{children}</motion.main></AnimatePresence>
      <InspectorDrawer />
      <GlobalSearch open={searchOpen} onClose={()=>setSearchOpen(false)}/>
    </div>
  );
}
