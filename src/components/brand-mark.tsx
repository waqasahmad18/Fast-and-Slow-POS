export function BrandMark({
  tone = "dark",
  size = "md",
}: {
  tone?: "dark" | "light";
  size?: "sm" | "md";
}) {
  const light = tone === "light";
  return (
    <div className="flex items-center gap-3">
      <div
        className={`grid shrink-0 place-items-center rounded-2xl bg-gold font-display font-semibold text-white ${
          size === "sm" ? "h-10 w-10 text-sm" : "h-12 w-12 text-base shadow-[0_8px_20px_rgba(232,93,4,0.28)]"
        }`}
      >
        F&S
      </div>
      <div>
        <p className={`text-[10px] uppercase tracking-[0.28em] ${light ? "text-gold" : "text-gold-2"}`}>
          Fast & Slow
        </p>
        <p
          className={`font-display leading-none ${size === "sm" ? "text-lg" : "text-xl"} ${
            light ? "text-ink" : "text-cream"
          }`}
        >
          Restaurant
        </p>
        {size === "md" ? (
          <p className={`mt-1 hidden text-[11px] sm:block ${light ? "text-muted" : "text-cream/60"}`}>
            Quick plates. Slow cooking.
          </p>
        ) : null}
      </div>
    </div>
  );
}
