export interface BarChartPoint {
  label: string;
  value: number;
}

export interface BarChartProps {
  title: string;
  points: BarChartPoint[];
  valueSuffix?: string;
}

export function BarChart({ title, points, valueSuffix = "" }: BarChartProps) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <section className="bar-chart" aria-label={title}>
      <h2 className="bar-chart__title">{title}</h2>
      <div className="bar-chart__plot" role="img" aria-label={`${title} chart`}>
        {points.map((point) => {
          const heightPercent = Math.max((point.value / maxValue) * 100, 6);

          return (
            <div key={point.label} className="bar-chart__column">
              <div className="bar-chart__value">
                {point.value}
                {valueSuffix}
              </div>
              <div className="bar-chart__bar-track">
                <div
                  className="bar-chart__bar"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <div className="bar-chart__label">{point.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
