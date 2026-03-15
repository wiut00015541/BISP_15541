import { useLanguage } from "../i18n.jsx";

const SettingsPage = () => {
  const { t } = useLanguage();

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("settings.title")}</h1>
        <p className="mt-2 text-slate-500">{t("settings.subtitle")}</p>
      </div>

      <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 text-sm shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <p className="text-slate-700">{t("settings.intro")}</p>
        <ul className="mt-4 space-y-3 text-slate-600">
          <li className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">{t("settings.jwt")}</li>
          <li className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">{t("settings.database")}</li>
          <li className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">{t("settings.openai")}</li>
          <li className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">{t("settings.cors")}</li>
          <li className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">{t("settings.localization")}</li>
        </ul>
      </div>
    </section>
  );
};

export default SettingsPage;
