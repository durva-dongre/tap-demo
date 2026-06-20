"use client";
import { StepOption } from "@/lib/flow-engine";

type Props = { options: StepOption[]; onSelect: (opt: StepOption) => void; style?: string };

export function OptionButtons({ options, onSelect, style }: Props) {
  const isRadio = style === "radio";
  return (
    <div className={`flex flex-wrap gap-2 mt-1 ${isRadio ? "flex-col items-start" : ""}`}>
      {options.map((o, i) => (
        <button key={o.id ?? o.value ?? i} className="option-pill" onClick={() => onSelect(o)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}