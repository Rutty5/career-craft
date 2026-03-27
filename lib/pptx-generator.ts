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
  grayBorder: "CBD5E0",
  tagOrange: "ED8936",
  tagGreen: "38A169",
  tagBlue: "3182CE",
  tagPurple: "805AD5",
  tagRed: "E53E3E",
  tagTeal: "319795",
};

const FONT = "Meiryo";
const SLIDE_W = 10;
const SLIDE_MAX_Y = 7.15; // スライド下端の余白を確保
const HEADER_H = 0.55;
const CL = 0.4;
const CW = SLIDE_W - CL * 2;

const INDUSTRY_COLORS: Record<string, string> = {
  "製造": C.tagOrange, "IT": C.tagBlue, "IT運用": C.tagBlue,
  "小売": C.tagGreen, "介護": C.tagPurple, "金融": C.tagRed,
  "医療": C.tagPurple, "コンサル": C.tagTeal, "教育": C.tagGreen,
  "サービス": C.tagOrange, "不動産": C.tagRed, "広告": C.tagTeal,
};

function getIndustryColor(industry: string): string {
  for (const [key, color] of Object.entries(INDUSTRY_COLORS)) {
    if (industry.includes(key)) return color;
  }
  return C.navyLight;
}

export async function generatePptx(data: PresentationData): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "キャリアクラフト";
  pptx.subject = "職務経歴プレゼンシート";

  renderCoverSlide(pptx, data);
  for (const slideData of data.slides) {
    renderContentSlide(pptx, slideData);
  }

  await pptx.writeFile({
    fileName: "プレゼンシート_" + (data.coverSubtitle || "職務経歴") + ".pptx",
  });
}

function renderCoverSlide(pptx: PptxGenJS, data: PresentationData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.navy };

  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 1.8, w: SLIDE_W, h: 0.04, fill: { color: C.gold } });

  slide.addText(data.coverTitle || "職務経歴プレゼンテーション", {
    x: 0.5, y: 2.1, w: 9, h: 1.0,
    fontSize: 32, fontFace: FONT, color: C.white, bold: true, align: "center",
  });

  slide.addText(data.coverSubtitle || "", {
    x: 0.5, y: 3.2, w: 9, h: 0.6,
    fontSize: 20, fontFace: FONT, color: C.gold, align: "center",
  });

  const now = new Date();
  const dateStr = now.getFullYear() + "年" + (now.getMonth() + 1) + "月";
  slide.addText(dateStr, {
    x: 0.5, y: 4.0, w: 9, h: 0.4,
    fontSize: 12, fontFace: FONT, color: C.textLight, align: "center",
  });

  slide.addShape(pptx.ShapeType.rect, { x: 3.0, y: 4.6, w: 4.0, h: 0.03, fill: { color: C.gold } });
}

// スライドヘッダーバーを描画する共通関数
function addSlideHeader(pptx: PptxGenJS, slide: PptxGenJS.Slide, title: string) {
  slide.background = { color: C.warmBg };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: SLIDE_W, h: HEADER_H, fill: { color: C.navy } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: HEADER_H, w: SLIDE_W, h: 0.03, fill: { color: C.gold } });
  slide.addText(title, {
    x: CL, y: 0.06, w: CW, h: 0.44,
    fontSize: 16, fontFace: FONT, color: C.white, bold: true,
  });
}

function renderContentSlide(pptx: PptxGenJS, slideData: SlideData) {
  const slide = pptx.addSlide();
  addSlideHeader(pptx, slide, slideData.title);

  let currentY = HEADER_H + 0.15;

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: CL, y: currentY, w: CW, h: 0.28,
      fontSize: 10, fontFace: FONT, color: C.text, italic: true,
    });
    currentY += 0.3;
  }

  for (const element of slideData.elements) {
    currentY = renderElement(pptx, slide, element, currentY);
    currentY += 0.06;
  }
}

