"use client";

import { useState, useMemo } from "react";
import type { UserSettings, AppInput } from "@/lib/types";
import { parseScores, removeScoresComment } from "@/lib/score-parser";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import RadarChart from "@/components/RadarChart";
import PdfExporter from "@/components/PdfExporter";
import PptxExporter from "@/components/PptxExporter";
import Button from "@/components/ui/Button";

interface StepResultProps {
  settings: UserSettings;
  input: AppInput;
  result: string;
  loading: boolean;
  error: string;
  onRestart: () => void;
  onBack: () => void;
  onRetry: () => void;
}

export default function StepResult({
  settings,
  input,
  result,
  loading,
  error,
  onRestart,
  onBack,
  onRetry,
}: StepResultProps) {
  const [copied, setCopied] = useState(false);

  const scores = useMemo(() => {
    if (!result || loading) return null;
    return parseScores(result);
  }, [result, loading]);

  const cleanResult = useMemo(() => {
    return removeScoresComment(result);
  }, [result]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = cleanResult;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading && !result) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <div className="flex gap-2 mb-4">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
        <p className="text-lg font-bold text-navy">
          キャリアクラフトが分析中...
        </p>
        <p className="text-sm text-text-light mt-2">
          職務経歴書を詳細に分析しています。30秒〜1分ほどお待ちください。
        </p>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-lg font-bold text-error mb-2">エラーが発生しました</p>
        <p className="text-sm text-text-light mb-6">{error}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack}>
            ← 設定に戻る
          </Button>
          <Button onClick={onRetry}>再実行</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {scores && settings.mode === "review" && (
        <div className="bg-warm-bg rounded-xl p-6">
          <h3 className="text-lg font-bold text-navy text-center mb-4">
            5軸スコア分析
          </h3>
          <RadarChart scores={scores} />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <MarkdownRenderer content={cleanResult} />
        {loading && (
          <div className="flex items-center gap-2 mt-4 text-text-light">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="text-sm">生成中...</span>
          </div>
        )}
      </div>

      {!loading && (
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? "✓ コピーしました" : "テキストコピー"}
          </Button>
          <PdfExporter result={cleanResult} settings={settings} />
          {settings.mode === "rewrite" && (
            <PptxExporter result={cleanResult} settings={settings} extraInfo={input.extraInfo} />
          )}
          <Button variant="secondary" onClick={onBack}>
            設定を変えて再実行
          </Button>
          <Button variant="ghost" onClick={onRestart}>
            最初からやり直す
          </Button>
        </div>
      )}
    </div>
  );
}
