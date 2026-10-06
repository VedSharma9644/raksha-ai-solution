import "./BarChart.css";

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
      <header className="bar-chart__header">
        <h2 className="bar-chart__title">{title}</h2>
        <p className="bar-chart__hint">Last {points.length} periods</p>
      </header>
      <div className="bar-chart__plot" role="img" aria-label={`${title} chart`}>
        {points.map((point, index) => {
          const heightPercent = Math.max((point.value / maxValue) * 100, 8);
          const tone = index % 3;

          return (
            <div key={point.label} className="bar-chart__column">
              <div className="bar-chart__value">
                {point.value}
                {valueSuffix}
              </div>
              <div className="bar-chart__bar-track">
                <div
                  className={`bar-chart__bar bar-chart__bar--tone-${tone}`}
                  style={{ height: `${heightPercent}%` }}
                  title={`${point.label}: ${point.value}${valueSuffix}`}
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
