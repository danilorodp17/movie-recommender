"use client";

import { useState } from "react";
import { Film, MessageCircle, ClipboardList, Send, Loader2, Star, RotateCcw } from "lucide-react";

interface Filme {
  title: string;
  genres: string;
  reason: string;
}

interface Mensagem {
  role: "user" | "assistant";
  content: string;
  filmes?: Filme[];
}

const PERGUNTAS = [
  {
    id: "humor",
    pergunta: "Como você está se sentindo agora?",
    opcoes: ["Animado e cheio de energia", "Tranquilo e relaxado", "Pensativo e reflexivo", "Triste ou melancólico"]
  },
  {
    id: "genero",
    pergunta: "Que tipo de história te atrai mais?",
    opcoes: ["Aventura e ação", "Romance e drama", "Suspense e mistério", "Comédia e leveza"]
  },
  {
    id: "epoca",
    pergunta: "Prefere filmes de qual época?",
    opcoes: ["Clássicos (antes dos anos 90)", "Anos 90 e 2000", "Produções recentes", "Não tenho preferência"]
  },
  {
    id: "duracao",
    pergunta: "Quanto tempo você tem disponível?",
    opcoes: ["Menos de 1h30", "Entre 1h30 e 2h", "Aceito filmes longos", "Tanto faz"]
  },
  {
    id: "ambiente",
    pergunta: "Que tipo de ambiente/cenário te agrada?",
    opcoes: ["Espaço e ficção científica", "Natureza e campo", "Cidade e vida urbana", "Épocas históricas"]
  }
];

