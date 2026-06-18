import {
  BarChart3,
  BookOpen,
  Brain,
  Headphones,
  Highlighter,
  ListChecks,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { to: "/read", label: "Đọc truyện", icon: BookOpen },
  { to: "/review", label: "Ôn SRS", icon: Brain },
  { to: "/quiz", label: "Quiz", icon: ListChecks },
  { to: "/cloze", label: "Cloze", icon: Highlighter },
  { to: "/listen", label: "Nghe", icon: Headphones },
  { to: "/dashboard", label: "Tiến độ", icon: BarChart3 },
];

export default function AppShell() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("flipped_theme") || "sepia",
  );

  useEffect(() => {
    const handleThemeChange = (event) => setTheme(event.detail);
    window.addEventListener("flipped-theme-change", handleThemeChange);
    return () =>
      window.removeEventListener("flipped-theme-change", handleThemeChange);
  }, []);

  return (
    <div className={`learning-app theme-${theme}`}>
      <header className="global-header">
        <NavLink to="/read" className="global-brand">
          <span className="logo-icon">F</span>
          <span>
            <strong>Flipped Song Ngữ</strong>
            <small>Đọc · luyện · nhớ lâu</small>
          </span>
        </NavLink>

        <nav className="global-nav" aria-label="Điều hướng học tập">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `global-nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="route-content">
        <Outlet />
      </main>
    </div>
  );
}
