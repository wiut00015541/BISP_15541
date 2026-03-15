import { Link, NavLink } from "react-router-dom";
import { useLanguage } from "../i18n";

const Layout = ({ children, onLogout, user }) => {
  const { language, setLanguage, t } = useLanguage();

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

          <div className="flex flex-wrap items-center gap-3">
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

            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t("meta.teamPulse")}</p>
              <p className="text-sm font-semibold text-slate-900">
                {user?.firstName} {user?.lastName}
              </p>
            </div>

            <button
              type="button"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5"
              onClick={onLogout}
            >
              {t("common.logout")}
            </button>
          </div>
        </div>
      </header>

      <div className="page-shell grid gap-6 pb-10 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-[28px] border border-white/80 bg-white/80 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="rounded-[24px] bg-slate-950 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-200">{t("meta.smartWorkflows")}</p>
            <h2 className="mt-3 text-2xl font-semibold">ATS</h2>
            <p className="mt-2 text-sm text-slate-300">{t("dashboard.subtitle")}</p>
          </div>

          <nav className="mt-4 flex flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `group rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-cyan-50 text-cyan-800 shadow-sm ring-1 ring-cyan-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-5 rounded-[24px] border border-slate-200 bg-gradient-to-br from-cyan-50 to-white p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-700">{t("meta.systemHealth")}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">99.9%</p>
            <p className="mt-1 text-sm text-slate-600">{t("common.livePipeline")}</p>
          </div>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
