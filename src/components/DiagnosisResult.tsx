import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface DiagnosisResultProps {
  label: string;
  label_key?: string;
  confidence: number;
  severity: "mild" | "moderate" | "severe";
  explanation: string;
  steps: string[];
  watch_for: string;
  model_version?: string;
}

const severityIcons = {
  mild: CheckCircle,
  moderate: AlertTriangle,
  severe: AlertCircle,
};

const severityColors = {
  mild: "bg-green-100 text-green-800 border-green-200",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  severe: "bg-red-100 text-red-800 border-red-200",
};

export default function DiagnosisResult({
  label,
  label_key,
  confidence,
  severity,
  explanation,
  steps,
  watch_for,
  model_version,
}: DiagnosisResultProps) {
  const SeverityIcon = severityIcons[severity];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{label}</h2>
          {label_key && (
            <p className="text-sm text-gray-500 font-mono mt-0.5">{label_key}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SeverityIcon
            size={18}
            className={
              severity === "severe"
                ? "text-red-500"
                : severity === "moderate"
                ? "text-yellow-500"
                : "text-green-500"
            }
          />
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${severityColors[severity]}`}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        Confidence: <span className="font-semibold">{(confidence * 100).toFixed(1)}%</span>
      </p>

      <p className="text-gray-700 leading-relaxed mb-4">{explanation}</p>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 mb-2">Action Steps (Next 48 Hours):</h3>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Watch for:</span> {watch_for}
        </p>
      </div>

      {model_version && (
        <p className="text-xs text-gray-400 mt-4">Model: {model_version}</p>
      )}
    </div>
  );
}
