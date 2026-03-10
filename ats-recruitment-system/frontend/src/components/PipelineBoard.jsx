const PipelineBoard = ({ items }) => {
  return (
    <div className="grid gap-4 lg:grid-cols-6">
      {items.map((column) => (
        <section key={column.stage} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">{column.stage}</h3>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{column.applications.length}</span>
          </header>

          <div className="space-y-2">
            {column.applications.map((application) => (
              <article key={application.id} className="rounded border border-slate-200 bg-slate-50 p-2 text-xs">
                <p className="font-medium text-slate-800">
                  {application.candidate.firstName} {application.candidate.lastName}
                </p>
                <p className="text-slate-600">{application.job.title}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default PipelineBoard;
