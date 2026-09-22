export default function CarregandoPastagens() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-[10px] bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, indice) => (
          <div
            key={indice}
            className="h-[88px] animate-pulse rounded-[12px] bg-card shadow-card"
          />
        ))}
      </div>
      <div className="overflow-hidden rounded-[12px] border border-border bg-card">
        {Array.from({ length: 6 }).map((_, indice) => (
          <div
            key={indice}
            className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
          >
            <div className="h-4 flex-1 animate-pulse rounded-md bg-muted" />
            <div className="hidden h-4 w-24 animate-pulse rounded-md bg-muted sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