function renderElement(
  pptx: PptxGenJS, slide: PptxGenJS.Slide, element: SlideElement, y: number
): number {
  switch (element.type) {
    case "metric": return renderMetrics(pptx, slide, element, y);
    case "companyCard": return renderCompanyCards(pptx, slide, element, y);
    case "skillTransfer": return renderSkillTransfers(pptx, slide, element, y);
    case "careerVision": return renderCareerVision(pptx, slide, element, y);
    case "subtitle":
      slide.addText(element.text || "", {
        x: CL, y, w: CW, h: 0.28,
        fontSize: 11, fontFace: FONT, color: C.navyLight, bold: true,
      });
      return y + 0.28;
    case "text":
      slide.addText(element.text || "", {
        x: CL, y, w: CW, h: 0.26,
        fontSize: 9, fontFace: FONT, color: C.text,
      });
      return y + 0.26;
    case "bulletList": return renderBulletList(slide, element, y);
    case "skillBars": return renderSkillBars(pptx, slide, element, y);
    case "iconGrid": return renderIconGrid(pptx, slide, element, y);
    case "timeline": return renderTimeline(pptx, slide, element, y);
    case "twoColumn": return renderTwoColumn(pptx, slide, element, y);
    default: return y;
  }
}

function renderMetrics(pptx: PptxGenJS, slide: PptxGenJS.Slide, el: SlideElement, y: number): number {
  const metrics = el.metrics || [];
  if (metrics.length === 0) return y;
  const count = Math.min(metrics.length, 4);
  const itemW = CW / count;
  const pad = 0.06;

  for (let i = 0; i < count; i++) {
    const m = metrics[i];
    const cx = CL + i * itemW + pad;
    const cw = itemW - pad * 2;

    slide.addShape(pptx.ShapeType.roundRect, {
      x: cx, y, w: cw, h: 0.58,
      fill: { color: C.white }, line: { color: C.grayBorder, width: 0.5 }, rectRadius: 0.04,
    });
    slide.addText(m.value, {
      x: cx, y: y + 0.03, w: cw, h: 0.3,
      fontSize: 17, fontFace: FONT, color: C.navy, bold: true, align: "center",
    });
    slide.addText(m.label, {
      x: cx + 0.04, y: y + 0.32, w: cw - 0.08, h: 0.2,
      fontSize: 7, fontFace: FONT, color: C.textLight, align: "center",
    });
  }
  return y + 0.64;
}

// テーブルヘッダーを描画
function renderTableHeader(
  pptx: PptxGenJS, slide: PptxGenJS.Slide,
  y: number, colW1: number, colW2: number, colW3: number
): number {
  slide.addShape(pptx.ShapeType.rect, { x: CL, y, w: CW, h: 0.24, fill: { color: C.navy } });
  slide.addText("業界・規模", {
    x: CL, y, w: colW1, h: 0.24,
    fontSize: 7, fontFace: FONT, color: C.white, bold: true, align: "center", valign: "middle",
  });
  slide.addText("具体的な行動と実績", {
    x: CL + colW1, y, w: colW2, h: 0.24,
    fontSize: 7, fontFace: FONT, color: C.white, bold: true, align: "center", valign: "middle",
  });
  slide.addText("身につけた能力（採用メリット）", {
    x: CL + colW1 + colW2, y, w: colW3, h: 0.24,
    fontSize: 7, fontFace: FONT, color: C.white, bold: true, align: "center", valign: "middle",
  });
  return y + 0.24;
}

