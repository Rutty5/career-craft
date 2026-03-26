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
