import { useEffect, useRef, useState } from "preact/hooks";

interface Props {
  target: number;
}

const formatter = new Intl.NumberFormat("pt-BR");

export default function CounterUp({ target }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(target);

  useEffect(() => {
    let revert = () => {};

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const counter = { value: 0 };
        setValue(0);
        const tween = gsap.to(counter, {
          value: target,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => setValue(Math.round(counter.value)),
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            once: true,
          },
        });
        return () => tween.scrollTrigger?.kill();
      });

      revert = () => mm.revert();
    })();

    return () => revert();
  }, [target]);

  return <span ref={ref}>+{formatter.format(value)}</span>;
}