function renderCompanyCards(pptx: PptxGenJS, slide: PptxGenJS.Slide, el: SlideElement, y: number): number {
  const cards = el.companyCards || [];
  if (cards.length === 0) return y;

  const colW1 = 1.7;
  const colW2 = 3.8;
  const colW3 = CW - colW1 - colW2;

  let currentSlide = slide;
  let rowY = renderTableHeader(pptx, currentSlide, y, colW1, colW2, colW3);

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const achCount = card.achievements?.length || 1;
    // 各実績行: fontSize 7 + lineSpacing 13 ≒ 0.17インチ/行
    const rowH = Math.max(0.72, achCount * 0.18 + 0.36);

    // スライド溢れチェック → 新スライドに分割
    if (rowY + rowH > SLIDE_MAX_Y && i > 0) {
      currentSlide = pptx.addSlide();
      addSlideHeader(pptx, currentSlide, "経歴サマリー＋職務実績（続き）");
      rowY = HEADER_H + 0.15;
      rowY = renderTableHeader(pptx, currentSlide, rowY, colW1, colW2, colW3);
    }

    const bgColor = i % 2 === 0 ? C.white : C.grayBg;

    currentSlide.addShape(pptx.ShapeType.rect, {
      x: CL, y: rowY, w: CW, h: rowH,
      fill: { color: bgColor }, line: { color: C.grayBorder, width: 0.3 },
    });

    // 業界タグ
    const tagColor = getIndustryColor(card.industry);
    const tagW = Math.min(card.industry.length * 0.14 + 0.16, 1.0);
    currentSlide.addShape(pptx.ShapeType.roundRect, {
      x: CL + 0.05, y: rowY + 0.04, w: tagW, h: 0.17,
      fill: { color: tagColor }, rectRadius: 0.03,
    });
    currentSlide.addText(card.industry, {
      x: CL + 0.05, y: rowY + 0.04, w: tagW, h: 0.17,
      fontSize: 6, fontFace: FONT, color: C.white, bold: true, align: "center", valign: "middle",
    });

    // 会社名
    currentSlide.addText(card.company, {
      x: CL + 0.05, y: rowY + 0.23, w: colW1 - 0.1, h: 0.15,
      fontSize: 8, fontFace: FONT, color: C.navy, bold: true,
    });
    currentSlide.addText(card.scale + " | " + card.period, {
      x: CL + 0.05, y: rowY + 0.37, w: colW1 - 0.1, h: 0.13,
      fontSize: 6, fontFace: FONT, color: C.textLight,
    });

    // 実績（各項目を個別行で確実に改行）
    const achRows = (card.achievements || []).map(function(ach) {
      return { text: ach, options: { breakLine: true, fontSize: 7, fontFace: FONT, color: C.text } };
    });
    currentSlide.addText(achRows as PptxGenJS.TextProps[], {
      x: CL + colW1 + 0.05, y: rowY + 0.04, w: colW2 - 0.1, h: rowH - 0.08,
      lineSpacing: 13, valign: "top",
    });

    // スキル見出し
    currentSlide.addText(card.acquiredSkill, {
      x: CL + colW1 + colW2 + 0.05, y: rowY + 0.04, w: colW3 - 0.1, h: 0.15,
      fontSize: 7.5, fontFace: FONT, color: C.navy, bold: true,
    });
    currentSlide.addText(card.skillDetail, {
      x: CL + colW1 + colW2 + 0.05, y: rowY + 0.19, w: colW3 - 0.1, h: Math.max(0.18, rowH - 0.44),
      fontSize: 6, fontFace: FONT, color: C.text, lineSpacing: 10, valign: "top",
    });

    // タグ
    let tagX = CL + colW1 + colW2 + 0.05;
    const tagY2 = rowY + rowH - 0.18;
    for (const tag of card.tags || []) {
      const tw = tag.length * 0.1 + 0.12;
      if (tagX + tw > CL + CW - 0.05) break; // はみ出し防止
      currentSlide.addShape(pptx.ShapeType.roundRect, {
        x: tagX, y: tagY2, w: tw, h: 0.15,
        fill: { color: C.warmBg }, line: { color: C.navyLight, width: 0.5 }, rectRadius: 0.03,
      });
      currentSlide.addText(tag, {
        x: tagX, y: tagY2, w: tw, h: 0.15,
        fontSize: 5.5, fontFace: FONT, color: C.navyLight, bold: true, align: "center", valign: "middle",
      });
      tagX += tw + 0.04;
    }

    rowY += rowH;
  }

  return rowY + 0.03;
}

