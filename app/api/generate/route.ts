import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserMessage } from "@/lib/prompt-builder";
import type { GenerateRequest } from "@/lib/types";

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
        { error: "APIキーが設定されていません" },
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

    const stream = client.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Generate API error:", error);

    if (error instanceof Anthropic.RateLimitError) {
      return Response.json(
        { error: "リクエスト制限に達しました。しばらくお待ちください。" },
        { status: 429 }
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
