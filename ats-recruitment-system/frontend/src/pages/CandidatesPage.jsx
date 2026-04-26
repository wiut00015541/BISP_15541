// Candidates screen for the frontend app.
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FilterBar from "../components/FilterBar";
import { usePagination } from "../hooks/usePagination";
import { useLanguage } from "../i18n.jsx";
import { fetchCandidates } from "../services/candidatesService";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

// Render the candidates page and keep its local UI behavior together.
const CandidatesPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { page, setPage, params } = usePagination(1, 20);
  const [result, setResult] = useState({ data: [], meta: {} });
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Load the data this screen needs before updating local state.
    const load = async () => {
      const response = await fetchCandidates({ ...params, search });
      setResult(response);
    };

    load();
  }, [params, search]);

  const latestResumeMap = useMemo(() => {
    return new Map(
      result.data.map((candidate) => {
        const resumes = [...(candidate.resumes || [])].sort(
          (left, right) => new Date(right.createdAt) - new Date(left.createdAt)
        );
        return [candidate.id, resumes[0] || null];
      })
    );
  }, [result.data]);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("candidates.title")}</h1>
          <p className="mt-2 text-slate-500">{t("candidates.subtitle")}</p>
        </div>
        <Link className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white" to="/candidates/new">
          {t("candidates.newButton")}
        </Link>
      </div>

      <FilterBar>
        <input
          className="h-11 min-w-[280px] rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
          placeholder={t("candidates.nameSearchPlaceholder")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </FilterBar>

      <div className="grid gap-4 lg:grid-cols-2">
        {result.data.length === 0 ? (
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 text-slate-500 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            {t("candidates.empty")}
          </div>
        ) : null}

        {result.data.map((candidate) => {
          const latestResume = latestResumeMap.get(candidate.id);

          return (
            <article
              key={candidate.id}
              className="cursor-pointer rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1"
              onClick={() => navigate(`/candidates/${candidate.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">
                    {candidate.firstName} {candidate.lastName}
                  </h3>
                  <p className="mt-1 text-slate-500">{candidate.email}</p>
                </div>
                <div className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  {candidate.applications?.length || 0} ATS
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(candidate.skills || []).slice(0, 5).map((candidateSkill) => (
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
                  className="mt-4 inline-flex text-sm font-medium text-cyan-700 underline"
                  href={`${apiBaseUrl}${latestResume.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  {t("candidates.existingResume")}
                </a>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          {t("common.prev")}
        </button>
        <span>
          {t("common.page")} {result.meta.page || 1} {t("common.of")} {result.meta.totalPages || 1}
        </span>
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm disabled:opacity-50"
          disabled={(result.meta.page || 1) >= (result.meta.totalPages || 1)}
          onClick={() => setPage((prev) => prev + 1)}
        >
          {t("common.next")}
        </button>
      </div>
    </section>
  );
};

export default CandidatesPage;
