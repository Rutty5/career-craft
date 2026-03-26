"use client";

import { useState } from "react";
import type { UserSettings } from "@/lib/types";
import Button from "@/components/ui/Button";

interface PptxExporterProps {
  result: string;
  settings: UserSettings;
  extraInfo?: string;
}

export default function PptxExporter({ result, settings, extraInfo }: PptxExporterProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setGenerating(true);
    setError("");
    try {
      // 1. Claude APIでスライド構造を生成
      const response = await fetch("/api/presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: result, settings, jobDescription: extraInfo || "" }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || "スライドデータの生成に失敗しました"
        );
      }

      const presentationData = await response.json();

      // 2. pptxgenjsで PPTX 生成（dynamic import でバンドルサイズ削減）
      const { generatePptx } = await import("@/lib/pptx-generator");
      await generatePptx(presentationData);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "エラーが発生しました";
      setError(msg);
      console.error("PPTX generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-center">
      <Button variant="secondary" onClick={handleExport} disabled={generating}>
        {generating ? "プレゼンシート生成中..." : "プレゼンシート作成"}
      </Button>
      {error && (
        <p className="text-xs mt-1" style={{ color: "#e53e3e" }}>
          {error}
        </p>
      )}
    </div>
  );
}
