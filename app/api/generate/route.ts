import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserMessage } from "@/lib/prompt-builder";
import type { GenerateRequest } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
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

    const client = new Anthropic({ apiKey });
    const systemPrompt = buildSystemPrompt(settings, settings.mode);
    const userMessage = buildUserMessage(
      settings.mode,
      input.resumeText,
      input.extraInfo
    );

    // Use non-streaming call to properly catch API errors
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Generate API error:", error);

    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: "APIキーが無効です。正しいキーを設定してください。" },
        { status: 401 }
      );
    }

    if (error instanceof Anthropic.RateLimitError) {
      return Response.json(
        { error: "リクエスト制限に達しました。しばらくお待ちください。" },
        { status: 429 }
      );
    }

    if (error instanceof Anthropic.NotFoundError) {
      return Response.json(
        { error: "指定されたモデルが利用できません。" },
        { status: 404 }
      );
    }

    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Generate API error detail:", errMsg);
    return Response.json(
      { error: `サーバーエラー: ${errMsg}` },
      { status: 500 }
    );
  }
}
