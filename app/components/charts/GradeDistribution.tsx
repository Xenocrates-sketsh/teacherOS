"use client";

interface GradeDistributionProps {
  ranges: { label: string; count: number; color: string }[];
  total: number;
}

export default function GradeDistribution({ ranges, total }: GradeDistributionProps) {
  if (total === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[#7b6b8d] uppercase">Score Distribution</p>
      {ranges.map((range) => {
        const pct = total > 0 ? (range.count / total) * 100 : 0;
        return (
          <div key={range.label} className="flex items-center gap-3">
            <span className="text-xs text-[#7b6b8d] w-16 text-right">{range.label}</span>
            <div className="flex-1 bg-surface-card rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full ${range.color} transition-all`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-[#9d8ab5] w-8">{range.count}</span>
          </div>
        );
      })}
    </div>
  );
}
