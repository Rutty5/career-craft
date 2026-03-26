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

function renderContentSlide(pptx: PptxGenJS, slideData: SlideData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.warmBg };

  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: SLIDE_W, h: HEADER_H, fill: { color: C.navy } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: HEADER_H, w: SLIDE_W, h: 0.03, fill: { color: C.gold } });

  slide.addText(slideData.title, {
    x: CL, y: 0.06, w: CW, h: 0.44,
    fontSize: 16, fontFace: FONT, color: C.white, bold: true,
  });

  let currentY = HEADER_H + 0.15;

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: CL, y: currentY, w: CW, h: 0.3,
      fontSize: 10, fontFace: FONT, color: C.text, italic: true,
    });
    currentY += 0.32;
  }

  for (const element of slideData.elements) {
    currentY = renderElement(pptx, slide, element, currentY);
    currentY += 0.08;
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
        x: CL, y, w: CW, h: 0.3,
        fontSize: 11, fontFace: FONT, color: C.navyLight, bold: true,
      });
      return y + 0.3;
    case "text":
      slide.addText(element.text || "", {
        x: CL, y, w: CW, h: 0.3,
        fontSize: 9, fontFace: FONT, color: C.text,
      });
      return y + 0.3;
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
      x: cx, y, w: cw, h: 0.62,
      fill: { color: C.white }, line: { color: C.grayBorder, width: 0.5 }, rectRadius: 0.04,
    });
    slide.addText(m.value, {
      x: cx, y: y + 0.04, w: cw, h: 0.32,
      fontSize: 18, fontFace: FONT, color: C.navy, bold: true, align: "center",
    });
    slide.addText(m.label, {
      x: cx + 0.04, y: y + 0.34, w: cw - 0.08, h: 0.22,
      fontSize: 7.5, fontFace: FONT, color: C.textLight, align: "center",
    });
  }
  return y + 0.7;
}

function renderCompanyCards(pptx: PptxGenJS, slide: PptxGenJS.Slide, el: SlideElement, y: number): number {
  const cards = el.companyCards || [];
  if (cards.length === 0) return y;

  const colW1 = 1.8;
  const colW2 = 3.6;
  const colW3 = CW - colW1 - colW2;

  // ヘッダー
  slide.addShape(pptx.ShapeType.rect, { x: CL, y, w: CW, h: 0.26, fill: { color: C.navy } });
  slide.addText("業界・規模", {
    x: CL, y, w: colW1, h: 0.26,
    fontSize: 7.5, fontFace: FONT, color: C.white, bold: true, align: "center", valign: "middle",
  });
  slide.addText("具体的な行動と実績", {
    x: CL + colW1, y, w: colW2, h: 0.26,
    fontSize: 7.5, fontFace: FONT, color: C.white, bold: true, align: "center", valign: "middle",
  });
  slide.addText("身につけた能力（採用メリット）", {
    x: CL + colW1 + colW2, y, w: colW3, h: 0.26,
    fontSize: 7.5, fontFace: FONT, color: C.white, bold: true, align: "center", valign: "middle",
  });

  let rowY = y + 0.26;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const achCount = card.achievements?.length || 1;
    const rowH = Math.max(0.85, achCount * 0.22 + 0.42);
    const bgColor = i % 2 === 0 ? C.white : C.grayBg;

    slide.addShape(pptx.ShapeType.rect, {
      x: CL, y: rowY, w: CW, h: rowH,
      fill: { color: bgColor }, line: { color: C.grayBorder, width: 0.3 },
    });

    // 業界タグ
    const tagColor = getIndustryColor(card.industry);
    const tagW = Math.min(card.industry.length * 0.15 + 0.18, 1.1);
    slide.addShape(pptx.ShapeType.roundRect, {
      x: CL + 0.06, y: rowY + 0.05, w: tagW, h: 0.18,
      fill: { color: tagColor }, rectRadius: 0.03,
    });
    slide.addText(card.industry, {
      x: CL + 0.06, y: rowY + 0.05, w: tagW, h: 0.18,
      fontSize: 6.5, fontFace: FONT, color: C.white, bold: true, align: "center", valign: "middle",
    });

    // 会社名
    slide.addText(card.company, {
      x: CL + 0.06, y: rowY + 0.25, w: colW1 - 0.12, h: 0.16,
      fontSize: 8.5, fontFace: FONT, color: C.navy, bold: true,
    });
    slide.addText(card.scale + " | " + card.period, {
      x: CL + 0.06, y: rowY + 0.4, w: colW1 - 0.12, h: 0.14,
      fontSize: 6.5, fontFace: FONT, color: C.textLight,
    });

    // 実績（各項目を個別行で確実に改行）
    const achRows = (card.achievements || []).map(function(ach) {
      return { text: ach, options: { breakLine: true, fontSize: 7.5, fontFace: FONT, color: C.text } };
    });
    slide.addText(achRows as PptxGenJS.TextProps[], {
      x: CL + colW1 + 0.06, y: rowY + 0.05, w: colW2 - 0.12, h: rowH - 0.1,
      lineSpacing: 14, valign: "top",
    });

    // スキル見出し
    slide.addText(card.acquiredSkill, {
      x: CL + colW1 + colW2 + 0.06, y: rowY + 0.05, w: colW3 - 0.12, h: 0.16,
      fontSize: 8, fontFace: FONT, color: C.navy, bold: true,
    });
    slide.addText(card.skillDetail, {
      x: CL + colW1 + colW2 + 0.06, y: rowY + 0.21, w: colW3 - 0.12, h: Math.max(0.2, rowH - 0.5),
      fontSize: 6.5, fontFace: FONT, color: C.text, lineSpacing: 11, valign: "top",
    });

    // タグ
    let tagX = CL + colW1 + colW2 + 0.06;
    const tagY2 = rowY + rowH - 0.2;
    for (const tag of card.tags || []) {
      const tw = tag.length * 0.11 + 0.14;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: tagX, y: tagY2, w: tw, h: 0.16,
        fill: { color: C.warmBg }, line: { color: C.navyLight, width: 0.5 }, rectRadius: 0.03,
      });
      slide.addText(tag, {
        x: tagX, y: tagY2, w: tw, h: 0.16,
        fontSize: 6, fontFace: FONT, color: C.navyLight, bold: true, align: "center", valign: "middle",
      });
      tagX += tw + 0.05;
    }

    rowY += rowH;
  }

  return rowY + 0.04;
}