function renderSkillTransfers(pptx: PptxGenJS, slide: PptxGenJS.Slide, el: SlideElement, y: number): number {
  const transfers = el.skillTransfers || [];
  if (transfers.length === 0) return y;

  const cols = 2;
  const cardW = (CW - 0.1) / cols;
  const cardH = 0.88;

  for (let i = 0; i < transfers.length; i++) {
    const t = transfers[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = CL + col * (cardW + 0.1);
    const cy = y + row * (cardH + 0.05);

    slide.addShape(pptx.ShapeType.roundRect, {
      x: cx, y: cy, w: cardW, h: cardH,
      fill: { color: C.white }, line: { color: C.grayBorder, width: 0.5 }, rectRadius: 0.05,
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: cx, y: cy + 0.05, w: 0.04, h: cardH - 0.1, fill: { color: C.gold },
    });

    slide.addText(t.icon + "  " + t.fromSkill + " → " + t.toSkill, {
      x: cx + 0.14, y: cy + 0.06, w: cardW - 0.2, h: 0.2,
      fontSize: 8.5, fontFace: FONT, color: C.navy, bold: true,
    });
    slide.addText(t.description, {
      x: cx + 0.14, y: cy + 0.28, w: cardW - 0.2, h: cardH - 0.34,
      fontSize: 7, fontFace: FONT, color: C.text, lineSpacing: 11, valign: "top",
    });
  }

  return y + Math.ceil(transfers.length / cols) * (cardH + 0.05);
}

function renderCareerVision(pptx: PptxGenJS, slide: PptxGenJS.Slide, el: SlideElement, y: number): number {
  const visions = el.careerVisions || [];
  const certs = el.certifications || [];

  if (certs.length > 0) {
    const certH = Math.max(0.46, certs.length * 0.15 + 0.24);
    slide.addShape(pptx.ShapeType.roundRect, {
      x: CL, y, w: CW, h: certH, fill: { color: C.navy }, rectRadius: 0.04,
    });
    slide.addText("定量実績・資格", {
      x: CL + 0.12, y: y + 0.03, w: 2.0, h: 0.16,
      fontSize: 8, fontFace: FONT, color: C.gold, bold: true,
    });
    const certText = certs.map(function(c) { return "✓  " + c; }).join("\n");
    slide.addText(certText, {
      x: CL + 0.12, y: y + 0.18, w: CW - 0.24, h: Math.max(0.22, certs.length * 0.13),
      fontSize: 7, fontFace: FONT, color: C.white, lineSpacing: 11,
    });
    y += certH + 0.06;
  }

  if (visions.length === 0) return y;

  const phaseColors: Record<string, string> = { "短期": C.tagBlue, "中期": C.tagGreen, "長期": C.tagOrange };

  for (let i = 0; i < visions.length; i++) {
    const v = visions[i];
    const vy = y + i * 0.48;
    const dotColor = phaseColors[v.phase] || C.navy;

    slide.addShape(pptx.ShapeType.ellipse, {
      x: CL + 0.08, y: vy + 0.04, w: 0.11, h: 0.11, fill: { color: dotColor },
    });
    if (i < visions.length - 1) {
      slide.addShape(pptx.ShapeType.rect, {
        x: CL + 0.12, y: vy + 0.15, w: 0.025, h: 0.33, fill: { color: C.grayBorder },
      });
    }
    slide.addText(v.phase + ": " + v.title, {
      x: CL + 0.28, y: vy + 0.01, w: CW - 0.36, h: 0.18,
      fontSize: 8.5, fontFace: FONT, color: C.navy, bold: true,
    });
    slide.addText(v.description, {
      x: CL + 0.28, y: vy + 0.18, w: CW - 0.36, h: 0.22,
      fontSize: 7, fontFace: FONT, color: C.text, lineSpacing: 10,
    });
  }

  return y + visions.length * 0.48;
}

// 既存要素レンダラー（互換性）
function renderBulletList(slide: PptxGenJS.Slide, el: SlideElement, y: number): number {
  const items = el.items || [];
  const textRows = items.map(function(item) {
    return { text: item, options: { bullet: { code: "2022" }, fontSize: 9, fontFace: FONT, color: C.text } };
  });
  const h = Math.max(0.3, items.length * 0.2);
  slide.addText(textRows as PptxGenJS.TextProps[], { x: CL, y, w: CW, h, lineSpacing: 16, valign: "top" });
  return y + h;
}

function renderSkillBars(pptx: PptxGenJS, slide: PptxGenJS.Slide, el: SlideElement, y: number): number {
  const skills = el.skills || [];
  if (skills.length === 0) return y;
  const barH = 0.18, gap = 0.1, labelW = 1.8, barMaxW = CW - labelW - 0.2;
  for (let i = 0; i < skills.length; i++) {
    const s = skills[i];
    const sy = y + i * (barH + gap);
    const lvl = Math.min(Math.max(s.level, 1), 5);
    slide.addText(s.name, { x: CL, y: sy, w: labelW, h: barH, fontSize: 9, fontFace: FONT, color: C.text, align: "right", valign: "middle" });
    slide.addShape(pptx.ShapeType.roundRect, { x: CL + labelW + 0.15, y: sy + 0.02, w: barMaxW, h: barH - 0.04, fill: { color: C.grayBg }, rectRadius: 0.03 });
    slide.addShape(pptx.ShapeType.roundRect, { x: CL + labelW + 0.15, y: sy + 0.02, w: (lvl / 5) * barMaxW, h: barH - 0.04, fill: { color: lvl >= 4 ? C.navy : C.navyLight }, rectRadius: 0.03 });
  }
  return y + skills.length * (barH + gap);
}

function renderIconGrid(pptx: PptxGenJS, slide: PptxGenJS.Slide, el: SlideElement, y: number): number {
  const items = el.gridItems || [];
  if (items.length === 0) return y;
  const cols = Math.min(items.length, 4), itemW = CW / cols, pad = 0.06;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const col = i % cols, row = Math.floor(i / cols);
    const cx = CL + col * itemW + pad, cy = y + row * 0.8, cw = itemW - pad * 2;
    slide.addShape(pptx.ShapeType.roundRect, { x: cx, y: cy, w: cw, h: 0.7, fill: { color: C.white }, rectRadius: 0.04 });
    slide.addText(it.icon, { x: cx, y: cy + 0.03, w: cw, h: 0.2, fontSize: 16, align: "center" });
    slide.addText(it.label, { x: cx + 0.04, y: cy + 0.24, w: cw - 0.08, h: 0.18, fontSize: 9, fontFace: FONT, color: C.navy, bold: true, align: "center" });
    slide.addText(it.description, { x: cx + 0.04, y: cy + 0.42, w: cw - 0.08, h: 0.24, fontSize: 7, fontFace: FONT, color: C.textLight, align: "center" });
  }
  return y + Math.ceil(items.length / cols) * 0.8;
}

