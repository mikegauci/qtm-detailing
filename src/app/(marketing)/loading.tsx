export default function MarketingLoading() {
  return (
    <div className="section-padding pt-32">
      <div className="container-narrow animate-pulse space-y-8">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="mx-auto h-4 w-24 rounded bg-surface-raised" />
          <div className="h-10 w-full rounded bg-surface-raised" />
          <div className="h-5 w-3/4 rounded bg-surface-raised" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/3] rounded-2xl bg-surface-raised"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
