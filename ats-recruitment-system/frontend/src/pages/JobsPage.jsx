import { useEffect, useState } from "react";
import FilterBar from "../components/FilterBar";
import { fetchJobs } from "../services/jobsService";

const JobsPage = () => {
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
    <section>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Jobs</h1>
      <FilterBar>
        <input
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Department"
          value={filters.department}
          onChange={(event) => setFilters((prev) => ({ ...prev, department: event.target.value }))}
        />
        <input
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Location"
          value={filters.location}
          onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
        />
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={filters.order}
          onChange={(event) => setFilters((prev) => ({ ...prev, order: event.target.value }))}
        >
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </select>
      </FilterBar>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Department</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-slate-200">
                <td className="px-3 py-2">{job.title}</td>
                <td className="px-3 py-2">{job.department?.name}</td>
                <td className="px-3 py-2">{job.location?.name}</td>
                <td className="px-3 py-2">{job.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default JobsPage;
