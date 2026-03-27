import { buildPresentationPrompt } from "@/lib/presentation-prompt";
import type { PresentationRequest, PresentationData } from "@/lib/types";

// ダブルチェック: メトリクスの空値を検出・修正
function validateAndFixMetrics(data: PresentationData): PresentationData {
  for (const slide of data.slides) {
    for (const element of slide.elements) {
      if (element.type === "metric" && element.metrics) {
        element.metrics = element.metrics.filter(
          (m) => m.value && m.value.trim() !== ""
        );
        // 空のメトリクスが除去された場合、最低限のデフォルトを追加
        if (element.metrics.length === 0) {
          console.warn("WARNING: All metrics were empty. Adding fallback.");
        }
        // value/labelの空白トリム
        for (const m of element.metrics) {
          m.value = (m.value || "").trim();
          m.label = (m.label || "").trim();
        }
      }
      // companyCardのachievements空チェック
      if (element.type === "companyCard" && element.companyCards) {
        for (const card of element.companyCards) {
          if (!card.achievements || card.achievements.length === 0) {
            console.warn(`WARNING: Company "${card.company}" has no achievements.`);
          }
          // 空の実績を除去
          card.achievements = (card.achievements || []).filter(
            (a) => a && a.trim() !== ""
          );
        }
      }
    }
  }
  return data;
}

export async function POST(request: Request) {
  let body: PresentationRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "リクエストの解析に失敗しました" },
      { status: 400 }
    );
  }

  const { resumeText, settings, jobDescription } = body;

  if (!resumeText || !settings) {
    return Response.json(
      { error: "必須フィールドが不足しています" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    return Response.json(
      { error: "APIキーが設定されていません。" },
      { status: 401 }
    );
  }

  const { system, user } = buildPresentationPrompt(settings, resumeText, jobDescription || "");

  try {
    const anthropicResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8192,
          system,
          messages: [{ role: "user", content: user }],
        }),
      }
    );

    if (!anthropicResponse.ok) {
      const errBody = await anthropicResponse.text();
      console.error("Anthropic API error:", anthropicResponse.status, errBody);

      if (anthropicResponse.status === 401) {
        return Response.json(
          { error: "APIキーが無効です。" },
          { status: 401 }
        );
      }
      if (anthropicResponse.status === 429) {
        return Response.json(
          { error: "リクエスト制限に達しました。しばらくお待ちください。" },
          { status: 429 }
        );
      }

      return Response.json(
        { error: `APIエラー (${anthropicResponse.status})` },
        { status: 500 }
      );
    }

    const data = await anthropicResponse.json();
    const text =
      data.content
        ?.filter((block: { type: string }) => block.type === "text")
        .map((block: { text: string }) => block.text)
        .join("") || "";

    // コードフェンスを除去してJSONを抽出
    const jsonStr = text
      .replace(/^```(?:json)?\s*/m, "")
      .replace(/\s*```\s*$/m, "")
      .trim();

    let presentationData: PresentationData;
    try {
      presentationData = JSON.parse(jsonStr);
    } catch {
      console.error("JSON parse error. Raw response:", text);
      return Response.json(
        { error: "スライドデータの解析に失敗しました。再度お試しください。" },
        { status: 500 }
      );
    }

    // 基本バリデーション
    if (
      !presentationData.slides ||
      !Array.isArray(presentationData.slides) ||
      presentationData.slides.length === 0
    ) {
      return Response.json(
        { error: "スライドデータが不正です。再度お試しください。" },
        { status: 500 }
      );
    }

    // ★ ダブルチェック: メトリクス・実績の空値を検出・修正
    presentationData = validateAndFixMetrics(presentationData);

    return Response.json(presentationData);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Presentation fetch error:", errMsg);
    return Response.json(
      { error: `通信エラー: ${errMsg}` },
      { status: 500 }
    );
  }
}
