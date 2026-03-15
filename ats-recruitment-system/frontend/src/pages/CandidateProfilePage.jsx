import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../i18n.jsx";
import { fetchCandidateById } from "../services/candidatesService";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

const CandidateProfilePage = () => {
  const { id } = useParams();
  const { t, getStageLabel } = useLanguage();
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchCandidateById(id);
      setCandidate(data);
    };

    load();
  }, [id]);

  const latestResume = useMemo(() => {
    if (!candidate?.resumes?.length) {
      return null;
    }

    return [...candidate.resumes].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0];
  }, [candidate]);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          {candidate ? `${candidate.firstName} ${candidate.lastName}` : t("candidates.profileTitle")}
        </h1>
        <p className="mt-2 text-slate-500">{t("candidates.profileSubtitle")}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="space-y-2 text-sm text-slate-600">
            <p>{candidate?.email}</p>
            <p>{candidate?.phone || "-"}</p>
            <p>{candidate?.source || "-"}</p>
            <p>{candidate?.yearsExperience || 0} years</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {(candidate?.skills || []).map((candidateSkill) => (
              <span
                key={candidateSkill.id}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {candidateSkill.skill?.name}
              </span>
            ))}
          </div>

          {latestResume ? (
            <a
              className="mt-5 inline-flex text-sm font-medium text-cyan-700 underline"
              href={`${apiBaseUrl}${latestResume.fileUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              {t("candidates.existingResume")}
            </a>
          ) : null}
        </div>

        <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-xl font-semibold text-slate-950">{t("pipeline.title")}</h2>
          <div className="mt-5 space-y-3">
            {(candidate?.applications || []).map((application) => (
              <Link
                key={application.id}
                className="block rounded-[22px] border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-cyan-50/60"
                to={`/jobs/${application.jobId}`}
              >
                <p className="font-semibold text-slate-900">{application.job.title}</p>
                <p className="mt-1 text-sm text-slate-500">{getStageLabel(application.currentStage?.name)}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CandidateProfilePage;
