import Image from "next/image";

export function TelaCarregando({ cheia = false }: { cheia?: boolean }) {
  return (
    <div
      className={
        cheia
          ? "flex min-h-dvh flex-1 items-center justify-center bg-[#f2f5f3]"
          : "flex min-h-[50vh] flex-1 items-center justify-center"
      }
      role="status"
      aria-live="polite"
    >
      <Image
        src="/images/logo.png"
        alt=""
        width={1619}
        height={971}
        priority
        className="h-14 w-auto animate-pulse motion-reduce:animate-none"
      />
      <span className="sr-only">Carregando</span>
    </div>
  );
}
