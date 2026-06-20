import { NavLink } from "react-router-dom";
import { routes } from "@/app/routes";

export function SidebarNav() {
  return (
    <nav
      aria-label="Primary"
      className="row-span-2 border-r border-slate-200 bg-white px-4 py-5"
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
    </nav>
  );
}
