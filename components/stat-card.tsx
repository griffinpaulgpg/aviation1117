type StatCardProps = {
  value: string;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="border-white/14 rounded-lg border bg-white/10 p-5 text-white backdrop-blur">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-white/72 mt-2 text-sm">{label}</p>
    </div>
  );
}
