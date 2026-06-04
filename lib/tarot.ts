import fs from "fs"; import path from "path";
export type TarotCard = { name: string; name_short: string; value: string; value_int: number; meaning_up: string; meaning_rev: string; desc: string; type: string; suit?: string; reversed: boolean; };
export function drawTarotCards(count = 3): TarotCard[] {
  const filePath = path.join(process.cwd(), "public", "data", "cards.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const cards: TarotCard[] = data.cards;
  const shuffled = [...cards];
  for (let i = shuffled.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]; }
  return shuffled.slice(0,count).map(card => ({ ...card, reversed: Math.random()<0.5 }));
}