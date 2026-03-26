import * as cheerio from "cheerio";

function isPrivateIP(hostname: string): boolean {
  const privatePatterns = [
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^127\./,
    /^0\./,
    /^localhost$/i,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
  ];
  return privatePatterns.some((p) => p.test(hostname));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return Response.json(
        { success: false, error: "URLを入力してください" },
        { status: 400 }
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return Response.json(
        { success: false, error: "有効なURLを入力してください" },
        { status: 400 }
      );
    }

    if (!parsed.protocol.startsWith("https")) {
      return Response.json(
        { success: false, error: "HTTPSのURLを入力してください" },
        { status: 400 }
      );
    }

    if (isPrivateIP(parsed.hostname)) {
      return Response.json(
        { success: false, error: "このURLにはアクセスできません" },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CareerCraft/1.0; +https://careercraft.app)",
      },
    });

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          error: `ページの取得に失敗しました (${response.status})`,
        },
        { status: 200 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 不要要素を除去
    $("script, style, nav, footer, header, aside, iframe, noscript").remove();

    // 本文テキストを取得
    let text = "";
    const selectors = ["main", "article", '[role="main"]', ".content", "body"];
    for (const sel of selectors) {
      const el = $(sel);
      if (el.length > 0) {
        text = el.text();
        break;
      }
    }

    // 整形
    text = text
      .replace(/[\t]+/g, " ")
      .replace(/ {2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text) {
      return Response.json(
        {
          success: false,
          error: "ページからテキストを取得できませんでした",
        },
        { status: 200 }
      );
    }

    // 3000文字でトリミング
    if (text.length > 3000) {
      text = text.substring(0, 3000) + "...（以下省略）";
    }

    return Response.json({ success: true, text });
  } catch (error) {
    console.error("Scrape error:", error);
    return Response.json(
      {
        success: false,
        error: "読み込めませんでした。手動で貼り付けてください。",
      },
      { status: 200 }
    );
  }
}
