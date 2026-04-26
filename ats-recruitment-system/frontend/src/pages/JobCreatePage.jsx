// JobCreate screen for the frontend app.
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../i18n.jsx";
import { useNotifications } from "../notifications.jsx";
import { fetchLookups } from "../services/lookupService";
import { createJob, fetchJobById, updateJob } from "../services/jobsService";

const initialJobForm = {
  title: "",
  description: "",
  type: "",
  status: "",
  departmentId: "",
  locationId: "",
  recruiterId: "",
  hiringManagerId: "",
  minSalary: "",
  maxSalary: "",
  openings: "1",
};

// Keep input class focused and easier to understand from the code nearby.
const inputClass = (error) =>
  `rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white ${
    error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-cyan-400"
  }`;

// Render the job create page and keep its local UI behavior together.
const JobCreatePage = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const notifications = useNotifications();
  const [form, setForm] = useState(initialJobForm);
  const [lookups, setLookups] = useState({
    departments: [],
    locations: [],
    recruiters: [],
    hiringManagers: [],
    jobTypes: [],
    jobStatuses: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(Boolean(id));
  const canCreateJob =
    currentUser?.role === "admin" || (currentUser?.permissions || []).includes("jobs.write");
  const isEditMode = Boolean(id);

  useEffect(() => {
    // Keep load lookups focused and easier to understand from the code nearby.
    const loadLookups = async () => {
      const [data, jobData] = await Promise.all([
        fetchLookups(),
        id ? fetchJobById(id) : Promise.resolve(null),
      ]);

      setLookups({
        departments: data.departments || [],
        locations: data.locations || [],
        recruiters: data.recruiters || [],
        hiringManagers: data.hiringManagers || [],
        jobTypes: data.jobTypes || [],
        jobStatuses: data.jobStatuses || [],
      });

      if (jobData) {
        setForm({
          title: jobData.title || "",
          description: jobData.description || "",
          type: jobData.type || data.jobTypes?.[0]?.code || data.jobTypes?.[0]?.name || "",
          status:
            jobData.status ||
            data.jobStatuses?.find((item) => item.code === "OPEN")?.code ||
            data.jobStatuses?.[0]?.code ||
            data.jobStatuses?.[0]?.name ||
            "",
          departmentId: jobData.departmentId || "",
          locationId: jobData.locationId || "",
          recruiterId: jobData.recruiterId || "",
          hiringManagerId: jobData.hiringManagerId || "",
          minSalary: jobData.minSalary ?? "",
          maxSalary: jobData.maxSalary ?? "",
          openings: String(jobData.openings ?? 1),
        });
      } else {
        setForm((prev) => ({
          ...prev,
          type: prev.type || data.jobTypes?.[0]?.code || data.jobTypes?.[0]?.name || "",
          status:
            prev.status ||
            data.jobStatuses?.find((item) => item.code === "OPEN")?.code ||
            data.jobStatuses?.[0]?.code ||
            data.jobStatuses?.[0]?.name ||
            "",
        }));
      }
      setLoading(false);
    };

    loadLookups();
  }, [id]);

  // Validate the current input before continuing to the next step.
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

    if (!form.type) {
      nextErrors.type = t("jobs.validationType");
    }

    if (!form.status) {
      nextErrors.status = t("jobs.validationStatus");
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

  // Submit the current form state and handle the success or error path.
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      notifications.error(t("common.validationFix"));
      return;
    }

    try {
      const payload = {
        ...form,
        minSalary: form.minSalary ? Number(form.minSalary) : null,
        maxSalary: form.maxSalary ? Number(form.maxSalary) : null,
        openings: form.openings ? Number(form.openings) : 1,
      };
      const job = isEditMode ? await updateJob(id, payload) : await createJob(payload);
      notifications.success(isEditMode ? t("common.successJobUpdated") : t("common.successJobCreated"));
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

  if (loading) {
    return <section className="rounded-[30px] border border-white/80 bg-white/90 p-6 text-slate-500 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">{t("common.loading")}</section>;
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          {isEditMode ? t("jobs.editButton") : t("jobs.newButton")}
        </h1>
        <p className="mt-2 text-slate-500">{t("jobs.createTitle")}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid items-start gap-4 rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:grid-cols-2 xl:grid-cols-4"
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
            <option value="">{t("jobs.formType")}</option>
            {lookups.jobTypes.map((typeOption) => (
              <option key={typeOption.id} value={typeOption.code || typeOption.name}>
                {typeOption.name}
              </option>
            ))}
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
            <option value="">{t("jobs.formStatus")}</option>
            {lookups.jobStatuses.map((statusOption) => (
              <option key={statusOption.id} value={statusOption.code || statusOption.name}>
                {statusOption.name}
              </option>
            ))}
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
          <button className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white sm:w-auto" type="submit">
            {isEditMode ? t("common.save") : t("common.create")}
          </button>
        </div>
      </form>
    </section>
  );
};

export default JobCreatePage;
