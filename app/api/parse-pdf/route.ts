export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json(
        { success: false, error: "ファイルが選択されていません" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        { success: false, error: "PDFファイルのみ対応しています" },
        { status: 400 }
      );
    }

    // 10MB制限
    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        { success: false, error: "ファイルサイズは10MB以下にしてください" },
        { status: 400 }
      );
    }

    // Import pdf-parse/lib directly to avoid the test file loading issue on Vercel
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse.js");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdfParse(buffer, {});

    let text = data.text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text) {
      return Response.json(
        {
          success: false,
          error:
            "PDFからテキストを抽出できませんでした。画像ベースのPDFは対応していません。",
        },
        { status: 200 }
      );
    }

    return Response.json({ success: true, text, pages: data.numpages });
  } catch (error) {
    console.error("PDF parse error:", error);
    return Response.json(
      {
        success: false,
        error: "PDFの読み取りに失敗しました。別のファイルをお試しください。",
      },
      { status: 200 }
    );
  }
}
