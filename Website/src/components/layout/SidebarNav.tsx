import { NavLink } from "react-router-dom";
import { Home, X } from "lucide-react";
import { routes } from "@/app/routes/routes";

export function SidebarNav({open,onClose}:{open:boolean;onClose:()=>void}) {
  return (
    <>
    {open&&<button className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" aria-label="Close navigation" onClick={onClose}/>}
    <nav
      aria-label="Primary"
      className={`fixed inset-y-0 left-0 z-50 w-60 border-r border-slate-200 bg-white px-4 py-5 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${open?"translate-x-0":"-translate-x-full"}`}
    >
      <div className="mb-6 flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-slate-500"><span>Explore TOG-2</span><button className="icon-button lg:hidden" onClick={onClose} aria-label="Close navigation"><X className="h-5 w-5"/></button></div>
      {Object.values(routes).map((route) => (
        <NavLink
          key={route.path}
          to={route.path}
          className={({ isActive }) =>
            [
              "mb-1 block rounded-md px-3 py-2 text-sm font-medium",
              isActive ? "bg-cyan-800 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
            ].join(" ")
          }
        >
          <span className="flex items-center gap-2">{route.path==="/"&&<Home className="h-4 w-4"/>}{route.label}</span>
        </NavLink>
      ))}
    </nav></>
  );
}
