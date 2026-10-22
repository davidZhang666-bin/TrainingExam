export interface Metric {
  label: string;
  value: string | number;
  detail: string;
}

export default function MetricCards({ items }: { items: Metric[] }) {
  return (
    <div className="ws-metrics">
      {items.map((item, index) => (
        <section className="panel ws-metric" key={item.label}>
          <span className={`ws-metric-dot tone-${index % 4}`} />
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <small>{item.detail}</small>
        </section>
      ))}
    </div>
  );
}
