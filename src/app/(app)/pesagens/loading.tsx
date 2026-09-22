export default function CarregandoPesagens() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-44 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-[10px] bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, indice) => (
          <div key={indice} className="h-20 animate-pulse rounded-[12px] bg-card shadow-card" />
        ))}
      </div>
      <div className="h-16 animate-pulse rounded-[12px] bg-card shadow-card" />
      <div className="overflow-hidden rounded-[12px] border border-border bg-card">
        {Array.from({ length: 6 }).map((_, indice) => (
          <div
            key={indice}
            className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
          >
            <div className="h-4 flex-1 animate-pulse rounded-md bg-muted" />
            <div className="hidden h-4 w-24 animate-pulse rounded-md bg-muted sm:block" />
            <div className="hidden h-4 w-16 animate-pulse rounded-md bg-muted md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
