import { useState, useEffect } from "react";
import Results from "./Results";
import AiAnalysis from "./OpenAiAnalysis";

type InputType = "neto" | "bruto" | "kulu";

export default function Calculator() {
  const [inputType, setInputType] = useState<InputType>("neto");
  const [value, setValue] = useState("");
  const [pensionRate, setPensionRate] = useState(2);
  const [includeEmpUnemp, setIncludeEmpUnemp] = useState(true);
  const [includeEmployerUnemp, setIncludeEmployerUnemp] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [neto, setNeto] = useState(0);
  const [bruto, setBruto] = useState(0);
  const [kulu, setKulu] = useState(0);

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiVisible, setAiVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [resultsVisible, setResultsVisible] = useState(false);

  const [animateTitle, setAnimateTitle] = useState(true);
  const titleMap = {
    neto: "Arvuta netopalk",
    bruto: "Arvuta brutopalk",
    kulu: "Arvuta tööandja kulu",
  } as const;

  useEffect(() => {
    setAnimateTitle(false);
    setTimeout(() => setAnimateTitle(true), 10);
  }, [inputType]);

  const INCOME_TAX_RATE = 0.22;
  const SOCIAL_TAX_RATE = 0.33;
  const SOCIAL_MIN = 270.6;
  const UNEMP_EMPLOYEE = 0.016;
  const UNEMP_EMPLOYER = 0.008;
  const pensionOptions = [2, 4, 6];

  function getMonthlyTaxFree(bruto: number): number {
    if (bruto <= 1200) return 654;
    if (bruto > 1200 && bruto <= 2100)
      return Math.max(654 - ((654 / 900) * (bruto - 1200)), 0);
    return 0;
  }

  const calcFromBruto = (b: number) => {
    const pension = b * (pensionRate / 100);
    const empUnemp = includeEmpUnemp ? b * UNEMP_EMPLOYEE : 0;

    const monthlyTaxFree = getMonthlyTaxFree(b);
    const taxable = Math.max(b - monthlyTaxFree - pension - empUnemp, 0);
    const incomeTax = taxable * INCOME_TAX_RATE;
    const net = b - pension - empUnemp - incomeTax;

    const socialTax = Math.max(b * SOCIAL_TAX_RATE, SOCIAL_MIN);
    const employerUnemp = includeEmployerUnemp ? b * UNEMP_EMPLOYER : 0;
    const employerCost = b + socialTax + employerUnemp;

    setNeto(net);
    setBruto(b);
    setKulu(employerCost);

    return { net, bruto: b, kulu: employerCost };
  };

  const calcFromNeto = (n: number) => {
    let guess = n / 0.7;
    for (let i = 0; i < 50; i++) {
      const pension = guess * (pensionRate / 100);
      const empUnemp = includeEmpUnemp ? guess * UNEMP_EMPLOYEE : 0;
      const monthlyTaxFree = getMonthlyTaxFree(guess);
      const taxable = Math.max(guess - monthlyTaxFree - pension - empUnemp, 0);
      const incomeTax = taxable * INCOME_TAX_RATE;
      const calcNet = guess - pension - empUnemp - incomeTax;
      guess = guess * (n / calcNet);
    }
    return calcFromBruto(guess);
  };

  const calcFromKulu = (k: number) => {
    let guess = k / (1 + SOCIAL_TAX_RATE + UNEMP_EMPLOYER);
    for (let i = 0; i < 50; i++) {
      const socialTax = Math.max(guess * SOCIAL_TAX_RATE, SOCIAL_MIN);
      const employerUnemp = includeEmployerUnemp ? guess * UNEMP_EMPLOYER : 0;
      const calcKulu = guess + socialTax + employerUnemp;
      guess = guess * (k / calcKulu);
    }
    return calcFromBruto(guess);
  };

  const handleCalculate = async () => {
    const v = parseFloat(value);
    if (isNaN(v)) return;

    setResultsVisible(false);
    setAiVisible(true);
    setAiLoading(true);
    setAiAnalysis(null);

    let results;
    if (inputType === "neto") results = calcFromNeto(v);
    else if (inputType === "bruto") results = calcFromBruto(v);
    else results = calcFromKulu(v);

    setTimeout(async () => {
      setResultsVisible(true);

      const promptText = `
Netopalk: ${results.net.toFixed(2)} €
Brutopalk: ${results.bruto.toFixed(2)} €
Tööandja kulu: ${results.kulu.toFixed(2)} €
Kirjuta kuni kolme täislause pikkune selge ja lühike hinnang eesti keeles.
Eesmärk: anda realistlik hoiak, kui hästi saab sellise netopalga juures 
Eestis toime tulla, arvesta, et Eesti keskmine netopalk on 1664 eurot. 
Arvesta igakuiseid kulusid (toit, eluaseme üür/laen, transport, kommunaalid) 
ja üldist elatustaset. Väljund: neutraalne, faktipõhine, praktiline ja 
mitte emotsionaalne lühikommentaar. Ära kasuta hinnanguid nagu "hea" või "halb".
`;

      try {
        const res = await fetch("http://localhost:3000/aiAnalysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: promptText }),
        });

        const data = await res.json();
        setAiAnalysis(data.analysis);
      } catch (err) {
        console.error("AI request failed", err);
        setAiAnalysis("AI analysis failed.");
      } finally {
        setAiLoading(false);
      }
    }, 10);
  };

  useEffect(() => {
    setResultsVisible(false);
    setAiVisible(false);
    setAiLoading(false);
  }, [value, pensionRate, includeEmpUnemp, includeEmployerUnemp, inputType]);

  const pension = bruto * (pensionRate / 100);
  const empUnemp = includeEmpUnemp ? bruto * UNEMP_EMPLOYEE : 0;
  const employerUnemp = includeEmployerUnemp ? bruto * UNEMP_EMPLOYER : 0;
  const monthlyTaxFree = getMonthlyTaxFree(bruto);
  const taxable = Math.max(bruto - monthlyTaxFree - pension - empUnemp, 0);
  const incomeTax = taxable * INCOME_TAX_RATE;
  const socialTax = Math.max(bruto * SOCIAL_TAX_RATE, SOCIAL_MIN);

  const gradientTextClass = "bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent";
  const gradientButtonClass = "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";

  return (
    <div className="flex justify-center items-start mt-6 space-x-8">

      <div className="w-[300px] flex justify-center">
          <AiAnalysis
            text={aiLoading ? "Ai koostab analüüsi..." : aiAnalysis ?? ""}
            visible={aiVisible}
          />
      </div>

      <div className="flex space-x-8">

        <div className="flex flex-col w-[400px] p-8 bg-white rounded-3xl shadow-2xl relative z-20">

          <h1
            className={`
              text-2xl font-bold mb-6 text-center
              transition-all duration-300 ${gradientTextClass}
              ${animateTitle ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}
            `}
          >
            {titleMap[inputType]}
          </h1>

          <div className="mb-6 flex justify-center space-x-3">
            {(["neto", "bruto", "kulu"] as InputType[]).map((type) => {
              const active = inputType === type;
              return (
                <button
                  key={type}
                  onClick={() => setInputType(type)}
                  className={`
                    relative px-5 py-2 font-semibold rounded-full text-sm transition-all duration-300
                    focus:outline-none
                    ${active
                      ? `${gradientButtonClass} shadow-lg transform scale-105`
                      : "bg-white text-yellow-600 shadow-inner border border-yellow-300 hover:shadow-lg hover:scale-105"}
                  `}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {type === "neto"
                    ? "Netopalk"
                    : type === "bruto"
                    ? "Brutopalk"
                    : "Tööandja kulu"}
                </button>
              );
            })}
          </div>

          <label className="block text-sm font-bold text-yellow-600 mb-1">
            {titleMap[inputType]} (€)
          </label>

          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full mb-4 p-3 rounded-xl border border-gray-300 shadow-inner text-lg focus:ring-2 focus:ring-yellow-300"
          />

          <div className="relative flex flex-col mb-4">
            <label className="block text-sm font-bold text-yellow-600 mb-1">
              Kogumispension
            </label>

            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="border border-gray-300 rounded-xl shadow-inner p-3 cursor-pointer flex justify-between items-center"
            >
              <span>{pensionRate}%</span>
              <span className="text-gray-400">{dropdownOpen ? "▲" : "▼"}</span>
            </div>

            {dropdownOpen && (
              <div className="absolute w-full bg-white border border-gray-300 rounded-xl shadow-lg z-50 mt-1">
                {pensionOptions.map((rate) => (
                  <div
                    key={rate}
                    className="p-3 hover:bg-yellow-50 cursor-pointer"
                    onClick={() => {
                      setPensionRate(rate);
                      setDropdownOpen(false);
                    }}
                  >
                    {rate}%
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2 flex flex-col space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeEmployerUnemp}
                  onChange={() => setIncludeEmployerUnemp(!includeEmployerUnemp)}
                  className="w-5 h-5 accent-yellow-600"
                />
                <span className="ml-2 text-sm font-bold text-yellow-600">
                  Tööandja töötuskindlustusmakse (0.8%)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeEmpUnemp}
                  onChange={() => setIncludeEmpUnemp(!includeEmpUnemp)}
                  className="w-5 h-5 accent-yellow-600"
                />
                <span className="ml-2 text-sm font-bold text-yellow-600">
                  Töötaja töötuskindlustusmakse (1.6%)
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className={`w-full py-3 font-bold rounded-xl shadow-md transition transform hover:scale-105 ${gradientButtonClass}`}
          >
            Arvuta
          </button>
        </div>

        <Results
          neto={neto}
          bruto={bruto}
          kulu={kulu}
          pension={pension}
          empUnemp={empUnemp}
          employerUnemp={employerUnemp}
          incomeTax={incomeTax}
          socialTax={socialTax}
          taxFree={monthlyTaxFree}
          visible={resultsVisible}
        />
      </div>
    </div>
  );
}
