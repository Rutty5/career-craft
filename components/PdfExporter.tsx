"use client";

import { useState } from "react";
import type { UserSettings } from "@/lib/types";
import Button from "@/components/ui/Button";

interface PdfExporterProps {
  result: string;
  settings: UserSettings;
}

export default function PdfExporter({ result, settings }: PdfExporterProps) {
  const [generating, setGenerating] = useState(false);

  const handleExport = () => {
    setGenerating(true);
    try {
      const modeLabel =
        settings.mode === "review"
          ? "添削レポート"
          : settings.mode === "rewrite"
          ? "職務経歴書"
          : "自己PR";

      const now = new Date();
      const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

      // マークダウンをHTMLに簡易変換
      const htmlContent = result
        .replace(/<!--.*?-->/gs, "")
        .replace(/^### (.+)$/gm, '<h3 style="font-size:15px;color:#1a365d;margin:18px 0 8px;font-weight:bold;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 style="font-size:17px;color:#1a365d;margin:22px 0 10px;font-weight:bold;border-bottom:2px solid #1a365d;padding-bottom:6px;">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 style="font-size:20px;color:#1a365d;margin:24px 0 12px;font-weight:bold;">$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/^- (.+)$/gm, '<li style="margin-left:20px;margin-bottom:4px;">$1</li>')
        .replace(/\n\n/g, '<br style="margin-bottom:12px;">')
        .replace(/\n/g, "<br>");

      // 印刷用ウィンドウを開く
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("ポップアップがブロックされました。ポップアップを許可してください。");
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="utf-8">
          <title>${modeLabel} - ${settings.name}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
            body {
              font-family: "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif;
              font-size: 14px;
              line-height: 1.8;
              color: #2d3748;
              max-width: 780px;
              margin: 0 auto;
              padding: 40px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #1a365d;
              padding-bottom: 16px;
              margin-bottom: 28px;
            }
            .header h1 {
              font-size: 24px;
              color: #1a365d;
              margin: 0 0 8px;
            }
            .header p {
              font-size: 13px;
              color: #718096;
              margin: 0;
            }
            .content {
              font-size: 14px;
            }
            .footer {
              text-align: center;
              font-size: 11px;
              color: #718096;
              border-top: 1px solid #e2e8f0;
              padding-top: 16px;
              margin-top: 40px;
            }
            .print-btn {
              display: block;
              margin: 20px auto;
              padding: 14px 40px;
              font-size: 16px;
              font-weight: bold;
              color: white;
              background: #1a365d;
              border: none;
              border-radius: 8px;
              cursor: pointer;
            }
            .print-btn:hover { opacity: 0.9; }
            strong { color: #1a365d; }
          </style>
        </head>
        <body>
          <button class="print-btn no-print" onclick="window.print()">
            📄 PDFとして保存（印刷ダイアログで「PDFに保存」を選択）
          </button>
          <div class="header">
            <h1>${modeLabel}</h1>
            <p>${dateStr} ｜ ${settings.name} ｜ キャリアクラフト</p>
          </div>
          <div class="content">
            ${htmlContent}
          </div>
          <div class="footer">
            キャリアクラフト — AI × 転職支援20年以上の知見で職務経歴書を戦略的に最適化
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("PDF生成に失敗しました。テキストコピーをご利用ください。");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button variant="secondary" onClick={handleExport} disabled={generating}>
      {generating ? "準備中..." : "PDF保存"}
    </Button>
  );
}
