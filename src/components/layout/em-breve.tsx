export function EmBreve({ titulo }: { titulo: string }) {
  return (
    <section className="flex min-h-[52vh] flex-col items-center justify-center rounded-xl bg-card px-6 py-16 shadow-card">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-texto-suave">
        Módulo em construção
      </p>
      <h1 className="mt-3 text-2xl font-semibold text-texto">{titulo}</h1>
      <p className="mt-2 max-w-md text-center text-sm text-texto-suave">
        Esta área estará disponível em breve no sistema das Fazendas Joana e Cataguá.
      </p>
    </section>
  );
}
