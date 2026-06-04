import kanjiData from "../public/data/kanji.json";
const kanjiMap = kanjiData as Record<string, number>;
function getStrokes(char: string): number { return (kanjiMap as Record<string,number>)[char] ?? 1; }
function sumStrokes(str: string): number { return str.split("").reduce((a,c) => a + getStrokes(c), 0); }
export type SeimeiResult = { tenkaku: number; jinkaku: number; chikaku: number; gaikaku: number; soukaku: number; };
export function calcSeimei(sei: string, mei: string): SeimeiResult {
  const tenkaku = sumStrokes(sei), chikaku = sumStrokes(mei), soukaku = tenkaku + chikaku;
  const jinkaku = getStrokes(sei[sei.length-1]) + getStrokes(mei[0]);
  return { tenkaku, jinkaku, chikaku, gaikaku: soukaku - jinkaku, soukaku };
}
const LUCKY = new Set([1,3,5,6,8,11,13,15,16,18,21,23,24,25,29,31,32,33,35,37,39,41]);
function getLuck(n: number): string {
  if (LUCKY.has(n)) return "大吉"; const r = n % 10;
  if (r === 7 || r === 4) return "吉"; if (r === 2 || r === 0) return "凶"; return "中吉";
}
export function getSeimeiResult(sei: string, mei: string) {
  const s = calcSeimei(sei, mei);
  return { ...s, luck: { tenkaku: getLuck(s.tenkaku), jinkaku: getLuck(s.jinkaku), chikaku: getLuck(s.chikaku), gaikaku: getLuck(s.gaikaku), soukaku: getLuck(s.soukaku) } };
}