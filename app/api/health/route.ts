export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const hasKey = !!apiKey && apiKey !== "your-key-here";
  const keyPrefix = apiKey ? apiKey.slice(0, 10) + "..." : "未設定";

  // Test Anthropic API connection
  if (hasKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 10,
          messages: [{ role: "user", content: "Hi" }],
        }),
      });

      const body = await res.text();
      return Response.json({
        status: "テスト完了",
        keySet: true,
        keyPrefix,
        apiStatus: res.status,
        apiResponse: body.slice(0, 300),
      });
    } catch (err) {
      return Response.json({
        status: "API接続エラー",
        keySet: true,
        keyPrefix,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return Response.json({
    status: "APIキー未設定",
    keySet: false,
    keyPrefix,
  });
}
