type StatCardProps = {
  value: string;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[rgba(114,221,247,0.25)] bg-[rgba(255,255,255,0.55)] p-5 text-brand-dark shadow-[0_10px_30px_rgba(114,221,247,0.12)] backdrop-blur-[12px]">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-[#16324F]/72">{label}</p>
    </div>
  );
}
