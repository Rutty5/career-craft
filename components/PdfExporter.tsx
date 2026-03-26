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

  const handleExport = async () => {
    setGenerating(true);
    try {
      // 動的インポートで@react-pdf/rendererを読み込み
      const { Document, Page, Text, View, StyleSheet, Font, pdf } =
        await import("@react-pdf/renderer");

      // フォント登録（Google Fonts CDN - Noto Sans JP）
      Font.register({
        family: "NotoSansJP",
        fonts: [
          {
            src: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-400-normal.ttf",
            fontWeight: 400,
          },
          {
            src: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-700-normal.ttf",
            fontWeight: 700,
          },
        ],
      });

      // ハイフネーション無効化（日本語対応）
      Font.registerHyphenationCallback((word: string) => [word]);

      const styles = StyleSheet.create({
        page: {
          fontFamily: "NotoSansJP",
          fontSize: 10,
          padding: 56, // ~20mm
          color: "#2d3748",
          lineHeight: 1.6,
        },
        header: {
          textAlign: "center",
          marginBottom: 20,
          paddingBottom: 12,
          borderBottomWidth: 2,
          borderBottomColor: "#1a365d",
        },
        title: {
          fontSize: 18,
          fontWeight: 700,
          color: "#1a365d",
          marginBottom: 8,
        },
        subtitle: {
          fontSize: 9,
          color: "#718096",
        },
        section: {
          marginBottom: 12,
        },
        sectionTitle: {
          fontSize: 12,
          fontWeight: 700,
          color: "#1a365d",
          marginBottom: 6,
          paddingBottom: 3,
          borderBottomWidth: 1,
          borderBottomColor: "#e2e8f0",
        },
        text: {
          fontSize: 10,
          lineHeight: 1.6,
          marginBottom: 4,
        },
        footer: {
          position: "absolute",
          bottom: 30,
          left: 56,
          right: 56,
          textAlign: "center",
          fontSize: 8,
          color: "#718096",
        },
      });

      // マークダウンをセクションに分割
      const sections = result
        .replace(/<!--.*?-->/gs, "")
        .split(/^#{1,3}\s+/m)
        .filter((s) => s.trim());

      const modeLabel =
        settings.mode === "review"
          ? "添削レポート"
          : settings.mode === "rewrite"
          ? "職務経歴書"
          : "自己PR";

      const now = new Date();
      const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

      const PdfDoc = () => (
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>{modeLabel}</Text>
              <Text style={styles.subtitle}>
                {dateStr} | {settings.name} | キャリアクラフト
              </Text>
            </View>

            {sections.map((section, i) => {
              const lines = section.split("\n");
              const title = lines[0]?.trim();
              const body = lines
                .slice(1)
                .join("\n")
                .replace(/\*\*/g, "")
                .replace(/\*/g, "")
                .replace(/`/g, "")
                .trim();

              return (
                <View key={i} style={styles.section}>
                  {title && <Text style={styles.sectionTitle}>{title}</Text>}
                  {body && <Text style={styles.text}>{body}</Text>}
                </View>
              );
            })}

            <Text
              style={styles.footer}
              render={({ pageNumber, totalPages }) =>
                `${pageNumber} / ${totalPages} — キャリアクラフト`
              }
              fixed
            />
          </Page>
        </Document>
      );

      const blob = await pdf(<PdfDoc />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${modeLabel}_${settings.name}_${dateStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("PDF生成に失敗しました。テキストコピーをご利用ください。");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button variant="secondary" onClick={handleExport} disabled={generating}>
      {generating ? "PDF生成中..." : "PDFダウンロード"}
    </Button>
  );
}
