import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

type Theme = "light" | "dark" | "system";
const ThemeContext = createContext({ theme: "system" as Theme, setTheme: (_: Theme) => {} });

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("tog-theme") as Theme) || "system");
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && media.matches));
    apply(); localStorage.setItem("tog-theme", theme); media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
