import { useEffect, useState } from "react";
import FilterBar from "../components/FilterBar";
import { useLanguage } from "../i18n";
import { fetchJobs } from "../services/jobsService";

const JobsPage = () => {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    department: "",
    location: "",
    sort: "created_at",
    order: "desc",
  });

  useEffect(() => {
    const load = async () => {
      const response = await fetchJobs(filters);
      setJobs(response.data);
    };

    load();
  }, [filters]);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("jobs.title")}</h1>
        <p className="mt-2 text-slate-500">{t("jobs.subtitle")}</p>
      </div>

      <FilterBar>
        <input
          className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
          placeholder={t("jobs.department")}
          value={filters.department}
          onChange={(event) => setFilters((prev) => ({ ...prev, department: event.target.value }))}
        />
        <input
          className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
          placeholder={t("jobs.location")}
          value={filters.location}
          onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
        />
        <select
          className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
          value={filters.order}
          onChange={(event) => setFilters((prev) => ({ ...prev, order: event.target.value }))}
        >
          <option value="desc">{t("common.newest")}</option>
          <option value="asc">{t("common.oldest")}</option>
        </select>
      </FilterBar>

      <div className="overflow-hidden rounded-[30px] border border-white/80 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-950 text-left text-white">
            <tr>
              <th className="px-5 py-4 font-medium">{t("jobs.titleColumn")}</th>
              <th className="px-5 py-4 font-medium">{t("jobs.departmentColumn")}</th>
              <th className="px-5 py-4 font-medium">{t("jobs.locationColumn")}</th>
              <th className="px-5 py-4 font-medium">{t("jobs.statusColumn")}</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-5 py-8 text-center text-slate-500">
                  {t("jobs.empty")}
                </td>
              </tr>
            ) : null}

            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-slate-100 transition hover:bg-cyan-50/40">
                <td className="px-5 py-4 font-medium text-slate-900">{job.title}</td>
                <td className="px-5 py-4 text-slate-600">{job.department?.name}</td>
                <td className="px-5 py-4 text-slate-600">{job.location?.name}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default JobsPage;
