export default function CarregandoRacas() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-[10px] bg-muted" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, indice) => (
          <div
            key={indice}
            className="h-[72px] animate-pulse rounded-[12px] bg-card shadow-card"
          />
        ))}
      </div>
    </div>
  );
}
