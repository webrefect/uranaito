'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const THEMES = [
  '恋愛・結婚',
  '仕事・転職',
  'お金・資産',
  '健康・美容',
  '人間関係',
  '学業・成長',
  '人生全般',
];

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState({ sei: '', mei: '', birthdate: '', theme: '', worry: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sei || !form.mei || !form.birthdate || !form.theme) {
      setError('姓・名・生年月日・テーマは必須です');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'エラーが発生しました');
      sessionStorage.setItem('uranaiResult', JSON.stringify(data));
      router.push('/result');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-white flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🔮</div>
        <h1 className="text-4xl font-bold text-rose-700 tracking-widest mb-2">占いの店</h1>
        <p className="text-pink-400 text-sm tracking-wider">タロット × 九星気学 × 姓名判断</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white border border-pink-200 rounded-2xl p-8 space-y-5 shadow-sm"
      >
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-rose-700 text-sm font-medium mb-1">姓（漢字）</label>
            <input
              type="text"
              value={form.sei}
              onChange={(e) => setForm({ ...form, sei: e.target.value })}
              placeholder="例：田上"
              className="w-full border border-pink-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 transition"
            />
          </div>
          <div className="flex-1">
            <label className="block text-rose-700 text-sm font-medium mb-1">名（漢字）</label>
            <input
              type="text"
              value={form.mei}
              onChange={(e) => setForm({ ...form, mei: e.target.value })}
              placeholder="例：義高"
              className="w-full border border-pink-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-rose-700 text-sm font-medium mb-1">生年月日</label>
          <input
            type="date"
            value={form.birthdate}
            onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
            className="w-full border border-pink-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 transition"
          />
        </div>

        <div>
          <label className="block text-rose-700 text-sm font-medium mb-2">テーマ</label>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, theme: t })}
                className={
                  'rounded-lg px-3 py-2 text-sm font-medium transition border-2 ' +
                  (form.theme === t
                    ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                    : 'bg-white border-pink-300 text-rose-600 hover:border-rose-400 hover:bg-rose-50')
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-rose-700 text-sm font-medium mb-1">
            お悩み・ご相談 <span className="text-pink-400 text-xs font-normal">（任意）</span>
          </label>
          <textarea
            value={form.worry}
            onChange={(e) => setForm({ ...form, worry: e.target.value })}
            placeholder="具体的なお悩みがあれば教えてください..."
            rows={3}
            className="w-full border border-pink-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 transition resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-400 hover:from-rose-600 hover:to-pink-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-lg tracking-wider shadow-sm"
        >
          {loading ? '鑑定中...' : '✨ 鑑定を始める'}
        </button>
      </form>

      <p className="text-pink-300 text-xs mt-8 text-center">
        ※ 占いは参考程度にお楽しみください
      </p>
    </main>
  );
}
