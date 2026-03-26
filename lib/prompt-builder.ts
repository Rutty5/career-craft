import { KNOWLEDGE_BASE } from "./knowledge-base";
import type { UserSettings, AppMode } from "./types";

export function buildSystemPrompt(
  settings: UserSettings,
  mode: AppMode
): string {
  const parts: string[] = [];

  // 1. RAGナレッジベース全文
  parts.push(KNOWLEDGE_BASE);

  // 2. セッション設定
  parts.push(`
---
# ■ セッション設定

- 対象年代: ${settings.ageGroup}
- 応募先業界: ${settings.industry}
- 応募先職種: ${settings.jobType}
- 転職タイプ: ${settings.transferType}への転職
- 対象者名: ${settings.name}
`);

  // 3. 転職タイプ別の分岐
  if (settings.transferType === "同業種") {
    parts.push(`
## 転職タイプ指示（同業種転職）
ユーザーは同業種転職を希望しています。${settings.industry}業界内での転職です。
- 業界特有の専門性と即戦力としての再現性を重点的にアピールしてください
- 業界用語は適切に使用し、技術的な深さを出してください
- 競合他社との差別化ポイントを意識した表現を用いてください
`);
  } else {
    parts.push(`
## 転職タイプ指示（異業種転職）
ユーザーは異業種転職を希望しています。${settings.industry}業界への転職です。
- ポータブルスキル（マネジメント・課題解決・折衝力・プロジェクト管理）を前面に出してください
- 業界用語は使わず、誰でもわかる言葉で成果を説明してください
- 「なぜ異業種に挑戦するのか」の動機付けを重視してください
- 「異なる視点を活かした価値創出」を訴求してください
`);
  }

  // 4. 年代別の分岐
  if (settings.ageGroup === "50代") {
    parts.push(`
## 年代別指示（50代）
PART 8の50代専用ガイドラインを全面適用してください。
- マネジメント力、専門性の深さ、再現性の3つの期待値を示す
- さらに次世代育成力、経営視点も重視する
- 数字による実績証明を強化する
- 「貢献期間のロードマップ」「育成実績」「変化対応力」「年下上司への適応」「謙虚さとプロ意識」の5要素を必ず意識する
- 年齢の壁を超える記述を積極的に盛り込む
`);
  } else if (settings.ageGroup === "40代") {
    parts.push(`
## 年代別指示（40代）
- マネジメント力、専門性の深さ、再現性の3つの期待値を明確に示してください
- 数字による実績証明を強化してください
- 即戦力としての価値を強調してください
`);
  } else {
    parts.push(`
## 年代別指示（${settings.ageGroup}）
- ポテンシャルと成長意欲を重視してください
- 学習速度と適応力をアピールしてください
- PREP法による自己PRを重視してください
`);
  }

  // 5. モード別の指示
  if (mode === "review") {
    parts.push(`
## モード指示（添削モード）
PART 7の添削出力フォーマットに厳密に従って回答してください。

出力順序:
1. 総合スコア
2. 軸別スコア（テーブル形式）
3. 総評（3〜5行）
4. 最優先改善ポイントTOP3
5. セクション別フィードバック（Before→After付き）
6. 改善版サンプル
7. 次のステップ
8. 応援メッセージ

重要: 応答の最後に以下のJSON形式でスコアを出力してください（フロントエンドでのパース用）:
<!-- SCORES_JSON:{"impact":XX,"specificity":XX,"targetFit":XX,"readability":XX,"emotion":XX,"total":XX} -->
`);
  } else if (mode === "rewrite") {
    parts.push(`
## モード指示（リライトモード）
職務経歴書フォーマットに準拠した全文を作成してください。

セクション構成:
- 【職務要約】
- 【職務経歴】
- 【業務実績】
- 【自己PR】

重要制約:
- 虚偽の実績は絶対に創作しない
- 数字は元の情報にあるものだけ使う
- 改善ポイントの解説を末尾に添付する
`);
  } else {
    parts.push(`
## モード指示（自己PR作成モード）
PREP法（Point→Reason→Example→Point）の4構造で自己PRを作成してください。

要件:
- 400〜600字で作成
- 2〜3案を提示する
- 各案にはタイトルをつける
- 応募先の業界・職種に合わせた内容にする
- 虚偽の実績は絶対に創作しない
`);
  }

  // 6. 共通制約
  parts.push(`
## 共通制約
- 日本語で回答してください
- マークダウン形式で出力してください
- 虚偽の実績を創作しないでください
- 数字は元の情報にあるものだけ使ってください
- ユーザーの経歴にない経験を追加しないでください
`);

  return parts.join("\n");
}

export function buildUserMessage(
  mode: AppMode,
  resumeText: string,
  extraInfo: string
): string {
  const extra = extraInfo
    ? `\n\n【補足情報・応募先詳細】\n${extraInfo}`
    : "";

  switch (mode) {
    case "review":
      return `以下の職務経歴書を添削してください。5軸評価でスコアリングし、Before→Afterの改善案を提示してください。\n\n【職務経歴書】\n${resumeText}${extra}`;
    case "rewrite":
      return `以下の職務経歴書をリライトしてください。改善版の職務経歴書を全文作成してください。\n\n【職務経歴書】\n${resumeText}${extra}`;
    case "selfpr":
      return `以下の情報をもとにPREP法で自己PRを作成してください。400〜600字で2〜3案を提示してください。\n\n【経歴・強み・実績】\n${resumeText}${extra}`;
  }
}
