import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "キャリアクラフト | AI職務経歴書 添削・リライトツール",
  description:
    "転職支援20年以上のナレッジを集約した、40代・50代専門の職務経歴書添削AIツール。5軸スコアリング、リライト、自己PR作成に対応。",
  openGraph: {
    title: "キャリアクラフト | AI職務経歴書 添削・リライトツール",
    description:
      "転職支援20年以上のナレッジ × AIで、あなたの職務経歴書を戦略的に最適化",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-noto-sans-jp)]">
        {children}
      </body>
    </html>
  );
}
