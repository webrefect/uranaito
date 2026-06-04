import { NextRequest, NextResponse } from 'next/server';
import { drawTarotCards } from '@/lib/tarot';
import { getKyuseiResult } from '@/lib/kyusei';
import { getSeimeiResult } from '@/lib/seimei';
import { translateTarotCard } from '@/lib/tarot-ja';

function getMockInterpretation(sei: string, mei: string, theme: string): string {
  return sei + mei + 'さん、あなたの' + theme + 'について3つの占いが語りかけています。タロットは今が変化の時であることを示し、九星気学はあなたの持つ内なる強さを後押ししています。姓名判断の総格が示す通り、あなたには人を引きつける力があります。まず小さな一歩を踏み出してみてください。きっと道は開けます。';
}

export async function POST(req: NextRequest) {
  try {
    const { sei, mei, birthdate, theme, worry } = await req.json();
    if (!sei || !mei || !birthdate) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }
    const [year, month] = birthdate.split('-').map(Number);
    const tarotCards = drawTarotCards(3).map(card => { const ja = translateTarotCard(card.name); return { ...card, name: ja.name, meaning_up: ja.meaning_up, meaning_rev: ja.meaning_rev, emoji: ja.emoji }; });
    const kyusei = getKyuseiResult(year, month);
    const seimei = getSeimeiResult(sei, mei);
    let interpretation: string;
    if (!process.env.ANTHROPIC_API_KEY) {
      interpretation = getMockInterpretation(sei, mei, theme);
    } else {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const client = new Anthropic();
      const msgLines = [
        '【依頼者情報】',
        '氏名: ' + sei + mei,
        '生年月日: ' + birthdate,
        'テーマ: ' + theme,
        worry ? '悩み・ご相談: ' + worry : '',
      ];
      const prompt = msgLines.filter(Boolean).join('\n').trim();
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6', max_tokens: 600,
        system: 'あなたは「占いの店」の鑑定師です。温かく寄り添いながら、等身大のコーチスタイルで語りかけてください。難しい言葉は使わず、読んだ人が「よし、動こう」と思える言葉で締めてください。タロット・九星気学・姓名判断の3つを統合して300字以内の完結した要約を生成してください。途中で切れないこと。',
        messages: [{ role: 'user', content: prompt }],
      });
      interpretation = message.content[0].type === 'text' ? message.content[0].text : '';
    }
    return NextResponse.json({
      tarot: tarotCards, kyusei, seimei, interpretation,
      input: { sei, mei, birthdate, theme, worry },
      isMock: !process.env.ANTHROPIC_API_KEY,
    });
  } catch (error) {
    console.error('Diagnose error:', error);
    return NextResponse.json({ error: '鑑定中にエラーが発生しました' }, { status: 500 });
  }
}