import { useEffect, useState } from "react";

interface Props {
  neto: number;
  bruto: number;
  kulu: number;
  pension: number;
  empUnemp: number;
  employerUnemp: number;
  incomeTax: number;
  socialTax: number;
  taxFree: number;
  visible: boolean;
}

export default function Results({
  neto,
  bruto,
  kulu,
  pension,
  empUnemp,
  employerUnemp,
  incomeTax,
  socialTax,
  taxFree,
  visible,
}: Props) {
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    if (visible) setAnimationClass("animate-slide-in-right");
    else setAnimationClass("animate-slide-out-left");
  }, [visible]);

  const gradientClass = "bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text";

  return (
    <div
      className={`w-[350px] p-6 space-y-5 relative rounded-3xl shadow-2xl bg-white transition-all duration-500 ${animationClass}`}
    >
      <h2 className={`text-2xl font-bold text-center ${gradientClass}`}>
        Tulemused
      </h2>

      <div className="flex flex-col p-4 rounded-2xl shadow-inner bg-gray-50">
        <div className="flex justify-between mb-1">
          <span className="font-semibold text-yellow-600">Tööandja kulu:</span>
          <span className="font-bold">{kulu.toFixed(2)} €</span>
        </div>
        <div className="text-gray-500 text-sm space-y-0.5">
          <div>Tööandja töötuskindlustus: {employerUnemp.toFixed(2)} €</div>
          <div>Sotsiaalmaks: {socialTax.toFixed(2)} €</div>
        </div>
      </div>

      <div className="flex flex-col p-4 rounded-2xl shadow-inner bg-gray-50">
        <div className="flex justify-between mb-1">
          <span className="font-semibold text-yellow-600">Brutopalk:</span>
          <span className="font-bold">{bruto.toFixed(2)} €</span>
        </div>
        <div className="text-gray-500 text-sm space-y-0.5">
          <div>Makstud sotsiaalmaks: {socialTax.toFixed(2)} €</div>
          <div>Maksuvaba tulu: {taxFree.toFixed(2)} €</div>
        </div>
      </div>

      <div className="flex flex-col p-4 rounded-2xl shadow-inner bg-gray-50">
        <div className="flex justify-between mb-1">
          <span className="font-semibold text-yellow-600">Netopalk:</span>
          <span className="font-bold">{neto.toFixed(2)} €</span>
        </div>
        <div className="text-gray-500 text-sm space-y-0.5">
          <div>Kogumispension: {pension.toFixed(2)} €</div>
          <div>Töötaja töötuskindlustus: {empUnemp.toFixed(2)} €</div>
          <div>Tulumaks: {incomeTax.toFixed(2)} €</div>
        </div>
      </div>
    </div>
  );
}
