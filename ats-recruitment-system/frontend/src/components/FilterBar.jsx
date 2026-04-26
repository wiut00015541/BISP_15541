// FilterBar is a shared UI building block.
const FilterBar = ({ children }) => {
  return (
    <div className="mb-5 flex flex-wrap items-stretch gap-3 rounded-[24px] border border-white/70 bg-white/75 p-3 shadow-[0_10px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl [&>*]:min-w-0 [&>*]:flex-1">
      {children}
    </div>
  );
};

export default FilterBar;
