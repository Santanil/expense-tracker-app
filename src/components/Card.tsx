export default function Card({
  title,
  action,
  children,
  fillPercent,
  fillColor = "#2FE6C8"
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  /** 0–100. When set, renders a liquid-style fill sweeping in from the left of the card. */
  fillPercent?: number;
  fillColor?: string;
}) {
  const hasFill = fillPercent !== undefined;

  return (
    <div
      className={`relative z-0 rounded-2xl border border-line bg-surface p-5 ${
        hasFill ? "overflow-hidden" : ""
      }`}
    >
      {hasFill && (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 transition-[width] duration-700 ease-out"
          style={{
            width: `${Math.min(100, Math.max(0, fillPercent))}%`,
            background: `${fillColor}22`,
            borderRight: `2px solid ${fillColor}`,
            boxShadow: `8px 0 20px -8px ${fillColor}`
          }}
        />
      )}
      {title && (
        <div className="relative z-10 flex items-center justify-between border-b border-line pb-3">
          <h2 className="font-body text-xs text-ink/60">{title}</h2>
          {action}
        </div>
      )}
      <div className={`relative z-10 ${title ? "pt-4" : ""}`}>{children}</div>
    </div>
  );
}
