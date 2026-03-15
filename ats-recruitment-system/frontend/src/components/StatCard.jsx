const StatCard = ({ title, value, caption, accent = "cyan" }) => {
  const accentClasses = {
    cyan: "from-cyan-500/10 to-sky-500/5 text-cyan-700",
    amber: "from-amber-500/10 to-orange-500/5 text-amber-700",
    emerald: "from-emerald-500/10 to-teal-500/5 text-emerald-700",
  };

  return (
    <article className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1">
      <div className={`inline-flex rounded-full bg-gradient-to-br px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] ${accentClasses[accent]}`}>
        {title}
      </div>
      <p className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{caption}</p>
    </article>
  );
};

export default StatCard;
