"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { nanoid } from "nanoid";
import type { UserSettings, AppInput } from "@/lib/types";
import { parseScores } from "@/lib/score-parser";
import { saveHistory } from "@/lib/history";
import StepIndicator from "@/components/ui/StepIndicator";
import StepSettings from "@/components/steps/StepSettings";
import StepInput from "@/components/steps/StepInput";
import StepResult from "@/components/steps/StepResult";

const DEFAULT_SETTINGS: UserSettings = {
  name: "",
  email: "",
  ageGroup: "" as UserSettings["ageGroup"],
  industry: "",
  jobType: "",
  transferType: "" as UserSettings["transferType"],
  mode: "review",
};

const DEFAULT_INPUT: AppInput = {
  resumeText: "",
  extraInfo: "",
};

export default function AppPage() {
  const [step, setStep] = useState(0);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [input, setInput] = useState<AppInput>(DEFAULT_INPUT);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const savedRef = useRef(false);

  const updateSettings = useCallback(
    (updates: Partial<UserSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const updateInput = useCallback(
    (updates: Partial<AppInput>) => {
      setInput((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  // 結果完了時に履歴保存
  useEffect(() => {
    if (!loading && result && !savedRef.current) {
      savedRef.current = true;
      const scores = parseScores(result);
      saveHistory({
        id: nanoid(),
        createdAt: new Date().toISOString(),
        settings,
        input,
        output: {
          resultText: result,
          scores: scores ?? undefined,
        },
      });
    }
  }, [loading, result, settings, input]);

  const handleSubmit = useCallback(async () => {
    setStep(2);
    setLoading(true);
    setError("");
    setResult("");
    savedRef.current = false;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, input }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        let errorMessage = "エラーが発生しました (" + response.status + ")";
        try {
          const errData = JSON.parse(errText);
          if (errData?.error) errorMessage = errData.error;
        } catch {
          if (errText) errorMessage = errText.slice(0, 200);
        }
        throw new Error(errorMessage);
      }

      const text = await response.text();
      setResult(text);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "予期せぬエラーが発生しました。再度お試しください。"
      );
    } finally {
      setLoading(false);
    }
  }, [settings, input]);

  const handleRestart = useCallback(() => {
    setStep(0);
    setSettings(DEFAULT_SETTINGS);
    setInput(DEFAULT_INPUT);
    setResult("");
    setError("");
    savedRef.current = false;
  }, []);

  return (
    <div className="min-h-screen bg-warm-bg">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="text-lg font-black text-navy">キャリアクラフト</span>
          </Link>
          <Link
            href="/history"
            className="text-sm text-text-light hover:text-navy transition-colors"
          >
            履歴
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <StepIndicator currentStep={step} />
      </div>

      <main className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {step === 0 && (
            <StepSettings
              settings={settings}
              onUpdate={updateSettings}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <StepInput
              settings={settings}
              input={input}
              onUpdate={updateInput}
              onSubmit={handleSubmit}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <StepResult
              settings={settings}
              input={input}
              result={result}
              loading={loading}
              error={error}
              onRestart={handleRestart}
              onBack={() => setStep(0)}
              onRetry={handleSubmit}
            />
          )}
        </div>
      </main>
    </div>
  );
}
