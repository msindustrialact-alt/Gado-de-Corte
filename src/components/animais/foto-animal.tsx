import { IconeBoi } from "@/components/icons/icone-boi";
import { cn } from "@/lib/utils";

export function FotoAnimal({
  url,
  className,
  tamanho = 36,
}: {
  url: string | null;
  className?: string;
  tamanho?: number;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#DDF1E6] text-primary",
        className,
      )}
      style={{ width: tamanho, height: tamanho }}
    >
      {url ? (
        // Foto enviada pelo usuário; domínio varia no Storage.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="size-full object-cover" />
      ) : (
        <IconeBoi
          className="h-[42%] w-[62%]"
          aria-hidden
        />
      )}
    </span>
  );
}
