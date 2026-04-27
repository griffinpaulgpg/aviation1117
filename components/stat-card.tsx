type StatCardProps = {
  value: string;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="border-white/24 bg-white/14 rounded-2xl border p-5 text-white shadow-2xl shadow-black/10 backdrop-blur-md">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-white/72 mt-2 text-sm">{label}</p>
    </div>
  );
}