function renderTimeline(pptx: PptxGenJS, slide: PptxGenJS.Slide, el: SlideElement, y: number): number {
  const entries = el.timeline || [];
  if (entries.length === 0) return y;
  const eH = 0.5, lx = CL + 0.15;
  slide.addShape(pptx.ShapeType.rect, { x: lx - 0.012, y: y + 0.04, w: 0.025, h: (entries.length - 1) * eH + 0.04, fill: { color: C.gold } });
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i], ey = y + i * eH;
    slide.addShape(pptx.ShapeType.ellipse, { x: lx - 0.04, y: ey, w: 0.08, h: 0.08, fill: { color: C.navy } });
    slide.addText(e.period, { x: lx + 0.15, y: ey - 0.03, w: 2.0, h: 0.16, fontSize: 7, fontFace: FONT, color: C.textLight });
    slide.addText(e.company + "　" + e.role, { x: lx + 0.15, y: ey + 0.1, w: CW - 0.4, h: 0.16, fontSize: 9, fontFace: FONT, color: C.navy, bold: true });
    slide.addText(e.highlight, { x: lx + 0.15, y: ey + 0.25, w: CW - 0.4, h: 0.16, fontSize: 7.5, fontFace: FONT, color: C.text });
  }
  return y + entries.length * eH;
}

function renderTwoColumn(pptx: PptxGenJS, slide: PptxGenJS.Slide, el: SlideElement, y: number): number {
  let ly = y, ry = y;
  if (el.left) ly = renderElement(pptx, slide, el.left, y);
  if (el.right) ry = renderElement(pptx, slide, el.right, y);
  return Math.max(ly, ry);
}
