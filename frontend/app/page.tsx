"use client";

import { useState, useEffect } from "react";
import { Film, MessageCircle, ClipboardList, Send, Loader2, RotateCcw, Star, ChevronRight, LogOut, Clock, User } from "lucide-react";

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

interface UserData {
  id: number;
  name: string;
  email: string;
  token: string;
}

const PERGUNTAS = [
  { id: "humor", pergunta: "Como você está se sentindo agora?", opcoes: ["Animado e cheio de energia", "Tranquilo e relaxado", "Pensativo e reflexivo", "Melancólico"] },
  { id: "genero", pergunta: "Que tipo de história te atrai?", opcoes: ["Aventura e ação", "Romance e drama", "Suspense e mistério", "Comédia e leveza"] },
  { id: "epoca", pergunta: "Prefere filmes de qual época?", opcoes: ["Clássicos (antes dos anos 90)", "Anos 90 e 2000", "Produções recentes", "Sem preferência"] },
  { id: "ambiente", pergunta: "Que cenário te agrada mais?", opcoes: ["Espaço e ficção científica", "Natureza e campo", "Cidade e vida urbana", "Épocas históricas"] },
  { id: "final", pergunta: "Como você quer se sentir ao terminar?", opcoes: ["Inspirado e motivado", "Emocionado e tocado", "Intrigado e reflexivo", "Leve e bem-humorado"] },
];

