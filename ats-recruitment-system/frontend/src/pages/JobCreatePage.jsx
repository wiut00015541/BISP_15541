import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n.jsx";
import { useNotifications } from "../notifications.jsx";
import { fetchLookups } from "../services/lookupService";
import { createJob } from "../services/jobsService";

const initialJobForm = {
  title: "",
  description: "",
  type: "FULL_TIME",
  status: "OPEN",
  departmentId: "",
  locationId: "",
  recruiterId: "",
  hiringManagerId: "",
  minSalary: "",
  maxSalary: "",
  openings: "1",
};

const inputClass = (error) =>
  `rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white ${
    error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-cyan-400"
  }`;

const JobCreatePage = ({ currentUser }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const notifications = useNotifications();
  const [form, setForm] = useState(initialJobForm);
  const [lookups, setLookups] = useState({
    departments: [],
    locations: [],
    recruiters: [],
    hiringManagers: [],
  });
  const [errors, setErrors] = useState({});
  const canCreateJob =
    currentUser?.role === "admin" || (currentUser?.permissions || []).includes("jobs.write");

  useEffect(() => {
    const loadLookups = async () => {
      const data = await fetchLookups();
      setLookups({
        departments: data.departments || [],
        locations: data.locations || [],
        recruiters: data.recruiters || [],
        hiringManagers: data.hiringManagers || [],
      });
    };

    loadLookups();
  }, []);

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = t("jobs.validationTitle");
    }

    if (!form.description.trim()) {
      nextErrors.description = t("jobs.validationDescriptionRequired");
    } else if (form.description.trim().length < 30) {
      nextErrors.description = t("jobs.validationDescriptionLength");
    }

    if (!form.departmentId) {
      nextErrors.departmentId = t("jobs.validationDepartment");
    }

    if (!form.locationId) {
      nextErrors.locationId = t("jobs.validationLocation");
    }

    if (!form.recruiterId) {
      nextErrors.recruiterId = t("jobs.validationRecruiter");
    }

    if (!form.hiringManagerId) {
      nextErrors.hiringManagerId = t("jobs.validationHiringManager");
    }

    if (!form.openings || Number(form.openings) < 1) {
      nextErrors.openings = t("jobs.validationOpenings");
    }

    if (form.minSalary && Number.isNaN(Number(form.minSalary))) {
      nextErrors.minSalary = t("jobs.validationMinSalary");
    }

    if (form.maxSalary && Number.isNaN(Number(form.maxSalary))) {
      nextErrors.maxSalary = t("jobs.validationMaxSalary");
    }

    if (form.minSalary && form.maxSalary && Number(form.minSalary) > Number(form.maxSalary)) {
      nextErrors.maxSalary = t("jobs.validationSalaryRange");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      notifications.error(t("common.validationFix"));
      return;
    }

    try {
      const job = await createJob({
        ...form,
        minSalary: form.minSalary ? Number(form.minSalary) : null,
        maxSalary: form.maxSalary ? Number(form.maxSalary) : null,
        openings: form.openings ? Number(form.openings) : 1,
      });
      notifications.success(t("common.successJobCreated"));
      navigate(`/jobs/${job.id}`);
    } catch (error) {
      const apiErrors = error?.response?.data?.details || {};
      setErrors(apiErrors);
      notifications.error(t("common.genericError"));
    }
  };

  if (!canCreateJob) {
    return <Navigate to="/jobs" replace />;
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("jobs.newButton")}</h1>
        <p className="mt-2 text-slate-500">{t("jobs.createTitle")}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:grid-cols-2 xl:grid-cols-4"
      >
        <div className="space-y-2">
          <input
            className={inputClass(errors.title)}
            placeholder={t("jobs.formTitle")}
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          {errors.title ? <p className="text-sm text-rose-600">{errors.title}</p> : null}
        </div>

        <div className="space-y-2">
          <select
            className={inputClass(errors.departmentId)}
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
          {errors.departmentId ? <p className="text-sm text-rose-600">{errors.departmentId}</p> : null}
        </div>

        <div className="space-y-2">
          <select
            className={inputClass(errors.locationId)}
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
          {errors.locationId ? <p className="text-sm text-rose-600">{errors.locationId}</p> : null}
        </div>

        <div className="space-y-2">
          <select
            className={inputClass(errors.type)}
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
          >
            <option value="FULL_TIME">Full time</option>
            <option value="PART_TIME">Part time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
          {errors.type ? <p className="text-sm text-rose-600">{errors.type}</p> : null}
        </div>

        <div className="space-y-2 xl:col-span-4">
          <textarea
            className={`${inputClass(errors.description)} min-h-32 w-full`}
            placeholder={t("jobs.formDescription")}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          {errors.description ? <p className="text-sm text-rose-600">{errors.description}</p> : null}
        </div>

        <div className="space-y-2">
          <select
            className={inputClass(errors.recruiterId)}
            value={form.recruiterId}
            onChange={(event) => setForm((prev) => ({ ...prev, recruiterId: event.target.value }))}
          >
            <option value="">{t("jobs.formRecruiter")}</option>
            {lookups.recruiters.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
          {errors.recruiterId ? <p className="text-sm text-rose-600">{errors.recruiterId}</p> : null}
        </div>

        <div className="space-y-2">
          <select
            className={inputClass(errors.hiringManagerId)}
            value={form.hiringManagerId}
            onChange={(event) => setForm((prev) => ({ ...prev, hiringManagerId: event.target.value }))}
          >
            <option value="">{t("jobs.formHiringManager")}</option>
            {lookups.hiringManagers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
          {errors.hiringManagerId ? <p className="text-sm text-rose-600">{errors.hiringManagerId}</p> : null}
        </div>

        <div className="space-y-2">
          <select
            className={inputClass(errors.status)}
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="DRAFT">Draft</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="ON_HOLD">On hold</option>
          </select>
          {errors.status ? <p className="text-sm text-rose-600">{errors.status}</p> : null}
        </div>

        <div className="space-y-2">
          <input
            className={inputClass(errors.minSalary)}
            placeholder={t("jobs.formMinSalary")}
            type="number"
            value={form.minSalary}
            onChange={(event) => setForm((prev) => ({ ...prev, minSalary: event.target.value }))}
          />
          {errors.minSalary ? <p className="text-sm text-rose-600">{errors.minSalary}</p> : null}
        </div>

        <div className="space-y-2">
          <input
            className={inputClass(errors.maxSalary)}
            placeholder={t("jobs.formMaxSalary")}
            type="number"
            value={form.maxSalary}
            onChange={(event) => setForm((prev) => ({ ...prev, maxSalary: event.target.value }))}
          />
          {errors.maxSalary ? <p className="text-sm text-rose-600">{errors.maxSalary}</p> : null}
        </div>

        <div className="space-y-2">
          <input
            className={inputClass(errors.openings)}
            placeholder={t("jobs.formOpenings")}
            type="number"
            min="1"
            value={form.openings}
            onChange={(event) => setForm((prev) => ({ ...prev, openings: event.target.value }))}
          />
          {errors.openings ? <p className="text-sm text-rose-600">{errors.openings}</p> : null}
        </div>

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
