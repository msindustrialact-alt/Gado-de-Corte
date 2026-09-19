import Image from "next/image";

export function CardPromo() {
  return (
    <article className="relative h-auto min-h-[242px] overflow-hidden rounded-[12px] lg:h-[242px]">
      <Image
        src="/images/card-promo.jpg"
        alt=""
        fill
        sizes="(max-width: 1280px) 100vw, 28vw"
        className="object-cover object-center"
      />
      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        <div>
          <p className="max-w-[13rem] text-[26px] leading-[1.2] font-semibold text-white">
            Gestão no campo gera resultados no futuro.
          </p>
          <span className="mt-3 block h-[3px] w-10 rounded-full bg-accent" />
        </div>
        <Image
          src="/images/logo.png"
          alt="Fazenda Joana – Serra Joana"
          width={476}
          height={170}
          className="h-auto w-[132px]"
        />
      </div>
    </article>
  );
}
