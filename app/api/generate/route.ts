import { buildSystemPrompt, buildUserMessage } from "@/lib/prompt-builder";
import type { GenerateRequest } from "@/lib/types";

export async function POST(request: Request) {
  // Top-level defensive try-catch to prevent function crashes
  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "リクエストの解析に失敗しました" },
      { status: 400 }
    );
  }

  const { settings, input } = body;

  if (!settings || !input || !input.resumeText) {
    return Response.json(
      { error: "必須フィールドが不足しています" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    return Response.json(
      { error: "APIキーが設定されていません。Vercelの環境変数を確認してください。" },
      { status: 401 }
    );
  }

  const systemPrompt = buildSystemPrompt(settings, settings.mode);
  const userMessage = buildUserMessage(
    settings.mode,
    input.resumeText,
    input.extraInfo
  );

  // Use raw fetch to Anthropic API instead of SDK to avoid potential module issues
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
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        }),
      }
    );

    if (!anthropicResponse.ok) {
      const errBody = await anthropicResponse.text();
      console.error("Anthropic API error:", anthropicResponse.status, errBody);

      if (anthropicResponse.status === 401) {
        return Response.json(
          { error: "APIキーが無効です。正しいキーを設定してください。" },
          { status: 401 }
        );
      }
      if (anthropicResponse.status === 429) {
        return Response.json(
          { error: "リクエスト制限に達しました。しばらくお待ちください。" },
          { status: 429 }
        );
      }
      if (anthropicResponse.status === 404) {
        return Response.json(
          { error: "指定されたモデルが利用できません。" },
          { status: 404 }
        );
      }

      return Response.json(
        { error: `Anthropic APIエラー (${anthropicResponse.status}): ${errBody.slice(0, 200)}` },
        { status: 500 }
      );
    }

    const data = await anthropicResponse.json();
    const text = data.content
      ?.filter((block: { type: string }) => block.type === "text")
      .map((block: { text: string }) => block.text)
      .join("") || "";

    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Generate fetch error:", errMsg);
    return Response.json(
      { error: `通信エラー: ${errMsg}` },
      { status: 500 }
    );
  }
}
