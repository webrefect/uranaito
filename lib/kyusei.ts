export type KyuseiStar = { name: string; element: string; description: string; };
const STARS: KyuseiStar[] = [
  { name: "一白水星", element: "水", description: "柔軟性と適応力" },
  { name: "二黒土星", element: "土", description: "勤勉と忍耐" },
  { name: "三碧木星", element: "木", description: "発展と活力" },
  { name: "四緑木星", element: "木", description: "調和と信頼" },
  { name: "五黄土星", element: "土", description: "中心と変革" },
  { name: "六白金星", element: "金", description: "完璧と責任" },
  { name: "七赤金星", element: "金", description: "喜びと豊かさ" },
  { name: "八白土星", element: "土", description: "変革と蓄積" },
  { name: "九紫火星", element: "火", description: "知性と名誉" },
];
export function calcHonmeiStar(birthYear: number): KyuseiStar {
  let sum = 0, y = birthYear;
  while (y > 0) { sum += y % 10; y = Math.floor(y / 10); }
  while (sum >= 10) { let s = 0, tmp = sum; while (tmp > 0) { s += tmp % 10; tmp = Math.floor(tmp / 10); } sum = s; }
  const idx = (11 - sum) % 9; return STARS[idx === 0 ? 8 : idx - 1];
}
export function calcGetsumeiStar(birthYear: number, birthMonth: number): KyuseiStar {
  const honmei = calcHonmeiStar(birthYear); const honmeiIdx = STARS.indexOf(honmei);
  const monthTable = [8,7,6,5,4,3,2,1,0,8,7,6];
  const offset = monthTable[birthMonth - 1]; const group = (honmeiIdx + 1) % 3;
  const baseIdx = group === 0 ? 2 : group === 1 ? 5 : 8;
  return STARS[(baseIdx - offset + 9) % 9];
}
export function getKyuseiResult(birthYear: number, birthMonth: number) {
  return { honmei: calcHonmeiStar(birthYear), getsumei: calcGetsumeiStar(birthYear, birthMonth) };
}