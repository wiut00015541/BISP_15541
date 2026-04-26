// Settings screen for the frontend app.
import { Link, NavLink } from "react-router-dom";
import { useLanguage } from "../i18n.jsx";

// Render the settings page and keep its local UI behavior together.
const SettingsPage = ({ currentUser }) => {
  const { t } = useLanguage();
  const canManageUsers =
    currentUser?.role === "admin" || (currentUser?.permissions || []).includes("users.write") || (currentUser?.permissions || []).includes("users.read");
  const canManageOptions =
    currentUser?.role === "admin" || (currentUser?.permissions || []).includes("settings.write");

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("settings.title")}</h1>
        <p className="mt-2 text-slate-500">{t("settings.subtitle")}</p>
      </div>

      {(canManageUsers || canManageOptions) ? (
        <div className="rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-wrap gap-3">
            <NavLink
              to="/settings/profile"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"
                }`
              }
            >
              {t("nav.profile")}
            </NavLink>
            {canManageUsers ? (
              <NavLink
                to="/settings/users"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"
                  }`
                }
              >
                {t("nav.users")}
              </NavLink>
            ) : null}
            {canManageOptions ? (
              <NavLink
                to="/settings/options"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"
                  }`
                }
              >
                {t("nav.options")}
              </NavLink>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="grid gap-4">
          <Link
            to="/settings/profile"
            className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{t("nav.profile")}</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-950">{t("settings.profileTitle")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("settings.profileSubtitle")}</p>
          </Link>

          {canManageUsers ? (
            <Link
              to="/settings/users"
              className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{t("nav.users")}</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">{t("settings.usersTitle")}</h2>
              <p className="mt-2 text-sm text-slate-500">{t("settings.usersSubtitle")}</p>
            </Link>
          ) : null}

          {canManageOptions ? (
            <Link
              to="/settings/options"
              className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{t("nav.options")}</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">{t("settings.optionsTitle")}</h2>
              <p className="mt-2 text-sm text-slate-500">{t("settings.optionsSubtitle")}</p>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default SettingsPage;
