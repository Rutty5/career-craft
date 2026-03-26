export type AgeGroup = "20代" | "30代" | "40代" | "50代";
export type TransferType = "同業種" | "異業種";
export type AppMode = "review" | "rewrite" | "selfpr";

export interface UserSettings {
  name: string;
  email: string;
  ageGroup: AgeGroup;
  industry: string;
  jobType: string;
  transferType: TransferType;
  mode: AppMode;
}

export interface AppInput {
  resumeText: string;
  extraInfo: string;
}

export interface Scores {
  impact: number;
  specificity: number;
  targetFit: number;
  readability: number;
  emotion: number;
  total: number;
}

export interface HistoryItem {
  id: string;
  createdAt: string;
  settings: UserSettings;
  input: AppInput;
  output: {
    resultText: string;
    scores?: Scores;
  };
}

export interface GenerateRequest {
  settings: UserSettings;
  input: AppInput;
}

export interface ScrapeJobResponse {
  success: boolean;
  text?: string;
  error?: string;
}

// ─── プレゼンシート用型定義 ───

export type SlideElementType =
  | "title"
  | "subtitle"
  | "text"
  | "bulletList"
  | "metric"
  | "timeline"
  | "skillBars"
  | "iconGrid"
  | "twoColumn";

export interface SlideMetric {
  value: string;
  label: string;
}

export interface TimelineEntry {
  period: string;
  company: string;
  role: string;
  highlight: string;
}

export interface SkillBar {
  name: string;
  level: number; // 1-5
}

export interface IconGridItem {
  icon: string;
  label: string;
  description: string;
}

export interface SlideElement {
  type: SlideElementType;
  text?: string;
  items?: string[];
  metrics?: SlideMetric[];
  timeline?: TimelineEntry[];
  skills?: SkillBar[];
  gridItems?: IconGridItem[];
  left?: SlideElement;
  right?: SlideElement;
}

export interface SlideData {
  title: string;
  elements: SlideElement[];
}

export interface PresentationData {
  coverTitle: string;
  coverSubtitle: string;
  slides: SlideData[];
}

export interface PresentationRequest {
  resumeText: string;
  settings: UserSettings;
}
