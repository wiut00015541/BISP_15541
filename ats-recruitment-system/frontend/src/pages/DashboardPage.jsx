import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { useLanguage } from "../i18n.jsx";
import { fetchDashboardOverview } from "../services/dashboardService";

const DashboardPage = () => {
  const { t, getStageLabel } = useLanguage();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchDashboardOverview();
      setOverview(data);
    };

    load();
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-slate-950 p-7 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
        <p className="text-xs uppercase tracking-[0.34em] text-cyan-200">{t("meta.workspace")}</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">{t("dashboard.title")}</h1>
            <p className="mt-3 max-w-2xl text-slate-300">{t("dashboard.subtitle")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">{t("common.activeRoles")}</p>
              <p className="mt-2 text-2xl font-semibold">{overview?.totalJobs ?? "-"}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">{t("common.acrossTeam")}</p>
              <p className="mt-2 text-2xl font-semibold">{overview?.totalCandidates ?? "-"}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">{t("common.thisWeek")}</p>
              <p className="mt-2 text-2xl font-semibold">
                {overview?.applicationsPerStage?.reduce((sum, item) => sum + item.count, 0) ?? "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard
          title={t("dashboard.totalJobs")}
          value={overview?.totalJobs ?? "-"}
          caption={t("common.activeRoles")}
          accent="cyan"
        />
        <StatCard
          title={t("dashboard.totalCandidates")}
          value={overview?.totalCandidates ?? "-"}
          caption={t("common.acrossTeam")}
          accent="amber"
        />
        <StatCard
          title={t("dashboard.hiringFunnel")}
          value={overview?.hiringFunnel?.length ?? "-"}
          caption={t("common.livePipeline")}
          accent="emerald"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-slate-950">{t("dashboard.applicationsPerStage")}</h2>
          <div className="mt-5 space-y-3">
            {(overview?.applicationsPerStage || []).map((item) => (
              <div key={item.stage} className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-700">{getStageLabel(item.stage)}</span>
                  <span className="text-lg font-semibold text-slate-950">{item.count}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500"
                    style={{
                      width: `${Math.max(
                        8,
                        ((item.count || 0) /
                          Math.max(
                            1,
                            ...(overview?.applicationsPerStage || []).map((entry) => entry.count || 0)
                          )) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-slate-950">{t("dashboard.hiringFunnel")}</h2>
          <p className="mt-2 text-sm text-slate-500">{t("dashboard.hiringFunnelSubtitle")}</p>
          <ul className="mt-5 space-y-3">
            {(overview?.hiringFunnel || []).map((item) => (
              <li key={item.stage} className="flex items-center justify-between rounded-[22px] border border-slate-100 px-4 py-3">
                <span className="font-medium text-slate-700">{getStageLabel(item.stage)}</span>
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
                  {item.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
