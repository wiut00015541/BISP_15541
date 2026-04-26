// Jobs screen for the frontend app.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FilterBar from "../components/FilterBar";
import { useLanguage } from "../i18n.jsx";
import { fetchJobs } from "../services/jobsService";
import { fetchLookups } from "../services/lookupService";

// Render the jobs page and keep its local UI behavior together.
const JobsPage = ({ currentUser }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    department: "",
    location: "",
    sort: "created_at",
    order: "desc",
  });

  const canCreateJob =
    currentUser?.role === "admin" || (currentUser?.permissions || []).includes("jobs.write");

  useEffect(() => {
    // Load the filter lists once so the job filters stay typo-free.
    const loadLookups = async () => {
      const lookupData = await fetchLookups();
      setDepartments(lookupData.departments || []);
      setLocations(lookupData.locations || []);
    };

    loadLookups();
  }, []);

  useEffect(() => {
    // Load the data this screen needs before updating local state.
    const load = async () => {
      const response = await fetchJobs(filters);
      setJobs(response.data);
    };

    load();
  }, [filters]);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("jobs.title")}</h1>
          <p className="mt-2 text-slate-500">{t("jobs.subtitle")}</p>
        </div>
        {canCreateJob ? (
          <Link className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white" to="/jobs/new">
            {t("jobs.newButton")}
          </Link>
        ) : null}
      </div>

      <FilterBar>
        <select
          className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
          value={filters.department}
          onChange={(event) => setFilters((prev) => ({ ...prev, department: event.target.value }))}
        >
          <option value="">{t("jobs.department")}</option>
          {departments.map((department) => (
            <option key={department.id} value={department.name}>
              {department.name}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
          value={filters.location}
          onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
        >
          <option value="">{t("jobs.location")}</option>
          {locations.map((location) => (
            <option key={location.id} value={location.name}>
              {location.name}
            </option>
          ))}
        </select>
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
        <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full text-sm">
          <thead className="bg-slate-950 text-left text-white">
            <tr>
              <th className="px-5 py-4 font-medium">{t("jobs.titleColumn")}</th>
              <th className="px-5 py-4 font-medium">{t("jobs.departmentColumn")}</th>
              <th className="px-5 py-4 font-medium">{t("jobs.locationColumn")}</th>
              <th className="px-5 py-4 font-medium">{t("jobs.recruiterColumn")}</th>
              <th className="px-5 py-4 font-medium">{t("jobs.hiringManagerColumn")}</th>
              <th className="px-5 py-4 font-medium">{t("jobs.statusColumn")}</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-slate-500">
                  {t("jobs.empty")}
                </td>
              </tr>
            ) : null}

            {jobs.map((job) => (
              <tr
                key={job.id}
                className="cursor-pointer border-t border-slate-100 transition hover:bg-cyan-50/40"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <td className="px-5 py-4 font-medium text-slate-900">{job.title}</td>
                <td className="px-5 py-4 text-slate-600">{job.department?.name}</td>
                <td className="px-5 py-4 text-slate-600">{job.location?.name}</td>
                <td className="px-5 py-4 text-slate-600">
                  {job.recruiter ? `${job.recruiter.firstName} ${job.recruiter.lastName}` : "-"}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {job.hiringManager ? `${job.hiringManager.firstName} ${job.hiringManager.lastName}` : "-"}
                </td>
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
      </div>
    </section>
  );
};

export default JobsPage;
