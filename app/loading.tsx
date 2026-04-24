export default function Loading() {
  return (
    <div className="shell py-20">
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="panel h-48 animate-pulse bg-white/5" />
        ))}
      </div>
    </div>
  );
}