async function apiRequest(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function pedirRecomendacao(prompt: string): Promise<{ texto: string; filmes: Filme[] }> {
  const res = await fetch("/api/recomendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  return res.json();
}

export default function Home() {
  const [tela, setTela] = useState<"auth" | "home" | "questionario" | "chat">("auth");
  const [authMode, setAuthMode] = useState<"login" | "cadastro">("login");
  const [user, setUser] = useState<UserData | null>(null);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [inputChat, setInputChat] = useState("");
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<any[]>([]);
  const [showHistorico, setShowHistorico] = useState(false);

  // Auth form
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("movie_user");
    if (saved) {
      setUser(JSON.parse(saved));
      setTela("home");
    }
  }, []);

  async function handleAuth() {
    setAuthError("");
    setLoading(true);
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/cadastro";
      const body = authMode === "login"
        ? { email: formData.email, password: formData.password }
        : formData;

      const data = await apiRequest(endpoint, { method: "POST", body: JSON.stringify(body) });
      const userData = { ...data.user, token: data.access_token };
      setUser(userData);
      localStorage.setItem("movie_user", JSON.stringify(userData));
      setTela("home");
    } catch {
      setAuthError(authMode === "login" ? "Email ou senha incorretos" : "Erro ao criar conta. Tente outro email.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("movie_user");
    setUser(null);
    setTela("auth");
    setMensagens([]);
    setRespostas({});
    setPerguntaAtual(0);
  }

  async function carregarHistorico() {
    if (!user) return;
    try {
      const data = await apiRequest("/api/historico", {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setHistorico(data);
      setShowHistorico(true);
    } catch { }
  }

  async function salvarHistorico(tipo: string, prompt: string, filmes: Filme[]) {
    if (!user) return;
    try {
      await apiRequest("/api/historico", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ tipo, prompt, filmes_recomendados: JSON.stringify(filmes) }),
      });
    } catch { }
  }

  async function responderPergunta(opcao: string) {
    const pergunta = PERGUNTAS[perguntaAtual];
    const novasRespostas = { ...respostas, [pergunta.id]: opcao };
    setRespostas(novasRespostas);

    if (perguntaAtual < PERGUNTAS.length - 1) {
      setPerguntaAtual(perguntaAtual + 1);
    } else {
      setLoading(true);
      const prompt = `Perfil do usuário: humor ${novasRespostas.humor}, gosta de ${novasRespostas.genero}, prefere época ${novasRespostas.epoca}, cenário ${novasRespostas.ambiente}, quer se sentir ${novasRespostas.final}. Recomende filmes perfeitos.`;
      const resultado = await pedirRecomendacao(prompt);
      setMensagens([{ role: "assistant", content: resultado.texto, filmes: resultado.filmes }]);
      await salvarHistorico("questionario", prompt, resultado.filmes);
      setTela("chat");
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
    const resultado = await pedirRecomendacao(inputChat);
    const resposta = { role: "assistant" as const, content: resultado.texto, filmes: resultado.filmes };
    setMensagens([...novasMensagens, resposta]);
    await salvarHistorico("chat", inputChat, resultado.filmes);
    setLoading(false);
  }

  function resetar() {
    setTela("home");
    setMensagens([]);
    setRespostas({});
    setPerguntaAtual(0);
    setShowHistorico(false);
  }

  // ═══════════════════════════════
  // TELA DE AUTH
  // ═══════════════════════════════
  if (tela === "auth") return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "var(--noir)" }}>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5" style={{ background: "radial-gradient(circle, var(--gold), transparent)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5" style={{ background: "radial-gradient(circle, var(--red), transparent)", filter: "blur(40px)" }} />
        {/* Film strip decorativo */}
        <div className="absolute left-0 top-0 bottom-0 w-16 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(180deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 48px)", borderRight: "2px solid rgba(255,255,255,0.1)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-16 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(180deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 48px)", borderLeft: "2px solid rgba(255,255,255,0.1)" }} />
      </div>

      <div className="w-full max-w-md px-6 animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))" }}>
              <Film size={20} color="#000" />
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "var(--text)" }}>
            CineMatch
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>
            DESCOBERTA CINEMATOGRÁFICA COM IA
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex mb-8 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
            {(["login", "cadastro"] as const).map(mode => (
              <button key={mode} onClick={() => { setAuthMode(mode); setAuthError(""); }}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: authMode === mode ? "rgba(201,168,76,0.15)" : "transparent",
                  color: authMode === mode ? "var(--gold)" : "var(--text-muted)",
                  border: authMode === mode ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent"
                }}>
                {mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {authMode === "cadastro" && (
              <div>
                <label className="block text-xs mb-2" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>NOME</label>
                <input type="text" placeholder="Seu nome" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="noir-input w-full px-4 py-3 rounded-xl text-sm" />
              </div>
            )}
            <div>
              <label className="block text-xs mb-2" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>EMAIL</label>
              <input type="email" placeholder="seu@email.com" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleAuth()}
                className="noir-input w-full px-4 py-3 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs mb-2" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>SENHA</label>
              <input type="password" placeholder="••••••••" value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleAuth()}
                className="noir-input w-full px-4 py-3 rounded-xl text-sm" />
            </div>

            {authError && (
              <p className="text-sm text-center py-2 rounded-lg" style={{ color: "var(--red-light)", background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.2)" }}>
                {authError}
              </p>
            )}

            <button onClick={handleAuth} disabled={loading}
              className="btn-gold w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
              {loading ? "Aguarde..." : authMode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-dim)", fontFamily: "'DM Mono', monospace" }}>
          POWERED BY GROQ AI × MOVIELENS 25M
        </p>
      </div>
    </div>
  );

  // ═══════════════════════════════
  // HEADER
  // ═══════════════════════════════
  const Header = () => (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center gap-4" style={{ background: "rgba(8,8,8,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
      <button onClick={resetar} className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))" }}>
          <Film size={14} color="#000" />
        </div>
        <span className="font-display font-bold text-lg" style={{ color: "var(--text)" }}>CineMatch</span>
      </button>

      <div className="ml-auto flex items-center gap-3">
        <button onClick={carregarHistorico} className="btn-ghost flex items-center gap-2 px-3 py-2 rounded-lg text-xs">
          <Clock size={13} /> Histórico
        </button>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
          <User size={13} style={{ color: "var(--gold)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{user?.name}</span>
        </div>
        <button onClick={logout} className="btn-ghost p-2 rounded-lg">
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );

  // ═══════════════════════════════
  // TELA HOME
  // ═══════════════════════════════
  if (tela === "home") return (
    <div className="min-h-screen" style={{ background: "var(--noir)" }}>
      <Header />

      {/* Histórico modal */}
      {showHistorico && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
          <div className="glass rounded-2xl p-6 w-full max-w-lg max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl">Histórico</h3>
              <button onClick={() => setShowHistorico(false)} className="btn-ghost p-2 rounded-lg"><RotateCcw size={14} /></button>
            </div>
            {historico.length === 0 ? (
              <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>Nenhuma pesquisa ainda</p>
            ) : historico.map((h, i) => (
              <div key={i} className="glass rounded-xl p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.2)" }}>
                    {h.tipo}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                    {new Date(h.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{h.prompt.slice(0, 100)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16 animate-fade-up">
            <p className="text-xs mb-4 tracking-widest" style={{ color: "var(--gold)", fontFamily: "'DM Mono', monospace" }}>
              BEM-VINDO, {user?.name.toUpperCase()}
            </p>
            <h2 className="font-display text-5xl font-bold mb-4 leading-tight">
              Seu próximo filme<br />
              <span className="text-shimmer">favorito te espera</span>
            </h2>
            <p className="text-base max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
              Use inteligência artificial para descobrir filmes perfeitos para o seu humor e momento
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Questionário */}
            <button onClick={() => { setTela("questionario"); setPerguntaAtual(0); setRespostas({}); }}
              className="glass rounded-2xl p-8 text-left group transition-all hover:scale-[1.02]"
              style={{ animationDelay: "0.1s" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all group-hover:scale-110"
                style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(232,201,122,0.1))", border: "1px solid rgba(201,168,76,0.3)" }}>
                <ClipboardList size={22} style={{ color: "var(--gold)" }} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">Questionário</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
                Responda 5 perguntas sobre seu humor e preferências. A IA cria um perfil cinematográfico único para você.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--gold)" }}>
                Começar <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Chat */}
            <button onClick={() => { setTela("chat"); setMensagens([]); }}
              className="glass rounded-2xl p-8 text-left group transition-all hover:scale-[1.02]"
              style={{ animationDelay: "0.2s" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all group-hover:scale-110"
                style={{ background: "linear-gradient(135deg, rgba(192,57,43,0.2), rgba(231,76,60,0.1))", border: "1px solid rgba(192,57,43,0.3)" }}>
                <MessageCircle size={22} style={{ color: "var(--red-light)" }} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">Chat com IA</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
                Descreva em suas palavras o filme que você quer assistir. Quanto mais detalhes, melhores as sugestões.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--red-light)" }}>
                Abrir chat <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* Stats bar */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[["25M+", "Avaliações"], ["62K", "Filmes"], ["IA", "Groq LLaMA"]].map(([val, label]) => (
              <div key={label} className="glass rounded-xl p-4 text-center">
                <div className="font-display text-2xl font-bold mb-1 text-shimmer">{val}</div>
                <div className="text-xs" style={{ color: "var(--text-dim)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );

  // ═══════════════════════════════
  // TELA QUESTIONÁRIO
  // ═══════════════════════════════
  if (tela === "questionario") return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--noir)" }}>
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 pt-20">
        {loading ? (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: "var(--gold)" }} />
            </div>
            <p className="font-display text-xl mb-2">Analisando seu perfil...</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>A IA está selecionando os filmes perfeitos para você</p>
          </div>
        ) : (
          <div className="w-full max-w-lg animate-fade-up">
            {/* Progress */}
            <div className="flex gap-1.5 mb-10">
              {PERGUNTAS.map((_, i) => (
                <div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-500"
                  style={{ background: i <= perguntaAtual ? "var(--gold)" : "rgba(255,255,255,0.1)" }} />
              ))}
            </div>

            <p className="text-xs mb-3 tracking-widest" style={{ color: "var(--text-dim)", fontFamily: "'DM Mono', monospace" }}>
              PERGUNTA {perguntaAtual + 1} DE {PERGUNTAS.length}
            </p>
            <h2 className="font-display text-3xl font-bold mb-10">{PERGUNTAS[perguntaAtual].pergunta}</h2>

            <div className="space-y-3">
              {PERGUNTAS[perguntaAtual].opcoes.map((opcao, i) => (
                <button key={opcao} onClick={() => responderPergunta(opcao)}
                  className="glass w-full px-6 py-4 rounded-xl text-left text-sm font-medium group transition-all hover:scale-[1.01]"
                  style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-center justify-between">
                    <span>{opcao}</span>
                    <ChevronRight size={14} style={{ color: "var(--text-dim)" }} className="group-hover:translate-x-1 group-hover:text-gold transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );

  // ═══════════════════════════════
  // TELA CHAT
  // ═══════════════════════════════
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--noir)" }}>
      <Header />
      <main className="flex-1 pt-20 pb-32 px-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          {mensagens.length === 0 && (
            <div className="text-center py-16 animate-fade-up">
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.2)" }}>
                <MessageCircle size={26} style={{ color: "var(--red-light)" }} />
              </div>
              <h2 className="font-display text-2xl font-bold mb-3">O que você quer assistir?</h2>
              <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>Descreva o filme dos seus sonhos com o máximo de detalhes</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Um faroeste com humor e reviravoltas", "Drama familiar emocionante anos 80", "Ficção científica filosófica", "Thriller psicológico tenso"].map(s => (
                  <button key={s} onClick={() => setInputChat(s)}
                    className="text-xs px-4 py-2 rounded-full transition-all hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mensagens.map((msg, i) => (
            <div key={i} className="animate-fade-up">
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-sm px-5 py-3.5 rounded-2xl rounded-tr-sm text-sm"
                    style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.15)", color: "var(--text)" }}>
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div>
                  {msg.content && (
                    <p className="text-sm mb-5 flex items-start gap-2" style={{ color: "var(--text-muted)" }}>
                      <Film size={14} className="mt-0.5 shrink-0" style={{ color: "var(--gold)" }} />
                      {msg.content}
                    </p>
                  )}
                  {msg.filmes && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {msg.filmes.map((filme, j) => (
                        <div key={j} className="glass rounded-xl p-5 hover:scale-[1.01] transition-all group">
                          <h4 className="font-display text-base font-bold mb-2 leading-snug group-hover:text-shimmer transition-all">
                            {filme.title}
                          </h4>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {filme.genres.split("|").slice(0, 3).map(g => (
                              <span key={g} className="text-[10px] px-2 py-0.5 rounded-full font-mono tracking-wide"
                                style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", color: "var(--gold)" }}>
                                {g}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{filme.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 animate-fade-in" style={{ color: "var(--text-muted)" }}>
              <Loader2 size={14} className="animate-spin" style={{ color: "var(--gold)" }} />
              <span className="text-sm">Buscando recomendações...</span>
            </div>
          )}
        </div>
      </main>

      {/* Input fixo */}
      <div className="fixed bottom-0 left-0 right-0 p-6" style={{ background: "linear-gradient(to top, var(--noir) 70%, transparent)" }}>
        <div className="max-w-3xl mx-auto flex gap-3">
          <input type="text" value={inputChat}
            onChange={e => setInputChat(e.target.value)}
            onKeyDown={e => e.key === "Enter" && enviarChat()}
            placeholder="Ex: quero um drama histórico épico com batalhas..."
            className="noir-input flex-1 px-5 py-4 rounded-xl text-sm" />
          <button onClick={enviarChat} disabled={!inputChat.trim() || loading}
            className="btn-gold px-5 py-4 rounded-xl flex items-center gap-2 text-sm font-semibold">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}