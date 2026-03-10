import { useEffect, useState } from "react";
import FilterBar from "../components/FilterBar";
import { fetchCandidates } from "../services/candidatesService";
import { usePagination } from "../hooks/usePagination";

const CandidatesPage = () => {
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
    <section>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Candidates</h1>

      <FilterBar>
        <input
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Filter by skill (e.g. react)"
          value={skill}
          onChange={(event) => setSkill(event.target.value)}
        />
      </FilterBar>

      <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
        {result.data.map((candidate) => (
          <article key={candidate.id} className="mb-2 rounded border border-slate-200 p-3 text-sm">
            <h3 className="font-semibold text-slate-900">
              {candidate.firstName} {candidate.lastName}
            </h3>
            <p className="text-slate-600">{candidate.email}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-1"
          disabled={page <= 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Prev
        </button>
        <span>
          Page {result.meta.page || 1} of {result.meta.totalPages || 1}
        </span>
        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-1"
          disabled={(result.meta.page || 1) >= (result.meta.totalPages || 1)}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default CandidatesPage;
