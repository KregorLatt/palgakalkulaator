import { useEffect, useState } from "react";

interface AiAnalysisProps {
  text: string;
  visible: boolean;
}

export default function AiAnalysis({ text, visible }: AiAnalysisProps) {
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
  if (visible) setAnimationClass("animate-slide-in-left-ai");
  else setAnimationClass("animate-slide-out-right-ai");
}, [visible]);

  return (
    <div
      className={`w-[350px] bg-white rounded-3xl shadow-2xl p-6 space-y-4 relative transition-all duration-500 ${animationClass}`}
    >
      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text">
        AI Analüüs
      </h2>

      <div className="flex flex-col p-4 rounded-2xl shadow-inner bg-gray-50">
        <p className="text-gray-700 text-sm whitespace-pre-wrap">
          {text}
        </p>
      </div>
    </div>
  );
}
