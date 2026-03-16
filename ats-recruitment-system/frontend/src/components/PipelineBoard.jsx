import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n.jsx";

const PipelineBoard = ({ items, candidateLinkBase = "/candidates", onMove, movingApplicationId = null }) => {
  const { t, getStageLabel } = useLanguage();
  const [dragOverStage, setDragOverStage] = useState(null);

  return (
    <div className="grid gap-4 xl:grid-cols-6">
      {items.map((column, index) => (
        <section
          key={column.stage}
          className={`rounded-[28px] border p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition ${
            dragOverStage === column.stage
              ? "border-cyan-300 bg-cyan-50/70"
              : "border-white/80 bg-white/90"
          }`}
          style={{ animationDelay: `${index * 80}ms` }}
          onDragOver={(event) => {
            if (!onMove) {
              return;
            }
            event.preventDefault();
            setDragOverStage(column.stage);
          }}
          onDragLeave={() => {
            if (dragOverStage === column.stage) {
              setDragOverStage(null);
            }
          }}
          onDrop={(event) => {
            if (!onMove) {
              return;
            }
            event.preventDefault();
            const applicationId = event.dataTransfer.getData("applicationId");
            const currentStage = event.dataTransfer.getData("currentStage");
            setDragOverStage(null);
            if (!applicationId || currentStage === column.stage) {
              return;
            }
            onMove(applicationId, column.stage);
          }}
        >
          <header className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                {getStageLabel(column.stage)}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {column.applications.length} {t("pipeline.candidateCount")}
              </p>
            </div>
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
              {column.applications.length}
            </span>
          </header>

          <div className="space-y-3">
            {column.applications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-400">
                {t("pipeline.empty")}
              </div>
            ) : null}

            {column.applications.map((application) => (
              <article
                key={application.id}
                className={`rounded-[22px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 text-sm shadow-sm transition hover:-translate-y-1 ${
                  movingApplicationId === application.id ? "opacity-60" : ""
                }`}
                draggable={Boolean(onMove)}
                onDragStart={(event) => {
                  if (!onMove) {
                    return;
                  }
                  event.dataTransfer.setData("applicationId", application.id);
                  event.dataTransfer.setData("currentStage", column.stage);
                }}
              >
                <Link
                  className="font-semibold text-slate-900 underline-offset-2 hover:underline"
                  to={`${candidateLinkBase}/${application.candidate.id}`}
                >
                  {application.candidate.firstName} {application.candidate.lastName}
                </Link>
                <p className="mt-1 text-slate-600">{application.job.title}</p>
                <div className="mt-3 inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700">
                  {getStageLabel(application.currentStage?.name)}
                </div>
                {movingApplicationId === application.id ? (
                  <p className="mt-2 text-xs text-slate-400">{t("pipeline.moving")}</p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default PipelineBoard;
