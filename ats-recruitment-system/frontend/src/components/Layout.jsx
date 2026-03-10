import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/jobs", label: "Jobs" },
  { to: "/candidates", label: "Candidates" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/reports", label: "Reports" },
  { to: "/settings", label: "Settings" },
];

const Layout = ({ children, onLogout, user }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <header className="border-b border-brand-100 bg-white/85 backdrop-blur">
        <div className="page-shell flex items-center justify-between py-4">
          <Link to="/dashboard" className="text-xl font-semibold text-brand-700">
            ATS Recruitment System
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded bg-brand-50 px-3 py-1 text-brand-700">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              type="button"
              className="rounded bg-slate-900 px-3 py-1.5 text-white"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="page-shell grid gap-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded px-3 py-2 text-sm ${
                    isActive ? "bg-brand-500 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
