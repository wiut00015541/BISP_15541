import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../i18n.jsx";
import { useNotifications } from "../notifications.jsx";
import { fetchJobById, updateJob } from "../services/jobsService";

const stages = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"];

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const JobDetailsPage = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const notifications = useNotifications();
  const [job, setJob] = useState(null);
  const [statusBusy, setStatusBusy] = useState(false);

  const canManageJob =
    currentUser?.role === "admin" || (currentUser?.permissions || []).includes("jobs.write");

  useEffect(() => {
    const load = async () => {
      const jobData = await fetchJobById(id);
      setJob(jobData);
    };

    load();
  }, [id]);

  const stageCounts = useMemo(() => {
    const applications = job?.applications || [];
    return stages.reduce((accumulator, stageName) => {
      accumulator[stageName] = applications.filter((item) => item.currentStage?.name === stageName).length;
      return accumulator;
    }, {});
  }, [job]);

  const totalCandidates = job?.applications?.length || 0;
  const createdAtLabel = job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : "-";
  const salaryRange = (() => {
    const min = formatCurrency(job?.minSalary);
    const max = formatCurrency(job?.maxSalary);

    if (min && max) {
      return `${min} - ${max}`;
    }
    if (min) {
      return `${min}+`;
    }
    if (max) {
      return `Up to ${max}`;
    }
    return t("jobs.notSpecified");
  })();

  const handleToggleStatus = async () => {
    if (!job) {
      return;
    }

    const nextStatus = job.status === "OPEN" ? "CLOSED" : "OPEN";
    setStatusBusy(true);

    try {
      const updatedJob = await updateJob(job.id, {
        title: job.title,
        description: job.description,
        type: job.type,
        status: nextStatus,
        departmentId: job.departmentId,
        locationId: job.locationId,
        recruiterId: job.recruiterId,
        hiringManagerId: job.hiringManagerId,
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
        openings: job.openings,
      });
      setJob(updatedJob);
      notifications.success(t("common.successJobUpdated"));
    } catch (_error) {
      notifications.error(t("common.genericError"));
    } finally {
      setStatusBusy(false);
    }
  };

  if (!job) {
    return (
      <section className="rounded-[30px] border border-white/80 bg-white/90 p-6 text-slate-500 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        {t("common.loading")}
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{job.title}</h1>
          <p className="mt-2 text-slate-500">{t("jobs.detailsSubtitle")}</p>
        </div>
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <Link
            to={`/jobs/${id}/pipeline`}
            className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-medium text-slate-700 sm:w-auto"
          >
            {t("jobs.viewPipelineButton")}
          </Link>
          {canManageJob ? (
            <>
              <Link
                to={`/jobs/${id}/edit`}
                className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-medium text-slate-700 sm:w-auto"
              >
                {t("jobs.editButton")}
              </Link>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusBusy}
                className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-medium text-slate-700 disabled:opacity-60 sm:w-auto"
              >
                {job.status === "OPEN" ? t("jobs.closeButton") : t("jobs.openButton")}
              </button>
            </>
          ) : null}
          <Link
            to={`/candidates/new?jobId=${id}`}
            className="w-full rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-medium text-white sm:w-auto"
          >
            {t("jobs.addCandidateButton")}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{t("jobs.detailsTitle")}</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{job.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                {job.description || t("jobs.notSpecified")}
              </p>
            </div>
            <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{t("jobs.statusColumn")}</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">{job.status || "-"}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("jobs.formDepartment")}</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{job.department?.name || t("jobs.notSpecified")}</p>
            </div>
            <div className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("jobs.formLocation")}</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{job.location?.name || t("jobs.notSpecified")}</p>
            </div>
            <div className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("jobs.formType")}</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{job.type || t("jobs.notSpecified")}</p>
            </div>
            <div className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("jobs.salaryLabel")}</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{salaryRange}</p>
            </div>
            <div className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("jobs.openingsLabel")}</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{job.openings || 0}</p>
            </div>
            <div className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("jobs.createdLabel")}</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{createdAtLabel}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{t("jobs.recruiterColumn")}</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">
              {job.recruiter ? `${job.recruiter.firstName} ${job.recruiter.lastName}` : t("jobs.notSpecified")}
            </p>
            <p className="mt-2 text-sm text-slate-500">{job.recruiter?.email || t("jobs.notSpecified")}</p>
          </div>
          <div className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{t("jobs.hiringManagerColumn")}</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">
              {job.hiringManager ? `${job.hiringManager.firstName} ${job.hiringManager.lastName}` : t("jobs.notSpecified")}
            </p>
            <p className="mt-2 text-sm text-slate-500">{job.hiringManager?.email || t("jobs.notSpecified")}</p>
          </div>
          <div className="rounded-[30px] border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:col-span-2 xl:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">{t("jobs.totalCandidates")}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{totalCandidates}</p>
            <p className="mt-2 text-sm text-slate-500">{t("jobs.pipelineTitle")}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {stages.map((stageName) => (
          <button
            key={stageName}
            type="button"
            onClick={() => navigate(`/jobs/${id}/pipeline`)}
            className="rounded-[24px] border border-white/80 bg-white/90 p-4 text-left shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:bg-cyan-50/70"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              {t(`stages.${stageName}`)}
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">{stageCounts[stageName] || 0}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default JobDetailsPage;
