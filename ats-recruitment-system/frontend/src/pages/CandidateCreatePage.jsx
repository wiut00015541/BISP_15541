import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const CandidateCreatePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const notifications = useNotifications();
  const [form, setForm] = useState(initialCandidateForm);
  const [resumeFile, setResumeFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [openJobs, setOpenJobs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const [lookupData, jobsData] = await Promise.all([
        fetchLookups(),
        fetchJobs({ status: "open", page: 1, limit: 100 }),
      ]);
      setSkills(lookupData.skills || []);
      setOpenJobs(jobsData.data || []);
    };

    load();
  }, []);

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
    } catch (_error) {
      notifications.error(t("common.genericError"));
    }
  };

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("candidates.newButton")}</h1>
        <p className="mt-2 text-slate-500">{t("candidates.createTitle")}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-3 rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:grid-cols-2 xl:grid-cols-4"
      >
        <input
          className={`rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white ${
            error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-cyan-400"
          }`}
          placeholder={t("candidates.firstName")}
          value={form.firstName}
          onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
        />
        <input
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white"
          placeholder={t("candidates.lastName")}
          value={form.lastName}
          onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
        />
        <input
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white"
          placeholder={t("candidates.email")}
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />
        <input
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white"
          placeholder={t("candidates.phone")}
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
        />
        <input
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white"
          placeholder={t("candidates.source")}
          value={form.source}
          onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value }))}
        />
        <input
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white"
          placeholder={t("candidates.yearsExperience")}
          type="number"
          step="0.1"
          value={form.yearsExperience}
          onChange={(event) => setForm((prev) => ({ ...prev, yearsExperience: event.target.value }))}
        />
        <select
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white xl:col-span-2"
          value={form.jobId}
          onChange={(event) => setForm((prev) => ({ ...prev, jobId: event.target.value }))}
        >
          <option value="">{t("jobs.title")}</option>
          {openJobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
        <select
          multiple
          className="min-h-32 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white xl:col-span-4"
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
        <label className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 xl:col-span-4">
          <span className="mb-2 block font-medium text-slate-700">{t("candidates.uploadResume")}</span>
          <input type="file" accept=".pdf,.doc,.docx" onChange={(event) => setResumeFile(event.target.files?.[0] || null)} />
        </label>
        <div className="xl:col-span-4">
          {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white" type="submit">
            {t("common.create")}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CandidateCreatePage;
