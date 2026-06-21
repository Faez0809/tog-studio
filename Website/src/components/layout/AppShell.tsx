import { useEffect, useState, type PropsWithChildren } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { InspectorDrawer } from "@/components/inspector";
import { GlobalSearch } from "@/components/common/GlobalSearch";
import { SidebarNav } from "./SidebarNav";
import { TopBar } from "./TopBar";

export function AppShell({ children }: PropsWithChildren) {
  const [navOpen,setNavOpen]=useState(false); const [searchOpen,setSearchOpen]=useState(false); const location=useLocation();
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setSearchOpen(true)}if(e.key==="Escape")setNavOpen(false)};addEventListener("keydown",onKey);return()=>removeEventListener("keydown",onKey)},[]);
  useEffect(()=>setNavOpen(false),[location.pathname]);
  return (
    <div className="app-shell min-h-screen bg-slate-50 dark:bg-slate-950">
      <SidebarNav open={navOpen} onClose={()=>setNavOpen(false)} />
      <TopBar onMenu={()=>setNavOpen(true)} onSearch={()=>setSearchOpen(true)} />
      <AnimatePresence mode="wait"><motion.main key={location.pathname} id="main-content" className="min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:.18}}>{children}</motion.main></AnimatePresence>
      <InspectorDrawer />
      <GlobalSearch open={searchOpen} onClose={()=>setSearchOpen(false)}/>
    </div>
  );
}