function renderSkillTransfers(pptx: PptxGenJS, slide: PptxGenJS.Slide, el: SlideElement, y: number): number {
  const transfers = el.skillTransfers || [];
  if (transfers.length === 0) return y;

  const cols = 2;
  const cardW = (CW - 0.12) / cols;
  const cardH = 0.92;

  for (let i = 0; i < transfers.length; i++) {
    const t = transfers[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = CL + col * (cardW + 0.12);
    const cy = y + row * (cardH + 0.06);

    slide.addShape(pptx.ShapeType.roundRect, {
      x: cx, y: cy, w: cardW, h: cardH,
      fill: { color: C.white }, line: { color: C.grayBorder, width: 0.5 }, rectRadius: 0.05,
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: cx, y: cy + 0.05, w: 0.04, h: cardH - 0.1, fill: { color: C.gold },
    });

    slide.addText(t.icon + "  " + t.fromSkill + " → " + t.toSkill, {
      x: cx + 0.14, y: cy + 0.06, w: cardW - 0.2, h: 0.22,
      fontSize: 9, fontFace: FONT, color: C.navy, bold: true,
    });
    slide.addText(t.description, {
      x: cx + 0.14, y: cy + 0.3, w: cardW - 0.2, h: cardH - 0.38,
      fontSize: 7, fontFace: FONT, color: C.text, lineSpacing: 11, valign: "top",
    });
  }

  return y + Math.ceil(transfers.length / cols) * (cardH + 0.06);
}

function renderCareerVision(pptx: PptxGenJS, slide: PptxGenJS.Slide, el: SlideElement, y: number): number {
  const visions = el.careerVisions || [];
  const certs = el.certifications || [];

  if (certs.length > 0) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: CL, y, w: CW, h: Math.max(0.5, certs.length * 0.16 + 0.28), fill: { color: C.navy }, rectRadius: 0.04,
    });
    slide.addText("定量実績・資格", {
      x: CL + 0.12, y: y + 0.03, w: 2.0, h: 0.18,
      fontSize: 8.5, fontFace: FONT, color: C.gold, bold: true,
    });
    const certText = certs.map(function(c) { return "✓  " + c; }).join("\n");
    slide.addText(certText, {
      x: CL + 0.12, y: y + 0.2, w: CW - 0.24, h: Math.max(0.26, certs.length * 0.14), fontSize: 7.5, fontFace: FONT, color: C.white, lineSpacing: 12,
    });
    y += Math.max(0.56, certs.length * 0.16 + 0.34);
  }

  if (visions.length === 0) return y;

  const phaseColors: Record<string, string> = { "短期": C.tagBlue, "中期": C.tagGreen, "長期": C.tagOrange };

  for (let i = 0; i < visions.length; i++) {
    const v = visions[i];
    const vy = y + i * 0.52;
    const dotColor = phaseColors[v.phase] || C.navy;

    slide.addShape(pptx.ShapeType.ellipse, {
      x: CL + 0.08, y: vy + 0.05, w: 0.12, h: 0.12, fill: { color: dotColor },
    });
    if (i < visions.length - 1) {
      slide.addShape(pptx.ShapeType.rect, {
        x: CL + 0.125, y: vy + 0.17, w: 0.025, h: 0.35, fill: { color: C.grayBorder },
      });
    }
    slide.addText(v.phase + ": " + v.title, {
      x: CL + 0.3, y: vy + 0.01, w: CW - 0.4, h: 0.2,
      fontSize: 9, fontFace: FONT, color: C.navy, bold: true,
    });
    slide.addText(v.description, {
      x: CL + 0.3, y: vy + 0.2, w: CW - 0.4, h: 0.24,
      fontSize: 7, fontFace: FONT, color: C.text, lineSpacing: 11,
    });
  }

  return y + visions.length * 0.52;
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
