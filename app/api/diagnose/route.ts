import { NextRequest, NextResponse } from 'next/server';
import { drawTarotCards } from '@/lib/tarot';
import { getKyuseiResult } from '@/lib/kyusei';
import { getSeimeiResult } from '@/lib/seimei';

// APIキーなしの場合に返すモック鑑定文
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
    const tarotCards = drawTarotCards(3);
    const kyusei = getKyuseiResult(year, month);
    const seimei = getSeimeiResult(sei, mei);

    let interpretation: string;

    if (!process.env.ANTHROPIC_API_KEY) {
      // モックモード：APIキーなしでサンプル鑑定文を返す
      interpretation = getMockInterpretation(sei, mei, theme);
    } else {
      // 本番モード：Claude APIで統合鑑定文を生成
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const client = new Anthropic();

      const lines = [
        '【依頼者情報】',
        '氏名: ' + sei + mei,
        '生年月日: ' + birthdate,
        'テーマ: ' + theme,
        worry ? '悩み・ご相談: ' + worry : '',
        '', '【タロット（3枚）】',
        ...tarotCards.map((c, i) => (i + 1) + '枚目: ' + c.name + '（' + (c.reversed ? '逆位置' : '正位置') + '）— ' + (c.reversed ? c.meaning_rev : c.meaning_up)),
        '', '【九星気学】',
        '本命星: ' + kyusei.honmei.name + '（' + kyusei.honmei.element + 'の星）— ' + kyusei.honmei.description,
        '月命星: ' + kyusei.getsumei.name + '（' + kyusei.getsumei.element + 'の星）— ' + kyusei.getsumei.description,
        '', '【姓名判断（五格）】',
        '天格: ' + seimei.tenkaku + '画（' + seimei.luck.tenkaku + '）',
        '人格: ' + seimei.jinkaku + '画（' + seimei.luck.jinkaku + '）',
        '地格: ' + seimei.chikaku + '画（' + seimei.luck.chikaku + '）',
        '外格: ' + seimei.gaikaku + '画（' + seimei.luck.gaikaku + '）',
        '総格: ' + seimei.soukaku + '画（' + seimei.luck.soukaku + '）',
        '', '上記3つの占いを統合して鑑定してください。',
      ];
      const prompt = lines.filter(Boolean).join('
').trim();

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
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
