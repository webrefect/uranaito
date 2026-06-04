import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { drawTarotCards } from "@/lib/tarot";
import { getKyuseiResult } from "@/lib/kyusei";
import { getSeimeiResult } from "@/lib/seimei";
const client = new Anthropic();
export async function POST(req: NextRequest) {
  try {
    const { sei, mei, birthdate, theme, worry } = await req.json();
    if (!sei || !mei || !birthdate) return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    const [year, month] = birthdate.split("-").map(Number);
    const tarotCards = drawTarotCards(3);
    const kyusei = getKyuseiResult(year, month);
    const seimei = getSeimeiResult(sei, mei);
    const lines = [
      "【依頼者情報】",
      "氏名: " + sei + mei,
      "生年月日: " + birthdate,
      "テーマ: " + theme,
      worry ? "悩み・ご相談: " + worry : "",
      "", "【タロット（3枚）】",
      ...tarotCards.map((c,i) => (i+1)+"枚目: "+c.name+"（"+(c.reversed?"逆位置":"正位置")+"）— "+(c.reversed?c.meaning_rev:c.meaning_up)),
      "", "【九星気学】",
      "本命星: "+kyusei.honmei.name+"（"+kyusei.honmei.element+"の星）— "+kyusei.honmei.description,
      "月命星: "+kyusei.getsumei.name+"（"+kyusei.getsumei.element+"の星）— "+kyusei.getsumei.description,
      "", "【姓名判断（五格）】",
      "天格: "+seimei.tenkaku+"画（"+seimei.luck.tenkaku+"）",
      "人格: "+seimei.jinkaku+"画（"+seimei.luck.jinkaku+"）",
      "地格: "+seimei.chikaku+"画（"+seimei.luck.chikaku+"）",
      "外格: "+seimei.gaikaku+"画（"+seimei.luck.gaikaku+"）",
      "総格: "+seimei.soukaku+"画（"+seimei.luck.soukaku+"）",
      "", "上記3つの占いを統合して鑑定してください。"
    ];
    const prompt = lines.filter(l => l !== undefined).join("
").trim();
    const message = await client.messages.create({
      model: "claude-sonnet-4-6", max_tokens: 600,
      system: "あなたは「占いの店」の鑑定師です。温かく寄り添いながら、等身大のコーチスタイルで語りかけてください。難しい言葉は使わず、読んだ人が「よし、動こう」と思える言葉で締めてください。タロット・九星気学・姓名判断の3つを統合して300字以内の完結した要約を生成してください。途中で切れないこと。",
      messages: [{ role: "user", content: prompt }],
    });
    const interpretation = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ tarot: tarotCards, kyusei, seimei, interpretation, input: { sei, mei, birthdate, theme, worry } });
  } catch (error) {
    console.error("Diagnose error:", error);
    return NextResponse.json({ error: "鑑定中にエラーが発生しました" }, { status: 500 });
  }
}