type SeriesPoint = { label: string; value: number };

type BarChartProps = {
  title: string;
  series: SeriesPoint[];
  valuePrefix?: string;
  emptyLabel?: string;
};

type MultiBarChartProps = {
  title: string;
  categories: string[];
  series: Array<{ name: string; values: number[]; color?: string }>;
  emptyLabel?: string;
};

const COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "var(--color-warning-container)",
  "var(--color-secondary)",
];

function formatCompact(value: number, prefix = ""): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${prefix}${(value / 1_000).toFixed(1)}k`;
  return `${prefix}${Math.round(value).toLocaleString("en-IN")}`;
}

export function SimpleBarChart({
  title,
  series,
  valuePrefix = "",
  emptyLabel = "No data for this range",
}: BarChartProps) {
  const max = Math.max(...series.map((p) => p.value), 1);
  return (
    <section className="dash-chart" aria-label={title}>
      <h3 className="dash-chart__title">{title}</h3>
      {series.length === 0 ? (
        <p className="dash-chart__empty">{emptyLabel}</p>
      ) : (
        <div className="dash-chart__bars" role="img">
          {series.map((point) => (
            <div key={point.label} className="dash-chart__bar-col">
              <div className="dash-chart__bar-track">
                <div
                  className="dash-chart__bar-fill"
                  style={{ height: `${(point.value / max) * 100}%` }}
                  title={formatCompact(point.value, valuePrefix)}
                />
              </div>
              <span className="dash-chart__bar-label">{point.label}</span>
              <span className="dash-chart__bar-value">
                {formatCompact(point.value, valuePrefix)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function GroupedBarChart({
  title,
  categories,
  series,
  emptyLabel = "No data for this range",
}: MultiBarChartProps) {
  const max = Math.max(
    1,
    ...series.flatMap((s) => s.values),
  );
  if (categories.length === 0) {
    return (
      <section className="dash-chart" aria-label={title}>
        <h3 className="dash-chart__title">{title}</h3>
        <p className="dash-chart__empty">{emptyLabel}</p>
      </section>
    );
  }
  return (
    <section className="dash-chart" aria-label={title}>
      <h3 className="dash-chart__title">{title}</h3>
      <div className="dash-chart__legend">
        {series.map((s, i) => (
          <span key={s.name} className="dash-chart__legend-item">
            <span
              className="dash-chart__swatch"
              style={{ background: s.color ?? COLORS[i % COLORS.length] }}
            />
            {s.name}
          </span>
        ))}
      </div>
      <div className="dash-chart__bars dash-chart__bars--grouped" role="img">
        {categories.map((label, idx) => (
          <div key={label} className="dash-chart__bar-col">
            <div className="dash-chart__group-track">
              {series.map((s, si) => (
                <div
                  key={s.name}
                  className="dash-chart__bar-fill dash-chart__bar-fill--thin"
                  style={{
                    height: `${((s.values[idx] ?? 0) / max) * 100}%`,
                    background: s.color ?? COLORS[si % COLORS.length],
                  }}
                  title={`${s.name}: ${s.values[idx] ?? 0}`}
                />
              ))}
            </div>
            <span className="dash-chart__bar-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SimpleLineChart({
  title,
  series,
  emptyLabel = "No data for this range",
}: BarChartProps) {
  const width = 320;
  const height = 140;
  const padX = 8;
  const padY = 12;
  const max = Math.max(...series.map((p) => p.value), 1);
  const points = series.map((p, i) => {
    const x =
      series.length <= 1
        ? width / 2
        : padX + (i / (series.length - 1)) * (width - padX * 2);
    const y = height - padY - (p.value / max) * (height - padY * 2);
    return `${x},${y}`;
  });

  return (
    <section className="dash-chart" aria-label={title}>
      <h3 className="dash-chart__title">{title}</h3>
      {series.length === 0 ? (
        <p className="dash-chart__empty">{emptyLabel}</p>
      ) : (
        <>
          <svg
            className="dash-chart__svg"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
          >
            <polyline
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={points.join(" ")}
            />
          </svg>
          <div className="dash-chart__x-labels">
            {series.map((p) => (
              <span key={p.label}>{p.label}</span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
