import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, keywords } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // src/app/api/generate/route.ts 파일 내부
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // 이렇게 변경!

    // 🌟 1. JSON 강제 조건을 빼고, '순수 본문'만 출력하도록 프롬프트 수정
    const prompt = `
      당신은 글로벌 B2B 신선/가공식품 수출 마케팅 전문가입니다.
      아래 제품명과 핵심 키워드를 바탕으로 해외 바이어(B2B)에게 소구할 수 있는 매력적이고 전문적인 제품 상세 설명(Detail Content)을 작성해주세요.
      
      제품명: ${name}
      강조할 키워드: ${keywords}

      [작성 조건]
      1. B2B 바이어가 신뢰할 수 있도록 전문적인 어조를 사용하세요.
      2. 품질, 안전성, 물류 경쟁력 등을 자연스럽게 어필하세요.
      3. 길이는 3~4문단 정도로 작성해주세요.
      4. 소제목을 적절히 사용하여 가독성을 높여주세요.

      (주의: 인사말, 맺음말, 마크다운 기호 없이 오직 상세페이지 본문 텍스트만 바로 출력하세요.)
    `;

    const result = await model.generateContent(prompt);
    // 🌟 2. AI가 작성한 순수 텍스트를 그대로 가져옵니다.
    const text = result.response.text();

    // 🌟 3. 에러가 나던 JSON.parse를 없애고, 안전하게 우리가 직접 JSON으로 묶어서 반환합니다.
    return NextResponse.json({ detail_content: text.trim() });

  } catch (error: any) {
    console.error('API 라우트 생성 에러 상세:', error);
    return NextResponse.json({ error: error.message || '카피라이팅 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}