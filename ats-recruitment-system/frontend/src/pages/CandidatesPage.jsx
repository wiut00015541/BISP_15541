import { useEffect, useState } from "react";
import FilterBar from "../components/FilterBar";
import { usePagination } from "../hooks/usePagination";
import { useLanguage } from "../i18n.jsx";
import { fetchCandidates } from "../services/candidatesService";

const CandidatesPage = () => {
  const { t } = useLanguage();
  const { page, setPage, params } = usePagination(1, 20);
  const [result, setResult] = useState({ data: [], meta: {} });
  const [skill, setSkill] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await fetchCandidates({ ...params, skill });
      setResult(response);
    };

    load();
  }, [params, skill]);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("candidates.title")}</h1>
        <p className="mt-2 text-slate-500">{t("candidates.subtitle")}</p>
      </div>

      <FilterBar>
        <input
          className="h-11 min-w-[280px] rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
          placeholder={t("candidates.skillPlaceholder")}
          value={skill}
          onChange={(event) => setSkill(event.target.value)}
        />
      </FilterBar>

      <div className="grid gap-4 lg:grid-cols-2">
        {result.data.length === 0 ? (
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 text-slate-500 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            {t("candidates.empty")}
          </div>
        ) : null}

        {result.data.map((candidate) => (
          <article
            key={candidate.id}
            className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1"
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
          </article>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600">
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
