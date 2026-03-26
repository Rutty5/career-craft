"use client";

import { useState, useRef } from "react";
import type { UserSettings, AppInput } from "@/lib/types";
import { MODE_OPTIONS } from "@/lib/constants";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface StepInputProps {
  settings: UserSettings;
  input: AppInput;
  onUpdate: (updates: Partial<AppInput>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function StepInput({
  settings,
  input,
  onUpdate,
  onSubmit,
  onBack,
}: StepInputProps) {
  const [jobUrl, setJobUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [jobPdfUploading, setJobPdfUploading] = useState(false);
  const [jobPdfFileName, setJobPdfFileName] = useState("");
  const [jobPdfError, setJobPdfError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jobFileInputRef = useRef<HTMLInputElement>(null);

  const modeLabel =
    MODE_OPTIONS.find((m) => m.id === settings.mode)?.label || "";
  const isSelfPr = settings.mode === "selfpr";

  const isValid = isSelfPr || input.resumeText.trim().length >= 50;

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfUploading(true);
    setPdfError("");
    setPdfFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.text) {
        onUpdate({ resumeText: data.text });
        setPdfFileName(file.name + "（" + data.pages + "ページ・読み取り完了）");
      } else {
        setPdfError(data.error || "PDFの読み取りに失敗しました。");
        setPdfFileName("");
      }
    } catch {
      setPdfError("PDFの読み取りに失敗しました。");
      setPdfFileName("");
    } finally {
      setPdfUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleJobPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setJobPdfUploading(true);
    setJobPdfError("");
    setJobPdfFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.text) {
        const prefix = "【求人票PDFより取得】\n";
        onUpdate({
          extraInfo: input.extraInfo
            ? input.extraInfo + "\n\n" + prefix + data.text
            : prefix + data.text,
        });
        setJobPdfFileName(file.name + "（" + data.pages + "ページ・読み取り完了）");
      } else {
        setJobPdfError(data.error || "PDFの読み取りに失敗しました。");
        setJobPdfFileName("");
      }
    } catch {
      setJobPdfError("PDFの読み取りに失敗しました。");
      setJobPdfFileName("");
    } finally {
      setJobPdfUploading(false);
      if (jobFileInputRef.current) jobFileInputRef.current.value = "";
    }
  };

  const handleScrape = async () => {
    if (!jobUrl.trim()) return;
    setScraping(true);
    setScrapeError("");
    try {
      const res = await fetch("/api/scrape-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        onUpdate({
          extraInfo: input.extraInfo
            ? input.extraInfo + "\n\n【求人票より取得】\n" + data.text
            : "【求人票より取得】\n" + data.text,
        });
        setJobUrl("");
      } else {
        setScrapeError(data.error || "読み込めませんでした。手動で貼り付けてください。");
      }
    } catch {
      setScrapeError("読み込めませんでした。手動で貼り付けてください。");
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-navy/5 rounded-lg p-4 text-sm">
        <div className="font-bold text-navy mb-2">設定内容</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-text-light">
          <div><span className="font-medium text-text-main">年代:</span>{" "}{settings.ageGroup}</div>
          <div><span className="font-medium text-text-main">転職:</span>{" "}{settings.transferType}</div>
          <div><span className="font-medium text-text-main">業界:</span>{" "}{settings.industry}</div>
          <div><span className="font-medium text-text-main">職種:</span>{" "}{settings.jobType}</div>
        </div>
        <div className="mt-1 text-text-light">
          <span className="font-medium text-text-main">モード:</span>{" "}{modeLabel}
        </div>
      </div>

      {!isSelfPr && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-text-main">職務経歴書PDFをアップロード</label>
          <p className="text-xs text-text-light">PDFファイルをアップロードすると、テキストを自動で読み取ります</p>
          <div
            className={"relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer hover:border-gold hover:bg-gold/5 " + (pdfFileName ? "border-gold bg-gold/5" : "border-gray-300")}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
            {pdfUploading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
                <span className="text-sm text-text-light">PDF読み取り中...</span>
              </div>
            ) : pdfFileName ? (
              <div>
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm font-medium text-navy">{pdfFileName}</p>
                <p className="text-xs text-text-light mt-1">クリックして別のファイルをアップロード</p>
              </div>
            ) : (
              <div>
                <div className="text-3xl mb-2">📄</div>
                <p className="text-sm font-medium text-text-main">クリックしてPDFを選択</p>
                <p className="text-xs text-text-light mt-1">PDF形式・10MB以下</p>
              </div>
            )}
          </div>
          {pdfError && <p className="text-sm text-error">{pdfError}</p>}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-text-light">または直接入力</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        </div>
      )}

      <Textarea
        label={isSelfPr ? "経歴・強み・実績" : "職務経歴書テキスト *"}
        hint={isSelfPr ? "あなたの経歴、強み、実績などを自由に入力してください（任意）" : "PDFアップロード後に自動入力されます。手動で編集も可能です（最低50文字）"}
        value={input.resumeText}
        onChange={(e) => onUpdate({ resumeText: e.target.value })}
        placeholder={isSelfPr ? "例：IT業界で15年の営業経験。法人営業チーム12名のマネージャー。年間売上3.2億円を達成..." : "例：\n【職務要約】\n法人営業15年。IT業界で年間売上3.2億円を達成し..."}
        className="min-h-[300px]"
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-text-main">求人票（任意）</label>
        <p className="text-xs text-text-light">求人票のPDFまたはURLから内容を読み取り、補足情報に追加します</p>

        <div
          className={"border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer hover:border-gold hover:bg-gold/5 " + (jobPdfFileName ? "border-gold bg-gold/5" : "border-gray-300")}
          onClick={() => jobFileInputRef.current?.click()}
        >
          <input ref={jobFileInputRef} type="file" accept=".pdf" onChange={handleJobPdfUpload} className="hidden" />
          {jobPdfUploading ? (
            <div className="flex items-center justify-center gap-2">
              <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
              <span className="text-sm text-text-light">求人票PDF読み取り中...</span>
            </div>
          ) : jobPdfFileName ? (
            <div>
              <div className="text-2xl mb-1">{"✅"}</div>
              <p className="text-sm font-medium text-navy">{jobPdfFileName}</p>
              <p className="text-xs text-text-light mt-1">クリックして別のファイルをアップロード</p>
            </div>
          ) : (
            <div>
              <div className="text-2xl mb-1">{"📄"}</div>
              <p className="text-sm font-medium text-text-main">求人票PDFをアップロード</p>
              <p className="text-xs text-text-light mt-1">PDF形式・10MB以下</p>
            </div>
          )}
        </div>
        {jobPdfError && <p className="text-sm text-error">{jobPdfError}</p>}

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-text-light">またはURL入力</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="flex gap-2">
          <input type="url" value={jobUrl} onChange={(e) => { setJobUrl(e.target.value); setScrapeError(""); }} placeholder="https://..." className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all" />
          <Button variant="secondary" onClick={handleScrape} disabled={!jobUrl.trim() || scraping}>{scraping ? "読込中..." : "読み込む"}</Button>
        </div>
        {scrapeError && <p className="text-sm text-error">{scrapeError}</p>}
      </div>

      <Textarea
        label="補足情報（任意）"
        hint="応募先の企業情報、求人内容、アピールしたいポイントなどを入力してください"
        value={input.extraInfo}
        onChange={(e) => onUpdate({ extraInfo: e.target.value })}
        placeholder="例：応募先は従業員500名のSaaS企業。求められているのはチームマネジメント経験..."
        className="min-h-[120px]"
      />

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>← 戻る</Button>
        <Button onClick={onSubmit} disabled={!isValid} size="lg">AIに送信 →</Button>
      </div>
    </div>
  );
}
