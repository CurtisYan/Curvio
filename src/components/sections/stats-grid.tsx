type Stat = {
  label: string;
  value: string | number;
};

export function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid overflow-hidden rounded-xl border border-border-subtle bg-border-subtle sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          className="flex flex-col items-center bg-surface-offwhite p-6 text-center"
          key={stat.label}
        >
          <span className="text-3xl font-medium text-foreground">{stat.value}</span>
          <span className="mt-2 text-[11px] font-medium uppercase tracking-widest text-muted">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
