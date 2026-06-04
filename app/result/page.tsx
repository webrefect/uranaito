'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type TarotCard = { name: string; reversed: boolean; meaning_up: string; meaning_rev: string; desc: string; emoji?: string; };
type KyuseiStar = { name: string; element: string; description: string; };
type Result = {
  tarot: TarotCard[];
  kyusei: { honmei: KyuseiStar; getsumei: KyuseiStar; };
  seimei: {
    tenkaku: number; jinkaku: number; chikaku: number; gaikaku: number; soukaku: number;
    luck: { tenkaku: string; jinkaku: string; chikaku: string; gaikaku: string; soukaku: string; };
  };
  interpretation: string;
  input: { sei: string; mei: string; birthdate: string; theme: string; worry?: string; };
};

const TAROT_POSITIONS = ['過去', '現在', '未来'];

function elementEmoji(element: string): string {
  const map: Record<string, string> = { "水": "💧", "土": "🌍", "木": "🌿", "金": "✨", "火": "🔥" };
  return map[element] ?? "⭐";
}

function luckColor(luck: string): string {
  if (luck === '大吉') return 'text-rose-600 font-bold';
  if (luck === '吉') return 'text-pink-500 font-bold';
  if (luck === '中吉') return 'text-orange-400 font-bold';
  return 'text-gray-400 font-bold';
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('uranaiResult');
    if (!raw) { router.push('/'); return; }
    setResult(JSON.parse(raw));
  }, [router]);

  if (!result) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center">
        <div className="text-pink-400 text-lg animate-pulse">鑑定中...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-white px-4 py-12">
      <div className="max-w-lg mx-auto space-y-5">
        <div className="text-center">
          <div className="text-4xl mb-2">🔮</div>
          <h1 className="text-2xl font-bold text-rose-700">鑑定結果</h1>
          <p className="text-pink-400 text-sm mt-1">{result.input.sei}{result.input.mei} 様 ／ {result.input.theme}</p>
        </div>

        <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-rose-600 font-bold text-sm tracking-wider mb-3">✨ 総合鑑定</h2>
          <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{result.interpretation}</p>
        </div>

        <div className="bg-white border border-pink-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-rose-600 font-bold text-sm tracking-wider mb-4">🃏 タロット</h2>
          <div className="space-y-3">
            {result.tarot.map((card, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-pink-400 text-xs mt-1 w-8 shrink-0">{TAROT_POSITIONS[i]}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xl mr-1">{card.emoji}</span><span className="text-gray-800 text-sm font-medium">{card.name}</span>
                    <span className={'text-xs px-2 py-0.5 rounded-full ' + (card.reversed ? 'bg-red-50 text-red-400 border border-red-200' : 'bg-pink-50 text-pink-500 border border-pink-200')}>
                      {card.reversed ? '逆位置' : '正位置'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">{card.reversed ? card.meaning_rev : card.meaning_up}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-pink-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-rose-600 font-bold text-sm tracking-wider mb-4">⭐ 九星気学</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '本命星', star: result.kyusei.honmei },
              { label: '月命星', star: result.kyusei.getsumei },
            ].map(({ label, star }) => (
              <div key={label} className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                <p className="text-pink-400 text-xs mb-1">{label}</p>
                <span className="text-2xl mb-1 block">{elementEmoji(star.element)}</span>
                <p className="text-gray-800 font-bold text-sm">{star.name}</p>
                <p className="text-gray-500 text-xs mt-1">{star.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-pink-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-rose-600 font-bold text-sm tracking-wider mb-4">📜 姓名判断（五格）</h2>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { label: '天格', value: result.seimei.tenkaku, luck: result.seimei.luck.tenkaku },
              { label: '人格', value: result.seimei.jinkaku, luck: result.seimei.luck.jinkaku },
              { label: '地格', value: result.seimei.chikaku, luck: result.seimei.luck.chikaku },
              { label: '外格', value: result.seimei.gaikaku, luck: result.seimei.luck.gaikaku },
              { label: '総格', value: result.seimei.soukaku, luck: result.seimei.luck.soukaku },
            ].map(({ label, value, luck }) => (
              <div key={label} className="bg-pink-50 rounded-xl py-3 px-2 border border-pink-100">
                <p className="text-pink-400 mb-1">{label}</p>
                <p className="text-gray-800 font-bold text-base">{value}画</p>
                <p className={'mt-0.5 ' + luckColor(luck)}>{luck}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => { sessionStorage.removeItem('uranaiResult'); router.push('/'); }}
          className="w-full bg-white hover:bg-rose-50 border border-rose-300 text-rose-500 py-3 rounded-xl transition font-medium shadow-sm"
        >
          もう一度占う
        </button>
      </div>
    </main>
  );
}
