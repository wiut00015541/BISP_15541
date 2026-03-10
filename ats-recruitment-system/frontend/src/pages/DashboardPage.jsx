import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { fetchDashboardOverview } from "../services/dashboardService";

const DashboardPage = () => {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchDashboardOverview();
      setOverview(data);
    };
    load();
  }, []);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Total Jobs" value={overview?.totalJobs ?? "-"} />
        <StatCard title="Total Candidates" value={overview?.totalCandidates ?? "-"} />
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Applications Per Stage</h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {(overview?.applicationsPerStage || []).map((item) => (
            <li key={item.stage} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2">
              <span>{item.stage}</span>
              <span className="font-semibold">{item.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default DashboardPage;
