"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { HistoryItem } from "@/lib/types";
import { getHistory, deleteHistory, clearHistory } from "@/lib/history";
import { MODE_OPTIONS } from "@/lib/constants";
import Button from "@/components/ui/Button";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import RadarChart from "@/components/RadarChart";
import { parseScores, removeScoresComment } from "@/lib/score-parser";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("この履歴を削除しますか？")) {
      deleteHistory(id);
      setHistory(getHistory());
      if (selectedId === id) setSelectedId(null);
    }
  };

  const handleClearAll = () => {
    if (confirm("全ての履歴を削除しますか？この操作は元に戻せません。")) {
      clearHistory();
      setHistory([]);
      setSelectedId(null);
    }
  };

  const selected = history.find((h) => h.id === selectedId);

  const getModeLabel = (mode: string) =>
    MODE_OPTIONS.find((m) => m.id === mode)?.label || mode;

  return (
    <div className="min-h-screen bg-warm-bg">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="text-lg font-black text-navy">キャリアクラフト</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="text-sm text-text-light hover:text-navy transition-colors"
            >
              新規作成
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-navy">添削履歴</h1>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              全履歴クリア
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-text-light mb-4">まだ履歴がありません</p>
            <Link href="/app">
              <Button>添削を始める</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 履歴リスト */}
            <div className="lg:col-span-1 space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`bg-white rounded-xl p-4 cursor-pointer border-2 transition-all ${
                    selectedId === item.id
                      ? "border-gold shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-text-light">
                      {new Date(item.createdAt).toLocaleString("ja-JP")}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="text-xs text-error hover:underline"
                    >
                      削除
                    </button>
                  </div>
                  <div className="font-bold text-navy text-sm mb-1">
                    {item.settings.name}
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="bg-navy/10 text-navy px-2 py-0.5 rounded">
                      {getModeLabel(item.settings.mode)}
                    </span>
                    <span className="bg-gray-100 text-text-light px-2 py-0.5 rounded">
                      {item.settings.industry}
                    </span>
                    <span className="bg-gray-100 text-text-light px-2 py-0.5 rounded">
                      {item.settings.transferType}
                    </span>
                  </div>
                  {item.output.scores && (
                    <div className="mt-2 text-sm font-bold text-gold">
                      スコア: {item.output.scores.total}/100
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 詳細表示 */}
            <div className="lg:col-span-2">
              {selected ? (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-navy">
                      {selected.settings.name} - {getModeLabel(selected.settings.mode)}
                    </h2>
                    <span className="text-sm text-text-light">
                      {new Date(selected.createdAt).toLocaleString("ja-JP")}
                    </span>
                  </div>

                  {selected.output.scores && (
                    <div className="mb-6 p-4 bg-warm-bg rounded-lg">
                      <RadarChart scores={selected.output.scores} />
                    </div>
                  )}

                  <MarkdownRenderer
                    content={removeScoresComment(selected.output.resultText)}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 border border-gray-200 text-center text-text-light">
                  左側の履歴を選択すると詳細が表示されます
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
