// Dashboard screen for the frontend app.
import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import LiveBarChart from "../components/LiveBarChart";
import { useLanguage } from "../i18n.jsx";
import { fetchDashboardOverview } from "../services/dashboardService";

// Render the dashboard page and keep its local UI behavior together.
const DashboardPage = () => {
  const { t, getStageLabel } = useLanguage();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Load the data this screen needs before updating local state.
    const load = async () => {
      const data = await fetchDashboardOverview();
      if (!isMounted) {
        return;
      }
      setOverview(data);
      setLastUpdated(data?.live?.refreshedAt || new Date().toISOString());
      setLoading(false);
    };

    load();
    const intervalId = window.setInterval(load, 8000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  // Keep format job status focused and easier to understand from the code nearby.
  const formatJobStatus = (status) => {
    const normalized = String(status || "").toUpperCase();
    const statusMap = {
      DRAFT: t("dashboard.jobStatusDraft"),
      OPEN: t("dashboard.jobStatusOpen"),
      CLOSED: t("dashboard.jobStatusClosed"),
    };

    return statusMap[normalized] || status;
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-slate-950 p-7 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.34em] text-cyan-200">{t("meta.workspace")}</p>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t("dashboard.liveLabel")}</span>
            <span className="text-slate-400">
              {loading || !lastUpdated ? t("common.loading") : new Date(lastUpdated).toLocaleTimeString()}
            </span>
          </div>
        </div>
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
          value={overview?.metrics?.openPositions ?? overview?.totalJobs ?? "-"}
          caption={t("dashboard.openPositionsCaption")}
          accent="cyan"
        />
        <StatCard
          title={t("dashboard.totalCandidates")}
          value={overview?.metrics?.activePipelineCandidates ?? overview?.totalCandidates ?? "-"}
          caption={t("dashboard.activePipelineCaption")}
          accent="amber"
        />
        <StatCard
          title={t("dashboard.timeToHire")}
          value={
            overview?.metrics?.averageTimeToHireDays !== null &&
            overview?.metrics?.averageTimeToHireDays !== undefined
              ? `${overview.metrics.averageTimeToHireDays}d`
              : "-"
          }
          caption={t("dashboard.timeToHireCaption")}
          accent="emerald"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <LiveBarChart
          title={t("dashboard.candidatesByStage")}
          subtitle={t("dashboard.candidatesByStageSubtitle")}
          data={overview?.applicationsPerStage || []}
          formatLabel={getStageLabel}
          colorClass="from-cyan-500 to-sky-500"
        />

        <LiveBarChart
          title={t("dashboard.jobsByStatus")}
          subtitle={t("dashboard.jobsByStatusSubtitle")}
          data={overview?.jobsPerStatus || []}
          formatLabel={formatJobStatus}
          colorClass="from-emerald-500 to-teal-500"
        />
      </div>

      <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-slate-950">{t("dashboard.hiringFunnel")}</h2>
        <p className="mt-2 text-sm text-slate-500">{t("dashboard.hiringFunnelSubtitle")}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("dashboard.hiredCandidates")}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{overview?.metrics?.hiredCandidates ?? 0}</p>
          </div>
          <div className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("dashboard.pipelineVolume")}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{overview?.metrics?.activePipelineCandidates ?? 0}</p>
          </div>
          <div className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("dashboard.totalJobs")}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{overview?.totalJobs ?? 0}</p>
          </div>
          <div className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("dashboard.totalCandidates")}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{overview?.totalCandidates ?? 0}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
