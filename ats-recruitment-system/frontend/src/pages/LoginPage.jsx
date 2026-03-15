import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n.jsx";
import { login as loginRequest } from "../services/authService";

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const authPayload = await loginRequest(form);
      onLogin(authPayload);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || t("login.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.12),_transparent_34%),linear-gradient(180deg,_#f7fbff_0%,_#eef4ff_100%)] px-4 py-10">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-[-10%] top-10 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-[-6%] h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[36px] bg-slate-950 p-8 text-white shadow-[0_30px_120px_rgba(15,23,42,0.35)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-cyan-200">{t("meta.workspace")}</p>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight">{t("login.title")}</h1>
              <p className="mt-4 max-w-xl text-base text-slate-300">{t("login.subtitle")}</p>
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm ${language === "en" ? "bg-white text-slate-950" : "text-slate-300"}`}
                onClick={() => setLanguage("en")}
              >
                EN
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm ${language === "ru" ? "bg-white text-slate-950" : "text-slate-300"}`}
                onClick={() => setLanguage("ru")}
              >
                RU
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-white">{t("login.featureOne")}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-white">{t("login.featureTwo")}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-white">{t("login.featureThree")}</p>
            </div>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-[36px] border border-white/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur-xl"
        >
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-700">{t("common.language")}</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">{t("login.panelTitle")}</h2>
          <p className="mt-3 text-sm text-slate-500">{t("login.panelSubtitle")}</p>

          <div className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("login.email")}</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                type="email"
                placeholder={t("login.email")}
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("login.password")}</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                type="password"
                placeholder={t("login.password")}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </label>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 disabled:opacity-70"
            >
              {loading ? t("login.signingIn") : t("login.signIn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
