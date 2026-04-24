export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</div>
      <h2 className="text-2xl font-semibold text-white md:text-3xl">{title}</h2>
      {description ? <p className="max-w-3xl text-sm leading-7 text-slate-300">{description}</p> : null}
    </div>
  );
}
