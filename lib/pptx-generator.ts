import PptxGenJS from "pptxgenjs";
import type {
  PresentationData,
  SlideData,
  SlideElement,
} from "./types";

// Career Craft ブランドカラー
const C = {
  navy: "1A365D",
  navyLight: "2C5282",
  gold: "C7924E",
  goldLight: "E8C88A",
  warmBg: "F8F5F0",
  white: "FFFFFF",
  text: "2D3748",
  textLight: "718096",
  grayBg: "EDF2F7",
};

const FONT = "Meiryo";
const SLIDE_W = 10; // inches (16:9)
const CONTENT_LEFT = 0.6;
const CONTENT_RIGHT = 0.6;
const CONTENT_W = SLIDE_W - CONTENT_LEFT - CONTENT_RIGHT;
const HEADER_H = 0.65;

export async function generatePptx(data: PresentationData): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "キャリアクラフト";
  pptx.subject = "職務経歴プレゼンシート";

  // カバースライド
  renderCoverSlide(pptx, data);

  // コンテンツスライド
  for (const slideData of data.slides) {
    renderContentSlide(pptx, slideData);
  }

  await pptx.writeFile({
    fileName: `プレゼンシート_${data.coverSubtitle || "職務経歴"}.pptx`,
  });
}

function renderCoverSlide(pptx: PptxGenJS, data: PresentationData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.navy };

  // ゴールドアクセントライン（上部）
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 1.8,
    w: SLIDE_W,
    h: 0.04,
    fill: { color: C.gold },
  });

  // タイトル
  slide.addText(data.coverTitle || "職務経歴プレゼンテーション", {
    x: 0.5,
    y: 2.1,
    w: 9,
    h: 1.0,
    fontSize: 32,
    fontFace: FONT,
    color: C.white,
    bold: true,
    align: "center",
  });

  // 名前
  slide.addText(data.coverSubtitle || "", {
    x: 0.5,
    y: 3.2,
    w: 9,
    h: 0.6,
    fontSize: 20,
    fontFace: FONT,
    color: C.gold,
    align: "center",
  });

  // 日付
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月`;
  slide.addText(dateStr, {
    x: 0.5,
    y: 4.0,
    w: 9,
    h: 0.4,
    fontSize: 12,
    fontFace: FONT,
    color: C.textLight,
    align: "center",
  });

  // ゴールドアクセントライン（下部）
  slide.addShape(pptx.ShapeType.rect, {
    x: 3.0,
    y: 4.6,
    w: 4.0,
    h: 0.03,
    fill: { color: C.gold },
  });

  // フッター
  slide.addText("Powered by キャリアクラフト", {
    x: 0.5,
    y: 5.1,
    w: 9,
    h: 0.3,
    fontSize: 9,
    fontFace: FONT,
    color: C.textLight,
    align: "center",
  });
}

function renderContentSlide(pptx: PptxGenJS, slideData: SlideData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.warmBg };

  // ヘッダーバー
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: HEADER_H,
    fill: { color: C.navy },
  });

  // ゴールドアクセント
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: HEADER_H,
    w: SLIDE_W,
    h: 0.035,
    fill: { color: C.gold },
  });

  // スライドタイトル
  slide.addText(slideData.title, {
    x: CONTENT_LEFT,
    y: 0.08,
    w: CONTENT_W,
    h: 0.5,
    fontSize: 18,
    fontFace: FONT,
    color: C.white,
    bold: true,
  });

  // 要素をレンダリング
  let currentY = HEADER_H + 0.3;

  for (const element of slideData.elements) {
    currentY = renderElement(pptx, slide, element, currentY, CONTENT_LEFT, CONTENT_W);
    currentY += 0.15; // 要素間のスペース
  }

  // フッター
  slide.addText("キャリアクラフト", {
    x: CONTENT_LEFT,
    y: 5.2,
    w: CONTENT_W,
    h: 0.25,
    fontSize: 8,
    fontFace: FONT,
    color: C.textLight,
  });
}

function renderElement(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  element: SlideElement,
  y: number,
  x: number,
  w: number
): number {
  switch (element.type) {
    case "title":
      return renderTitle(slide, element, y, x, w);
    case "subtitle":
      return renderSubtitle(slide, element, y, x, w);
    case "text":
      return renderText(slide, element, y, x, w);
    case "bulletList":
      return renderBulletList(slide, element, y, x, w);
    case "metric":
      return renderMetrics(pptx, slide, element, y, x, w);
    case "timeline":
      return renderTimeline(pptx, slide, element, y, x, w);
    case "skillBars":
      return renderSkillBars(pptx, slide, element, y, x, w);
    case "iconGrid":
      return renderIconGrid(pptx, slide, element, y, x, w);
    case "twoColumn":
      return renderTwoColumn(pptx, slide, element, y, x, w);
    default:
      return y;
  }
}

function renderTitle(
  slide: PptxGenJS.Slide,
  el: SlideElement,
  y: number,
  x: number,
  w: number
): number {
  slide.addText(el.text || "", {
    x,
    y,
    w,
    h: 0.45,
    fontSize: 16,
    fontFace: FONT,
    color: C.navy,
    bold: true,
  });
  return y + 0.45;
}

function renderSubtitle(
  slide: PptxGenJS.Slide,
  el: SlideElement,
  y: number,
  x: number,
  w: number
): number {
  slide.addText(el.text || "", {
    x,
    y,
    w,
    h: 0.35,
    fontSize: 13,
    fontFace: FONT,
    color: C.navyLight,
    bold: true,
  });
  return y + 0.35;
}

function renderText(
  slide: PptxGenJS.Slide,
  el: SlideElement,
  y: number,
  x: number,
  w: number
): number {
  const lines = Math.ceil((el.text || "").length / 50);
  const h = Math.max(0.35, lines * 0.25);
  slide.addText(el.text || "", {
    x,
    y,
    w,
    h,
    fontSize: 11,
    fontFace: FONT,
    color: C.text,
    lineSpacing: 18,
  });
  return y + h;
}

function renderBulletList(
  slide: PptxGenJS.Slide,
  el: SlideElement,
  y: number,
  x: number,
  w: number
): number {
  const items = el.items || [];
  const textRows = items.map((item) => ({
    text: item,
    options: {
      bullet: { code: "2022" }, // bullet character
      fontSize: 11,
      fontFace: FONT,
      color: C.text,
    },
  }));

  const h = Math.max(0.4, items.length * 0.28);
  slide.addText(textRows as PptxGenJS.TextProps[], {
    x,
    y,
    w,
    h,
    lineSpacing: 20,
    valign: "top",
  });
  return y + h;
}

function renderMetrics(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  el: SlideElement,
  y: number,
  x: number,
  w: number
): number {
  const metrics = el.metrics || [];
  if (metrics.length === 0) return y;

  const count = Math.min(metrics.length, 4);
  const itemW = w / count;
  const cardPad = 0.1;

  for (let i = 0; i < count; i++) {
    const m = metrics[i];
    const cardX = x + i * itemW + cardPad;
    const cardW = itemW - cardPad * 2;

    // カード背景
    slide.addShape(pptx.ShapeType.roundRect, {
      x: cardX,
      y,
      w: cardW,
      h: 0.85,
      fill: { color: C.white },
      rectRadius: 0.05,
      shadow: {
        type: "outer",
        blur: 3,
        offset: 1,
        color: "000000",
        opacity: 0.1,
      },
    });

    // 数値（ゴールド）
    slide.addText(m.value, {
      x: cardX,
      y: y + 0.08,
      w: cardW,
      h: 0.42,
      fontSize: 22,
      fontFace: FONT,
      color: C.gold,
      bold: true,
      align: "center",
    });

    // ラベル
    slide.addText(m.label, {
      x: cardX,
      y: y + 0.48,
      w: cardW,
      h: 0.3,
      fontSize: 9,
      fontFace: FONT,
      color: C.textLight,
      align: "center",
    });
  }

  return y + 0.95;
}

function renderTimeline(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  el: SlideElement,
  y: number,
  x: number,
  w: number
): number {
  const entries = el.timeline || [];
  if (entries.length === 0) return y;

  const entryH = 0.65;
  const dotR = 0.06;
  const lineX = x + 0.15;

  // 縦線
  slide.addShape(pptx.ShapeType.rect, {
    x: lineX - 0.015,
    y: y + dotR,
    w: 0.03,
    h: (entries.length - 1) * entryH + dotR * 2,
    fill: { color: C.gold },
  });

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const ey = y + i * entryH;

    // ドット
    slide.addShape(pptx.ShapeType.ellipse, {
      x: lineX - dotR,
      y: ey,
      w: dotR * 2,
      h: dotR * 2,
      fill: { color: C.navy },
    });

    // 期間
    slide.addText(entry.period, {
      x: lineX + 0.25,
      y: ey - 0.05,
      w: 2.0,
      h: 0.22,
      fontSize: 8,
      fontFace: FONT,
      color: C.textLight,
    });

    // 会社・役職
    slide.addText(`${entry.company}　${entry.role}`, {
      x: lineX + 0.25,
      y: ey + 0.13,
      w: w - 0.5,
      h: 0.22,
      fontSize: 11,
      fontFace: FONT,
      color: C.navy,
      bold: true,
    });

    // ハイライト
    slide.addText(entry.highlight, {
      x: lineX + 0.25,
      y: ey + 0.33,
      w: w - 0.5,
      h: 0.22,
      fontSize: 9,
      fontFace: FONT,
      color: C.text,
    });
  }

  return y + entries.length * entryH + 0.1;
}

function renderSkillBars(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  el: SlideElement,
  y: number,
  x: number,
  w: number
): number {
  const skills = el.skills || [];
  if (skills.length === 0) return y;

  const barH = 0.2;
  const gap = 0.12;
  const labelW = 2.0;
  const barMaxW = w - labelW - 0.2;

  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i];
    const sy = y + i * (barH + gap);
    const level = Math.min(Math.max(skill.level, 1), 5);
    const fillW = (level / 5) * barMaxW;

    // ラベル
    slide.addText(skill.name, {
      x,
      y: sy,
      w: labelW,
      h: barH,
      fontSize: 10,
      fontFace: FONT,
      color: C.text,
      align: "right",
      valign: "middle",
    });

    // バー背景
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + labelW + 0.15,
      y: sy + 0.02,
      w: barMaxW,
      h: barH - 0.04,
      fill: { color: C.grayBg },
      rectRadius: 0.03,
    });

    // バー（ネイビーグラデ風）
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + labelW + 0.15,
      y: sy + 0.02,
      w: fillW,
      h: barH - 0.04,
      fill: { color: level >= 4 ? C.navy : C.navyLight },
      rectRadius: 0.03,
    });
  }

  return y + skills.length * (barH + gap);
}

function renderIconGrid(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  el: SlideElement,
  y: number,
  x: number,
  w: number
): number {
  const items = el.gridItems || [];
  if (items.length === 0) return y;

  const cols = Math.min(items.length, 4);
  const itemW = w / cols;
  const cardPad = 0.08;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cardX = x + col * itemW + cardPad;
    const cardY = y + row * 1.1;
    const cardW = itemW - cardPad * 2;

    // カード背景
    slide.addShape(pptx.ShapeType.roundRect, {
      x: cardX,
      y: cardY,
      w: cardW,
      h: 0.95,
      fill: { color: C.white },
      rectRadius: 0.05,
      shadow: {
        type: "outer",
        blur: 2,
        offset: 1,
        color: "000000",
        opacity: 0.08,
      },
    });

    // 絵文字アイコン
    slide.addText(item.icon, {
      x: cardX,
      y: cardY + 0.05,
      w: cardW,
      h: 0.3,
      fontSize: 20,
      align: "center",
    });

    // ラベル
    slide.addText(item.label, {
      x: cardX + 0.08,
      y: cardY + 0.35,
      w: cardW - 0.16,
      h: 0.25,
      fontSize: 10,
      fontFace: FONT,
      color: C.navy,
      bold: true,
      align: "center",
    });

    // 説明
    slide.addText(item.description, {
      x: cardX + 0.08,
      y: cardY + 0.58,
      w: cardW - 0.16,
      h: 0.3,
      fontSize: 8,
      fontFace: FONT,
      color: C.textLight,
      align: "center",
    });
  }

  const rows = Math.ceil(items.length / cols);
  return y + rows * 1.1;
}

function renderTwoColumn(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  el: SlideElement,
  y: number,
  x: number,
  w: number
): number {
  const halfW = (w - 0.3) / 2;
  let leftEndY = y;
  let rightEndY = y;

  if (el.left) {
    leftEndY = renderElement(pptx, slide, el.left, y, x, halfW);
  }
  if (el.right) {
    rightEndY = renderElement(pptx, slide, el.right, y, x + halfW + 0.3, halfW);
  }

  return Math.max(leftEndY, rightEndY);
}
