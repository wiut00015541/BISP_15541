import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n.jsx";
import { fetchLookups } from "../services/lookupService";
import { createJob } from "../services/jobsService";

const initialJobForm = {
  title: "",
  description: "",
  type: "FULL_TIME",
  status: "OPEN",
  departmentId: "",
  locationId: "",
  minSalary: "",
  maxSalary: "",
  openings: "1",
};

const JobCreatePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState(initialJobForm);
  const [lookups, setLookups] = useState({ departments: [], locations: [] });

  useEffect(() => {
    const loadLookups = async () => {
      const data = await fetchLookups();
      setLookups({
        departments: data.departments || [],
        locations: data.locations || [],
      });
    };

    loadLookups();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const job = await createJob({
      ...form,
      minSalary: form.minSalary ? Number(form.minSalary) : null,
      maxSalary: form.maxSalary ? Number(form.maxSalary) : null,
      openings: form.openings ? Number(form.openings) : 1,
    });
    navigate(`/jobs/${job.id}`);
  };

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("jobs.newButton")}</h1>
        <p className="mt-2 text-slate-500">{t("jobs.createTitle")}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-3 rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:grid-cols-2 xl:grid-cols-4"
      >
        <input
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white"
          placeholder={t("jobs.formTitle")}
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
        />
        <select
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white"
          value={form.departmentId}
          onChange={(event) => setForm((prev) => ({ ...prev, departmentId: event.target.value }))}
        >
          <option value="">{t("jobs.formDepartment")}</option>
          {lookups.departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white"
          value={form.locationId}
          onChange={(event) => setForm((prev) => ({ ...prev, locationId: event.target.value }))}
        >
          <option value="">{t("jobs.formLocation")}</option>
          {lookups.locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white"
          value={form.type}
          onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
        >
          <option value="FULL_TIME">FULL_TIME</option>
          <option value="PART_TIME">PART_TIME</option>
          <option value="CONTRACT">CONTRACT</option>
          <option value="INTERNSHIP">INTERNSHIP</option>
        </select>
        <textarea
          className="min-h-32 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white xl:col-span-4"
          placeholder={t("jobs.formDescription")}
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
        />
        <select
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white"
          value={form.status}
          onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
        >
          <option value="DRAFT">DRAFT</option>
          <option value="OPEN">OPEN</option>
          <option value="CLOSED">CLOSED</option>
          <option value="ON_HOLD">ON_HOLD</option>
        </select>
        <input
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white"
          placeholder={t("jobs.formMinSalary")}
          type="number"
          value={form.minSalary}
          onChange={(event) => setForm((prev) => ({ ...prev, minSalary: event.target.value }))}
        />
        <input
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white"
          placeholder={t("jobs.formMaxSalary")}
          type="number"
          value={form.maxSalary}
          onChange={(event) => setForm((prev) => ({ ...prev, maxSalary: event.target.value }))}
        />
        <input
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white"
          placeholder={t("jobs.formOpenings")}
          type="number"
          value={form.openings}
          onChange={(event) => setForm((prev) => ({ ...prev, openings: event.target.value }))}
        />
        <div className="xl:col-span-4">
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white" type="submit">
            {t("common.create")}
          </button>
        </div>
      </form>
    </section>
  );
};

export default JobCreatePage;
