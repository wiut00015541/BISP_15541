// CandidateCreate screen for the frontend app.
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../i18n.jsx";
import { useNotifications } from "../notifications.jsx";
import { createCandidate } from "../services/candidatesService";
import { fetchJobs } from "../services/jobsService";
import { fetchLookups } from "../services/lookupService";

const initialCandidateForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  source: "",
  yearsExperience: "",
  skillIds: [],
  jobId: "",
};

// Keep the input styling in one place so the form stays consistent.
const inputClass =
  "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white";

// Only open jobs can receive new candidates.
const isOpenJob = (job) => String(job?.status || "").toUpperCase() === "OPEN";

// Render the candidate create page and keep its local UI behavior together.
const CandidateCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const notifications = useNotifications();
  const [form, setForm] = useState(initialCandidateForm);
  const [resumeFile, setResumeFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [candidateSources, setCandidateSources] = useState([]);
  const [jobOptions, setJobOptions] = useState([]);
  const [error, setError] = useState("");
  const openJobOptions = jobOptions.filter((job) => isOpenJob(job));

  useEffect(() => {
    // Load the data this screen needs before updating local state.
    const load = async () => {
      const preselectedJobId = searchParams.get("jobId") || "";
      const [lookupData, jobsData] = await Promise.all([
        fetchLookups(),
        fetchJobs({ page: 1, limit: 200 }),
      ]);
      const allJobs = jobsData.data || [];
      const openJobs = allJobs.filter((job) => isOpenJob(job));
      const hasPreselectedOpenJob = openJobs.some((job) => job.id === preselectedJobId);
      setSkills(lookupData.skills || []);
      setCandidateSources(lookupData.candidateSources || []);
      setJobOptions(allJobs);
      setForm((prev) => ({
        ...prev,
        // Keep the job preselected when we arrive here from a job page.
        jobId:
          prev.jobId ||
          (hasPreselectedOpenJob ? preselectedJobId : "") ||
          openJobs[0]?.id ||
          "",
        source:
          prev.source ||
          lookupData.candidateSources?.[0]?.code ||
          lookupData.candidateSources?.[0]?.name ||
          "",
      }));
    };

    load();
  }, [searchParams]);

  // Validate the current input before continuing to the next step.
  const validate = () => {
    const emailIsValid = /\S+@\S+\.\S+/.test(form.email);
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.jobId) {
      const message = t("common.required");
      setError(message);
      return message;
    }
    if (!emailIsValid) {
      const message = t("common.invalidEmail");
      setError(message);
      return message;
    }
    setError("");
    return "";
  };

  // Submit the current form state and handle the success or error path.
  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationMessage = validate();
    if (validationMessage) {
      notifications.error(validationMessage);
      return;
    }
    const payload = new FormData();
    payload.append("firstName", form.firstName);
    payload.append("lastName", form.lastName);
    payload.append("email", form.email);
    payload.append("phone", form.phone);
    payload.append("source", form.source);
    payload.append("yearsExperience", form.yearsExperience);
    payload.append("jobId", form.jobId);
    payload.append("skillIds", JSON.stringify(form.skillIds));

    if (resumeFile) {
      payload.append("resume", resumeFile);
    }

    try {
      const candidate = await createCandidate(payload);
      notifications.success(t("common.successCandidateCreated"));
      navigate(`/candidates/${candidate.id}`);
    } catch (requestError) {
      const backendDetails = requestError?.response?.data?.details || {};
      const backendMessage = requestError?.response?.data?.message || t("common.genericError");
      const firstFieldError = Object.values(backendDetails).find(Boolean);
      const nextError = firstFieldError || backendMessage;
      setError(nextError);
      notifications.error(nextError);
    }
  };

  return (
    <section className="space-y-5">
      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("candidates.newButton")}</h1>
        <p className="mt-2 text-slate-500">{t("candidates.createTitle")}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid items-start gap-4 rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:grid-cols-2 xl:grid-cols-4"
      >
        {/* Basic candidate details */}
        <input
          className={`${inputClass} ${
            error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-cyan-400"
          }`}
          placeholder={t("candidates.firstName")}
          value={form.firstName}
          onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
        />
        <input
          className={inputClass}
          placeholder={t("candidates.lastName")}
          value={form.lastName}
          onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
        />
        <input
          className={inputClass}
          placeholder={t("candidates.email")}
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />
        <input
          className={inputClass}
          placeholder={t("candidates.phone")}
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
        />
        <select
          className={inputClass}
          value={form.source}
          onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value }))}
        >
          <option value="">{t("candidates.source")}</option>
          {candidateSources.map((sourceOption) => (
            <option key={sourceOption.id} value={sourceOption.code || sourceOption.name}>
              {sourceOption.name}
            </option>
          ))}
        </select>
        <input
          className={inputClass}
          placeholder={t("candidates.yearsExperience")}
          type="number"
          step="0.1"
          value={form.yearsExperience}
          onChange={(event) => setForm((prev) => ({ ...prev, yearsExperience: event.target.value }))}
        />
        <select
          className={`${inputClass} xl:col-span-2`}
          value={form.jobId}
          onChange={(event) => setForm((prev) => ({ ...prev, jobId: event.target.value }))}
        >
          <option value="">{t("jobs.title")}</option>
          {jobOptions.map((job) => (
            <option key={job.id} value={job.id} disabled={!isOpenJob(job)}>
              {job.title} {!isOpenJob(job) ? `(${job.status})` : ""}
            </option>
          ))}
        </select>
        {openJobOptions.length === 0 ? (
          <p className="text-sm text-slate-500 xl:col-span-2">{t("candidates.noJobsAvailable")}</p>
        ) : null}
        {/* Multi-select skills so recruiters can tag the candidate up front. */}
        <select
          multiple
          className={`min-h-32 ${inputClass} xl:col-span-4`}
          value={form.skillIds}
          onChange={(event) => {
            const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
            setForm((prev) => ({ ...prev, skillIds: selected }));
          }}
        >
          {skills.map((skill) => (
            <option key={skill.id} value={skill.id}>
              {skill.name}
            </option>
          ))}
        </select>
        <label className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 xl:col-span-4">
          <span className="mb-2 block font-medium text-slate-700">{t("candidates.uploadResume")}</span>
          <input
            className="block w-full text-sm"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
          />
        </label>
        {/* Inline error plus the main submit action. */}
        <div className="xl:col-span-4">
          {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
          <button
            className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
            type="submit"
            disabled={openJobOptions.length === 0}
          >
            {t("common.create")}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CandidateCreatePage;
