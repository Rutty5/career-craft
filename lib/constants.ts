export const INDUSTRIES = [
  "IT・通信",
  "メーカー（製造業）",
  "商社",
  "金融・保険",
  "不動産・建設",
  "コンサルティング",
  "広告・メディア・エンタメ",
  "小売・流通",
  "医療・福祉・介護",
  "教育・研修",
  "物流・運輸",
  "エネルギー・インフラ",
  "人材サービス",
  "飲食・サービス",
  "官公庁・公社・団体",
  "その他",
] as const;

export const JOB_TYPES = [
  "営業（法人/個人）",
  "管理部門（人事・経理・総務・法務）",
  "エンジニア・IT系",
  "マーケティング・企画",
  "製造・品質管理",
  "医療・福祉系専門職",
  "コンサルタント・士業",
  "教育・研修・人材開発",
  "経営・事業企画",
  "クリエイティブ（デザイン等）",
  "カスタマーサポート",
  "その他",
] as const;

export const AGE_GROUPS = ["20代", "30代", "40代", "50代"] as const;

export const MODE_OPTIONS = [
  {
    id: "review" as const,
    label: "添削・スコアリング",
    desc: "5軸評価で現状を診断し、改善ポイントを提示",
    icon: "📊",
  },
  {
    id: "rewrite" as const,
    label: "リライト（全体書き直し）",
    desc: "改善版の職務経歴書を全文作成",
    icon: "📝",
  },
  {
    id: "selfpr" as const,
    label: "自己PR作成（PREP法）",
    desc: "PREP法に基づく自己PRを新規作成",
    icon: "✨",
  },
] as const;
