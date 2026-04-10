const fallbackPalette = [
  "from-cyan-500 to-sky-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-fuchsia-500 to-pink-500",
  "from-indigo-500 to-violet-500",
  "from-rose-500 to-red-500",
];

const LiveBarChart = ({ title, subtitle, data = [], formatLabel = (value) => value, colorClass }) => {
  const max = Math.max(1, ...data.map((item) => item.count || 0));

  return (
    <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="mt-8 rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center text-sm text-slate-500">
          No chart data yet
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex h-[300px] items-end gap-3 overflow-x-auto pb-2">
            {data.map((item, index) => {
              const barHeight = Math.max(14, Math.round(((item.count || 0) / max) * 220));
              const gradientClass = colorClass || fallbackPalette[index % fallbackPalette.length];

              return (
                <div key={item.key || item.stage || item.status || index} className="flex min-w-[88px] flex-1 flex-col items-center justify-end gap-3">
                  <span className="text-sm font-semibold text-slate-950">{item.count}</span>
                  <div className="flex h-[230px] w-full items-end rounded-[24px] bg-slate-100/90 px-2 py-2">
                    <div
                      className={`w-full rounded-[18px] bg-gradient-to-t ${gradientClass} shadow-[0_10px_30px_rgba(14,165,233,0.2)] transition-all duration-500`}
                      style={{ height: `${barHeight}px` }}
                    />
                  </div>
                  <span className="text-center text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                    {formatLabel(item.stage || item.status || item.label || "")}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-5 space-y-3">
            {data.map((item, index) => (
              <div key={`legend-${item.key || item.stage || item.status || index}`} className="flex items-center justify-between gap-4 rounded-[20px] border border-slate-100 bg-slate-50/80 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full bg-gradient-to-r ${colorClass || fallbackPalette[index % fallbackPalette.length]}`} />
                  <span className="font-medium text-slate-700">{formatLabel(item.stage || item.status || item.label || "")}</span>
                </div>
                <span className="text-sm font-semibold text-slate-950">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveBarChart;
