import { NavLink } from "react-router-dom";
import { routes } from "@/app/routes/routes";

export function SidebarNav({open,onClose}:{open:boolean;onClose:()=>void}) {
  return (
    <>
    {open&&<button className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" aria-label="Close navigation" onClick={onClose}/>}
    <nav
      aria-label="Primary"
      className={`fixed inset-y-0 left-0 z-50 w-60 border-r border-slate-200 bg-white px-4 py-5 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${open?"translate-x-0":"-translate-x-full"}`}
    >
      <div className="mb-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
        TOG-2 Visualizer
      </div>
      {Object.values(routes).map((route) => (
        <NavLink
          key={route.path}
          to={route.path}
          className={({ isActive }) =>
            [
              "mb-1 block rounded-md px-3 py-2 text-sm font-medium",
              isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
            ].join(" ")
          }
        >
          {route.label}
        </NavLink>
      ))}
    </nav></>
  );
}