async function pedirRecomendacaoIA(prompt: string): Promise<{ texto: string; filmes: Filme[] }> {
  const response = await fetch("/api/recomendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  return response.json();
}

export default function Home() {
  const [modo, setModo] = useState<"inicio" | "perguntas" | "chat">("inicio");
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [inputChat, setInputChat] = useState("");
  const [loading, setLoading] = useState(false);

  function resetar() {
    setModo("inicio");
    setPerguntaAtual(0);
    setRespostas({});
    setMensagens([]);
    setInputChat("");
  }

  async function responderPergunta(opcao: string) {
    const pergunta = PERGUNTAS[perguntaAtual];
    const novasRespostas = { ...respostas, [pergunta.id]: opcao };
    setRespostas(novasRespostas);

    if (perguntaAtual < PERGUNTAS.length - 1) {
      setPerguntaAtual(perguntaAtual + 1);
    } else {
      // Todas perguntas respondidas — pedir recomendação
      setLoading(true);
      const prompt = `O usuário respondeu um questionário de preferências de filmes:
- Humor atual: ${novasRespostas.humor}
- Tipo de história: ${novasRespostas.genero}
- Época preferida: ${novasRespostas.epoca}
- Tempo disponível: ${novasRespostas.duracao}
- Ambiente preferido: ${novasRespostas.ambiente}

Com base nisso, recomende 6 filmes perfeitos para esse perfil.`;

      const resultado = await pedirRecomendacaoIA(prompt);
      setMensagens([{ role: "assistant", content: resultado.texto, filmes: resultado.filmes }]);
      setModo("chat");
      setLoading(false);
    }
  }

  async function enviarChat() {
    if (!inputChat.trim() || loading) return;
    const novaMensagem: Mensagem = { role: "user", content: inputChat };
    const novasMensagens = [...mensagens, novaMensagem];
    setMensagens(novasMensagens);
    setInputChat("");
    setLoading(true);

    const resultado = await pedirRecomendacaoIA(inputChat);
    setMensagens([...novasMensagens, {
      role: "assistant",
      content: resultado.texto,
      filmes: resultado.filmes
    }]);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <Film className="text-red-500" size={24} />
        <h1 className="font-bold text-lg">Movie Recommender</h1>
        {modo !== "inicio" && (
          <button onClick={resetar} className="ml-auto flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
            <RotateCcw size={14} /> Recomeçar
          </button>
        )}
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Tela inicial */}
        {modo === "inicio" && (
          <div className="text-center">
            <Film size={56} className="mx-auto mb-6 text-red-500 opacity-80" />
            <h2 className="text-3xl font-bold mb-3">Encontre seu próximo filme</h2>
            <p className="text-white/50 mb-12">Use IA para descobrir filmes perfeitos para o seu momento</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setModo("perguntas")}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 text-left transition-all group"
              >
                <ClipboardList size={28} className="text-red-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Questionário</h3>
                <p className="text-white/40 text-sm">Responda 5 perguntas rápidas e receba recomendações personalizadas para o seu humor e gosto</p>
                <span className="mt-4 inline-flex items-center gap-1 text-red-500 text-sm group-hover:gap-2 transition-all">
                  Começar →
                </span>
              </button>

              <button
                onClick={() => setModo("chat")}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 text-left transition-all group"
              >
                <MessageCircle size={28} className="text-red-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Chat com IA</h3>
                <p className="text-white/40 text-sm">Descreva exatamente o que você quer assistir e a IA encontra o filme ideal para você</p>
                <span className="mt-4 inline-flex items-center gap-1 text-red-500 text-sm group-hover:gap-2 transition-all">
                  Abrir chat →
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Questionário */}
        {modo === "perguntas" && !loading && (
          <div>
            <div className="flex gap-1 mb-8">
              {PERGUNTAS.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= perguntaAtual ? "bg-red-500" : "bg-white/10"}`} />
              ))}
            </div>

            <p className="text-white/40 text-sm mb-3">Pergunta {perguntaAtual + 1} de {PERGUNTAS.length}</p>
            <h2 className="text-2xl font-bold mb-8">{PERGUNTAS[perguntaAtual].pergunta}</h2>

            <div className="grid gap-3">
              {PERGUNTAS[perguntaAtual].opcoes.map((opcao) => (
                <button
                  key={opcao}
                  onClick={() => responderPergunta(opcao)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/50 rounded-xl px-5 py-4 text-left text-sm transition-all"
                >
                  {opcao}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 size={40} className="animate-spin mx-auto mb-4 text-red-500" />
            <p className="text-white/50">A IA está analisando suas preferências...</p>
          </div>
        )}

        {/* Chat */}
        {modo === "chat" && !loading && (
          <div>
            {mensagens.length === 0 && (
              <div className="text-center py-12 mb-6">
                <MessageCircle size={40} className="mx-auto mb-4 text-red-500 opacity-60" />
                <h2 className="text-xl font-semibold mb-2">O que você quer assistir?</h2>
                <p className="text-white/40 text-sm">Descreva o filme dos seus sonhos e a IA vai encontrar pra você</p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {[
                    "Um filme de faroeste com humor",
                    "Drama familiar emocionante",
                    "Ficção científica filosófica",
                    "Comédia romântica anos 90"
                  ].map(s => (
                    <button key={s} onClick={() => setInputChat(s)}
                      className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/10 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mensagens */}
            <div className="space-y-6 mb-6">
              {mensagens.map((msg, i) => (
                <div key={i}>
                  {msg.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="bg-red-600/20 border border-red-500/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-sm text-sm">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white/60 text-sm mb-4">{msg.content}</p>
                      {msg.filmes && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {msg.filmes.map((filme, j) => (
                            <div key={j} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
                              <div className="flex items-start gap-2 mb-2">
                                <Film size={14} className="text-red-500 mt-0.5 shrink-0" />
                                <h4 className="text-sm font-medium leading-snug">{filme.title}</h4>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {filme.genres.split("|").slice(0, 3).map(g => (
                                  <span key={g} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-white/50">{g}</span>
                                ))}
                              </div>
                              <p className="text-xs text-white/40 leading-relaxed">{filme.reason}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-3 sticky bottom-6">
              <input
                type="text"
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && enviarChat()}
                placeholder="Ex: quero um thriller psicológico tenso..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/20 transition-colors"
              />
              <button
                onClick={enviarChat}
                disabled={!inputChat.trim()}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 rounded-xl transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}