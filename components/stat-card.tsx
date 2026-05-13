type StatCardProps = {
  value: string;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="border-white/18 bg-white/14 rounded-2xl border p-5 text-white shadow-[0_16px_34px_rgb(8_21_43_/_0.14)]">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-white/72 mt-2 text-sm">{label}</p>
    </div>
  );
}
