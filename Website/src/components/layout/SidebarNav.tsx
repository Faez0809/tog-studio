import { NavLink } from "react-router-dom";
import { routes } from "@/app/routes";

export function SidebarNav() {
  return (
    <nav aria-label="Primary">
      {Object.values(routes).map((route) => (
        <NavLink key={route.path} to={route.path}>
          {route.label}
        </NavLink>
      ))}
    </nav>
  );
}
