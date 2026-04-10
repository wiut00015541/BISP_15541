import { Link, NavLink } from "react-router-dom";
import { useLanguage } from "../i18n.jsx";
import NotificationTray from "./NotificationTray";

const Layout = ({ children, onLogout, user }) => {
  const { language, setLanguage, t } = useLanguage();
  const permissions = user?.permissions || [];
  const isAdmin = user?.role === "admin";

  const links = [
    { to: "/dashboard", label: t("nav.dashboard") },
    { to: "/jobs", label: t("nav.jobs") },
    { to: "/candidates", label: t("nav.candidates") },
    { to: "/pipeline", label: t("nav.pipeline") },
    { to: "/reports", label: t("nav.reports") },
    { to: "/settings", label: t("nav.settings") },
  ];

  return (
    <div className="app-shell min-h-screen">
      <div className="app-shell__glow app-shell__glow--left" />
      <div className="app-shell__glow app-shell__glow--right" />

      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="page-shell flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-lg shadow-cyan-200/40">
                SH
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-700">
                  {t("meta.workspace")}
                </p>
                <p className="text-xl font-semibold text-slate-950">{t("common.appName")}</p>
              </div>
            </Link>
          </div>

          <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
            <div className="rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  language === "en" ? "bg-slate-950 text-white" : "text-slate-600"
                }`}
                onClick={() => setLanguage("en")}
              >
                EN
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  language === "ru" ? "bg-slate-950 text-white" : "text-slate-600"
                }`}
                onClick={() => setLanguage("ru")}
              >
                RU
              </button>
            </div>

            <Link to="/settings/profile" className="min-w-[180px] rounded-[24px] border border-slate-200 bg-white px-4 py-2 shadow-sm transition hover:-translate-y-0.5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t("meta.teamPulse")}</p>
              <p className="text-sm font-semibold text-slate-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{user?.role}</p>
            </Link>

            <button
              type="button"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 sm:w-auto"
              onClick={onLogout}
            >
              {t("common.logout")}
            </button>
          </div>
        </div>
      </header>

      <div className="page-shell grid gap-6 pb-10 pt-6 lg:grid-cols-[232px_minmax(0,1fr)]">
        <aside className="self-start rounded-[24px] border border-slate-200/70 bg-white/72 p-3 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="rounded-[20px] border border-slate-200/80 bg-white px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">{t("meta.smartWorkflows")}</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">ATS</h2>
            <p className="mt-1 text-sm text-slate-500">{t("dashboard.subtitle")}</p>
          </div>

          <nav className="mt-3 flex flex-col gap-1.5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `group rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-cyan-50 text-cyan-800 ring-1 ring-cyan-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

        </aside>

        <main className="space-y-6">{children}</main>
      </div>
      <NotificationTray />
    </div>
  );
};

export default Layout;
