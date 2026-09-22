import Image from "next/image";

export function BannerDashboard() {
  return (
    <section className="relative h-[230px] w-full overflow-hidden">
      <Image
        src="/images/hero-dashboard.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_45%]"
      />

      <div className="relative z-10 flex h-full items-center justify-between">
        <div className="max-w-xl py-6 pl-[38px] pr-6">
          <p className="text-[15px] font-medium tracking-[0.18em] text-white uppercase">
            Fazendas Joana e Cataguá
          </p>
          <h2 className="mt-2 text-[28px] leading-[1.15] font-bold text-white md:text-[40px]">
            Pecuária de corte
            <br />
            com gestão e resultados.
          </h2>
          <p className="mt-3 text-lg text-white md:text-[20px]">
            Do campo para o futuro.
          </p>
          <span className="mt-4 block h-[3px] w-[56px] rounded-full bg-accent" />
        </div>

        <div className="relative hidden h-full w-[250px] shrink-0 items-center pr-7 lg:flex">
          <span className="absolute top-[22%] bottom-[22%] left-[16%] w-px bg-white/80" />
          <div className="w-full pl-[24%] text-white">
            <p className="text-[13px] leading-[1.7] font-medium tracking-[0.22em] italic uppercase xl:text-[14px] xl:tracking-[0.3em]">
              Animais
              <br />
              Pastagens
              <br />
              Produtividade
              <br />
              Resultados
            </p>
            <span className="mt-3 block h-[3px] w-8 rounded-full bg-accent" />
          </div>
        </div>
      </div>
    </section>
  );
}
