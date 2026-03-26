import type { UserSettings } from "./types";

export function buildPresentationPrompt(
  settings: UserSettings,
  resumeText: string
): { system: string; user: string } {
  const system = `あなたは職務経歴書をプレゼンテーション用スライドデータに変換する専門家です。

## 任務
リライト済みの職務経歴書テキストを受け取り、2〜3枚のスライドで構成されるプレゼンテーション用の構造化JSONを生成してください。

## 重要な制約
- 志望動機（志望理由）のスライドは絶対に作成しない
- 元テキストに存在しない実績や数字を捏造しない
- 出力はJSON形式のみ（説明文不要）

## 必須コンテンツ（必ずスライドに含めること）
1. **職務要約**: 経歴全体のサマリーを必ず含める（text または subtitle で冒頭に配置）
2. **各職歴の内容**: 経歴書に記載されたすべての会社・役職・実績に必ず触れる。省略しない。timeline や bulletList で各社の具体的な業務内容・成果を漏れなく表現する
3. **数値実績**: 元テキストに含まれる数字（売上、人数、期間、%等）はすべて metric で強調する

## スライド構成ガイドライン
上記の必須コンテンツを網羅した上で、最適な2〜3枚構成を判断してください。以下は典型的なパターンです：

パターンA（実績重視型）:
  1. 職務要約＋キーメトリクス
  2. 各社の職務経歴タイムライン＋主要実績
  3. スキル＋強み

パターンB（スキル重視型）:
  1. 職務要約＋強み
  2. 各社の実績ハイライト＋スキルマップ

パターンC（キャリアストーリー型）:
  1. 職務要約＋キャリアタイムライン（全社）
  2. 実績メトリクス＋スキル
  3. コアコンピタンス＋バリュー提案

## 利用可能な要素タイプ
- title: 大見出しテキスト（text フィールド）
- subtitle: 小見出しテキスト（text フィールド）
- text: 本文テキストブロック（text フィールド）
- bulletList: 箇条書き（items 配列: string[]）
- metric: 数値ハイライト 2〜4個（metrics 配列: {value, label}[]）
  - value例: "150%", "12名", "3年", "年商2億円"
  - 必ず元テキストから抽出した実数値を使う
- timeline: 経歴タイムライン（timeline 配列: {period, company, role, highlight}[]）
  - period例: "2018年4月〜2022年3月"
  - highlight: 1行の成果サマリー
- skillBars: スキルバーチャート 4〜6個（skills 配列: {name, level}[]）
  - level: 1〜5の整数
- iconGrid: アイコングリッド 3〜4個（gridItems 配列: {icon, label, description}[]）
  - icon: 1つの絵文字（例: 📊🎯💡🤝）
  - description: 20文字以内の短い説明
- twoColumn: 2カラムレイアウト（left, right にそれぞれ SlideElement を入れ子）

## 視覚的に映えるデータの抽出ポイント
- 数字があれば必ず metric で強調する（売上、人数、期間、%など）
- スキルは5つ前後に絞り skillBars で表示
- 強みは iconGrid で3〜4項目、絵文字アイコン付き
- 経歴が複数社あれば timeline を使う
- 各スライドに2〜4個の要素を配置（多すぎると見づらい）

## 出力JSON形式
{
  "coverTitle": "職務経歴プレゼンテーション",
  "coverSubtitle": "氏名",
  "slides": [
    {
      "title": "スライドタイトル",
      "elements": [
        { "type": "要素タイプ", ...各タイプ固有のフィールド }
      ]
    }
  ]
}

JSONのみを出力してください。マークダウンのコードフェンスで囲んでも構いません。`;

  const user = `以下の職務経歴書をプレゼンテーション用スライドデータに変換してください。

対象者: ${settings.name}
業界: ${settings.industry}
職種: ${settings.jobType}

【職務経歴書テキスト】
${resumeText}`;

  return { system, user };
}
