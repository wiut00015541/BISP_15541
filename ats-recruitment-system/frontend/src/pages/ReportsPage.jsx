import { useEffect, useState } from "react";
import { fetchHiringFunnelReport } from "../services/reportsService";

const ReportsPage = () => {
  const [report, setReport] = useState([]);

  useEffect(() => {
    const load = async () => {
      const response = await fetchHiringFunnelReport();
      setReport(response.report || []);
    };
    load();
  }, []);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Reports</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Hiring Funnel Analytics</h2>
        <ul className="mt-4 space-y-2">
          {report.map((row) => (
            <li key={row.stage} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
              <span>{row.stage}</span>
              <span className="font-semibold">{row.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ReportsPage;
