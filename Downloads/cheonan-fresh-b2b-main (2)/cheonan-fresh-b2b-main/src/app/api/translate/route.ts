import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { name, desc } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 🌟 패키지 업데이트 후에는 구글이 권장하는 가장 빠르고 정확한 모델을 씁니다.
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); 

    const prompt = `
      당신은 전문 번역가입니다. 
      다음 한국어 제품명과 설명을 영어와 중국어로 번역해주세요.

      [원본]
      제품명: ${name}
      설명: ${desc}

      [조건]
      반드시 아래 JSON 형식으로만 답변하고, 마크다운 기호(\`\`\`json 등)나 인사말은 절대 포함하지 마세요.
      {
        "name_en": "영어 제품명 번역",
        "name_cn": "중국어 제품명 번역",
        "desc_en": "영어 설명 번역",
        "desc_cn": "중국어 설명 번역"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const translatedData = JSON.parse(cleanedText);

    return NextResponse.json(translatedData);

  } catch (error: any) {
    console.error('번역 API 에러 상세:', error);
    return NextResponse.json({ error: error.message || '번역 중 오류가 발생했습니다.' }, { status: 500 });
  }
}