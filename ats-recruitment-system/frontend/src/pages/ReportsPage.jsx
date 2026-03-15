import { useEffect, useState } from "react";
import { useLanguage } from "../i18n";
import { fetchHiringFunnelReport } from "../services/reportsService";

const ReportsPage = () => {
  const { t, getStageLabel } = useLanguage();
  const [report, setReport] = useState([]);

  useEffect(() => {
    const load = async () => {
      const response = await fetchHiringFunnelReport();
      setReport(response.report || []);
    };

    load();
  }, []);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("reports.title")}</h1>
        <p className="mt-2 text-slate-500">{t("reports.subtitle")}</p>
      </div>

      <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-slate-950">{t("reports.funnel")}</h2>
        <p className="mt-2 text-sm text-slate-500">{t("reports.funnelSubtitle")}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {report.map((row) => (
            <div key={row.stage} className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{getStageLabel(row.stage)}</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{row.count}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReportsPage;
