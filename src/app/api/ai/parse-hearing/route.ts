import { NextRequest, NextResponse } from "next/server";
import { WORK_TYPES } from "@/lib/constants";

// AIヒアリング要約からヒアリングシートの各項目を自動抽出する
export async function POST(req: NextRequest) {
  const { summary } = await req.json();

  if (!summary || typeof summary !== "string") {
    return NextResponse.json({ error: "summary is required" }, { status: 400 });
  }

  const parsed = parseHearingSummary(summary);
  return NextResponse.json(parsed);
}

function parseHearingSummary(text: string) {
  const result = {
    buildingType: "",
    structureType: "",
    floors: "",
    totalFloorArea: "",
    estimationScope: "",
    requiredWorkTypes: "[]",
    drawingFormat: "",
    softwarePreference: "",
    specialNotes: "",
    customerRequests: "",
  };

  // 建物用途の抽出
  const buildingPatterns = [
    /建物用途[：:\s]*([^\n、。]+)/,
    /用途[：:\s]*([^\n、。]+)/,
    /(事務所|オフィス|共同住宅|マンション|病院|学校|商業施設|店舗|工場|倉庫|ホテル|公共施設|集合住宅|戸建|複合施設|福祉施設|研究施設|体育館|図書館)/,
  ];
  for (const p of buildingPatterns) {
    const m = text.match(p);
    if (m) { result.buildingType = m[1].trim(); break; }
  }

  // 構造の抽出
  const structurePatterns = [
    /構造[：:\s]*([^\n、。]+)/,
    /(RC造|SRC造|S造|W造|鉄筋コンクリート造|鉄骨鉄筋コンクリート造|鉄骨造|木造|混構造|CFT造|PC造|壁式RC造)/,
  ];
  for (const p of structurePatterns) {
    const m = text.match(p);
    if (m) { result.structureType = m[1].trim(); break; }
  }

  // 階数の抽出
  const floorPatterns = [
    /階数[：:\s]*([^\n、。]+)/,
    /(地上\d+階[^\n、。]*)/,
    /(\d+階建[^\n、。]*)/,
    /(B?\d+F?[～~〜-]?\d*F?)/,
  ];
  for (const p of floorPatterns) {
    const m = text.match(p);
    if (m) { result.floors = m[1].trim(); break; }
  }

  // 延床面積の抽出
  const areaPatterns = [
    /延床面積[：:\s]*([^\n、。]+)/,
    /延べ面積[：:\s]*([^\n、。]+)/,
    /床面積[：:\s]*([^\n、。]+)/,
    /([\d,]+\.?\d*\s*[㎡m²])/,
    /(約[\d,]+\s*[㎡m²坪])/,
  ];
  for (const p of areaPatterns) {
    const m = text.match(p);
    if (m) { result.totalFloorArea = m[1].trim(); break; }
  }

  // 図面形式の抽出
  const drawingPatterns = [
    /図面[形フォーマット]*[式ト]?[：:\s]*([^\n、。]+)/,
    /(PDF|CAD|DWG|DXF|JWW|JW-CAD|BIM|Revit)/i,
  ];
  for (const p of drawingPatterns) {
    const m = text.match(p);
    if (m) { result.drawingFormat = m[1].trim(); break; }
  }

  // 使用ソフトの抽出
  const softwarePatterns = [
    /(?:使用|指定)?ソフト[：:\s]*([^\n、。]+)/,
    /ソフトウェア[：:\s]*([^\n、。]+)/,
    /(Excel|エクセル|RIBC|福井コンピュータ|建築積算ソフト|Helios|ヘリオス|コスト管理|概算システム)/i,
  ];
  for (const p of softwarePatterns) {
    const m = text.match(p);
    if (m) { result.softwarePreference = m[1].trim(); break; }
  }

  // 工種の抽出
  const detectedWorkTypes: string[] = [];
  for (const wt of WORK_TYPES) {
    if (text.includes(wt)) {
      detectedWorkTypes.push(wt);
    }
  }
  // 追加のキーワードマッピング
  const workTypeAliases: Record<string, string> = {
    "電気": "電気設備",
    "機械": "機械設備",
    "給排水": "給排水衛生設備",
    "衛生": "給排水衛生設備",
    "空調": "空調換気設備",
    "換気": "空調換気設備",
    "杭": "杭工事",
    "土工": "土工事",
    "鉄骨": "鉄骨工事",
    "内装": "内装工事",
    "防水": "防水工事",
    "塗装": "塗装工事",
    "金属": "金属工事",
    "木工": "木工事",
    "左官": "左官工事",
    "タイル": "タイル工事",
    "ガラス": "ガラス工事",
    "設備": "機械設備",
  };
  for (const [alias, workType] of Object.entries(workTypeAliases)) {
    if (text.includes(alias) && !detectedWorkTypes.includes(workType)) {
      detectedWorkTypes.push(workType);
    }
  }
  if (detectedWorkTypes.length > 0) {
    result.requiredWorkTypes = JSON.stringify(detectedWorkTypes);
    result.estimationScope = detectedWorkTypes.join("、");
  }

  // 特記事項の抽出
  const specialPatterns = [
    /特記[事項]*[：:\s]*([^\n]+)/,
    /注意[事項点]*[：:\s]*([^\n]+)/,
    /備考[：:\s]*([^\n]+)/,
  ];
  const specialNotes: string[] = [];
  for (const p of specialPatterns) {
    const m = text.match(p);
    if (m) specialNotes.push(m[1].trim());
  }
  result.specialNotes = specialNotes.join("\n");

  // お客様要望の抽出
  const requestPatterns = [
    /(?:お客様|顧客|クライアント)[のが]?要望[：:\s]*([^\n]+)/,
    /要望[：:\s]*([^\n]+)/,
    /希望[：:\s]*([^\n]+)/,
    /(?:お客様|顧客)[のが]?(?:要求|リクエスト)[：:\s]*([^\n]+)/,
  ];
  const requests: string[] = [];
  for (const p of requestPatterns) {
    const m = text.match(p);
    if (m) requests.push(m[1].trim());
  }
  result.customerRequests = requests.join("\n");

  // 積算範囲がまだ空なら、テキスト全体から推定
  if (!result.estimationScope) {
    const scopePatterns = [
      /積算範囲[：:\s]*([^\n]+)/,
      /対象範囲[：:\s]*([^\n]+)/,
      /範囲[：:\s]*([^\n]+)/,
    ];
    for (const p of scopePatterns) {
      const m = text.match(p);
      if (m) { result.estimationScope = m[1].trim(); break; }
    }
  }

  return result;
}
