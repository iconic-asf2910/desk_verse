const StatCard = ({ title, value, subtitle, valueClass = "text-slate-900" }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>

      <p className={`mt-2 text-3xl font-semibold ${valueClass}`}>
        {value}
      </p>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;