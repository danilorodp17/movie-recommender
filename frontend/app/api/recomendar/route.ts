import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `Você é um especialista em cinema. Responda SEMPRE em JSON válido com este formato:
{
  "texto": "frase curta apresentando as recomendações",
  "filmes": [
    {
      "title": "Nome do Filme (Ano)",
      "genres": "Genero1|Genero2",
      "reason": "Por que esse filme é perfeito (1 frase)"
    }
  ]
}
Recomende 4 filmes. Responda APENAS o JSON, sem markdown, sem texto adicional.`;

    const result = await model.generateContent(`${systemPrompt}\n\nPedido do usuário: ${prompt}`);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json({
      texto: "Erro ao buscar recomendações.",
      filmes: []
    }, { status: 500 });
  }
}