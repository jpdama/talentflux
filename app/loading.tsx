export default function Loading() {
  return (
    <div className="shell space-y-6 py-8">
      <div className="space-y-3">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-9 w-80 max-w-full rounded" />
        <div className="skeleton h-4 w-full max-w-xl rounded" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface p-5">
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton mt-4 h-8 w-32 rounded" />
            <div className="skeleton mt-3 h-3 w-40 rounded" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="surface h-[360px]">
          <div className="skeleton h-full w-full rounded-xl" />
        </div>
        <div className="surface h-[360px]">
          <div className="skeleton h-full w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
