import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em cinema. Responda SEMPRE em JSON válido com este formato:
{
  "texto": "frase curta e calorosa apresentando as recomendações",
  "filmes": [
    {
      "title": "Nome do Filme (Ano)",
      "genres": "Genero1|Genero2",
      "reason": "Por que esse filme é perfeito para o pedido (1 frase)"
    }
  ]
}
Recomende 4 filmes. Responda APENAS o JSON, sem markdown, sem texto adicional.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const text = response.choices[0]?.message?.content || "";
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