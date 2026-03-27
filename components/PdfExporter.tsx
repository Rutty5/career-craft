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

      // マークダウンをHTMLに変換（提出用フォーマット）
      const htmlContent = result
        .replace(/<!--.*?-->/gs, "")
        // 水平線
        .replace(/^---$/gm, "<hr>")
        // 見出し変換（【セクション名】をh1に変換）
        .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // 【】で囲まれたセクション見出しをh2に変換
        .replace(/^【(.+?)】$/gm, '<h2>【$1】</h2>')
        // 太字・斜体
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        // ■ で始まる行を会社情報ブロックとして処理
        .replace(/^■ (.+)$/gm, '<div class="company-info">■ $1</div>')
        // ◆ で始まる行を実績項目として処理
        .replace(/^◆(.+)$/gm, '<div class="achievement">◆$1</div>')
        // リスト（箇条書き）
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        // 連続する空行を1つの段落区切りに
        .replace(/\n{3,}/g, '</p><p class="section-gap">')
        .replace(/\n\n/g, '</p><p>')
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
          <title>${modeLabel}</title>
          <style>
            @page {
              size: A4;
              margin: 18mm 20mm 18mm 20mm;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none !important; }
              .page-header { position: running(header); }
            }
            * { box-sizing: border-box; }
            body {
              font-family: "Yu Mincho", "Hiragino Mincho ProN", "MS PMincho", serif;
              font-size: 10.5pt;
              line-height: 1.65;
              color: #1a1a1a;
              margin: 0;
              padding: 20px 24px;
            }

            /* タイトル */
            .doc-title {
              text-align: center;
              font-size: 16pt;
              font-weight: bold;
              letter-spacing: 4px;
              margin: 0 0 6px;
              padding: 0;
            }
            .doc-date {
              text-align: right;
              font-size: 9pt;
              color: #444;
              margin: 0 0 2px;
            }
            .doc-name {
              text-align: right;
              font-size: 10.5pt;
              margin: 0 0 14px;
            }

            /* セクション見出し */
            h1 {
              font-size: 12pt;
              font-weight: bold;
              border-bottom: 2px solid #333;
              padding: 0 0 3px;
              margin: 16px 0 8px;
              page-break-after: avoid;
            }
            h2 {
              font-size: 11pt;
              font-weight: bold;
              border-left: 4px solid #333;
              padding: 1px 0 1px 8px;
              margin: 12px 0 6px;
              page-break-after: avoid;
            }
            h3 {
              font-size: 10.5pt;
              font-weight: bold;
              margin: 10px 0 4px;
              page-break-after: avoid;
            }

            /* 本文 */
            p {
              margin: 0 0 4px;
              text-align: justify;
            }
            p.section-gap {
              margin: 0 0 8px;
            }

            /* リスト */
            li {
              margin: 0 0 1px;
              padding-left: 16px;
              list-style: none;
              text-indent: -12px;
            }
            li::before {
              content: "・";
            }

            /* 太字 */
            strong {
              font-weight: bold;
            }

            /* 会社情報ブロック */
            .company-info {
              margin: 0 0 1px;
              padding: 0;
              font-weight: bold;
            }

            /* 実績項目 */
            .achievement {
              margin: 0 0 2px;
              padding-left: 0;
            }

            /* 職務経歴ブロック：途中でページを変えない */
            .job-block {
              page-break-inside: avoid;
            }

            /* 区切り線 */
            hr {
              border: none;
              border-top: 1px solid #ccc;
              margin: 8px 0;
            }

            /* 印刷ボタン */
            .print-controls {
              text-align: center;
              padding: 16px;
              margin-bottom: 20px;
              background: #f0f4f8;
              border-radius: 8px;
            }
            .print-btn {
              padding: 12px 36px;
              font-size: 15px;
              font-weight: bold;
              color: white;
              background: #1a365d;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              margin: 4px;
            }
            .print-btn:hover { opacity: 0.9; }
            .print-hint {
              font-size: 12px;
              color: #666;
              margin-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="print-controls no-print">
            <button class="print-btn" onclick="window.print()">
              PDFとして保存
            </button>
            <div class="print-hint">
              印刷ダイアログで「送信先：PDFに保存」を選択してください<br>
              余白：「なし」または「最小」推奨
            </div>
          </div>

          <p class="doc-title">職 務 経 歴 書</p>
          <p class="doc-date">${new Date().getFullYear()}年${new Date().getMonth() + 1}月${new Date().getDate()}日 現在</p>
          <p class="doc-name">${settings.name || ""}</p>

          <div class="content">
            <p>${htmlContent}</p>
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
