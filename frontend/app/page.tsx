"use client";

import { useState, useEffect, useRef } from "react";
import {
  Film, MessageCircle, ClipboardList, Send, Loader2,
  LogOut, X, ChevronRight, Sparkles, History
} from "lucide-react";

interface Filme { title: string; genres: string; reason: string; }
interface Mensagem { role: "user" | "assistant"; content: string; filmes?: Filme[]; }
interface UserData { id: number; name: string; email: string; token: string; }

const PERGUNTAS = [
  { id: "humor", emoji: "🎭", pergunta: "Como você está se sentindo agora?", opcoes: ["Animado e cheio de energia", "Tranquilo e relaxado", "Pensativo e reflexivo", "Melancólico"] },
  { id: "genero", emoji: "🎬", pergunta: "Que tipo de história te atrai?", opcoes: ["Aventura e ação intensa", "Romance e drama humano", "Suspense e mistério", "Comédia e leveza"] },
  { id: "epoca", emoji: "📅", pergunta: "Prefere filmes de qual época?", opcoes: ["Clássicos (antes dos 90)", "Anos 90 e 2000", "Produções recentes", "Sem preferência"] },
  { id: "ambiente", emoji: "🌍", pergunta: "Qual cenário te fascina mais?", opcoes: ["Espaço e ficção científica", "Natureza e campo aberto", "Cidade e vida urbana", "Épocas históricas"] },
  { id: "final", emoji: "✨", pergunta: "Como quer se sentir ao terminar?", opcoes: ["Inspirado e motivado", "Emocionado e tocado", "Intrigado e reflexivo", "Leve e bem-humorado"] },
];

const SUGESTOES = [
  "Um thriller psicológico com reviravolta absurda",
  "Drama familiar emocionante anos 80",
  "Ficção científica filosófica e profunda",
  "Faroeste com humor e personagens marcantes",
  "Romance em ambiente europeu anos 60",
  "Terror atmosférico sem jump scares",
];

async function apiRequest(url: string, options: RequestInit = {}) {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options.headers } });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.detail || "Erro na requisição");
  return data;
}

async function pedirRecomendacao(prompt: string) {
  const res = await fetch("/api/recomendar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
  return res.json();
}

export default function App() {
  const [tela, setTela] = useState<"auth" | "home" | "quiz" | "chat">("auth");
  const [authMode, setAuthMode] = useState<"login" | "cadastro" | "reset">("login");
  const [user, setUser] = useState<UserData | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<any[]>([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("cinematch_user");
    if (saved) { setUser(JSON.parse(saved)); setTela("home"); }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function handleAuth() {
    setAuthError(""); setAuthLoading(true);
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/cadastro";
      const body = authMode === "login" ? { email: form.email, password: form.password } : form;
      const data = await apiRequest(endpoint, { method: "POST", body: JSON.stringify(body) });
      const userData = { ...data.user, token: data.access_token };
      setUser(userData);
      localStorage.setItem("cinematch_user", JSON.stringify(userData));
      setTela("home");
    } catch {
      setAuthError(authMode === "login" ? "Email ou senha incorretos" : "Erro ao criar conta. Tente outro email.");
    } finally { setAuthLoading(false); }
  }

  async function handleReset() {
    setAuthError(""); setAuthLoading(true);
    try {
      await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email: form.email, nova_senha: form.password })
      });
      setAuthMode("login");
      setForm({ ...form, password: "" });
      alert("Senha alterada com sucesso! Faça login com a nova senha.");
    } catch {
      setAuthError("Email não encontrado. Verifique e tente novamente.");
    } finally { setAuthLoading(false); }
  }

  function logout() {
    localStorage.removeItem("cinematch_user");
    setUser(null); setTela("auth"); setMensagens([]); setRespostas({}); setQuizStep(0);
  }

  async function carregarHistorico() {
    if (!user) return;
    try {
      const data = await apiRequest("/api/historico", { headers: { Authorization: `Bearer ${user.token}` } });
      setHistorico(Array.isArray(data) ? data : []);
      setShowHistorico(true);
    } catch { setHistorico([]); setShowHistorico(true); }
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

  async function responderQuiz(opcao: string) {
    const q = PERGUNTAS[quizStep];
    const novas = { ...respostas, [q.id]: opcao };
    setRespostas(novas);
    if (quizStep < PERGUNTAS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      setLoading(true);
      const prompt = `Perfil: humor "${novas.humor}", gosta de "${novas.genero}", época "${novas.epoca}", cenário "${novas.ambiente}", quer se sentir "${novas.final}". Recomende filmes perfeitos.`;
      const result = await pedirRecomendacao(prompt);
      setMensagens([{ role: "assistant", content: result.texto, filmes: result.filmes }]);
      await salvarHistorico("questionário", prompt, result.filmes);
      setTela("chat");
      setLoading(false);
    }
  }

  async function enviarChat() {
    if (!input.trim() || loading) return;
    const msg: Mensagem = { role: "user", content: input };
    const novas = [...mensagens, msg];
    setMensagens(novas); setInput(""); setLoading(true);
    const result = await pedirRecomendacao(input);
    setMensagens([...novas, { role: "assistant", content: result.texto, filmes: result.filmes }]);
    await salvarHistorico("chat", input, result.filmes);
    setLoading(false);
  }

  function resetar() { setTela("home"); setMensagens([]); setRespostas({}); setQuizStep(0); setShowHistorico(false); }

  // ═══════════════════════
  // AUTH
  // ═══════════════════════
  if (tela === "auth") return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative overflow-hidden" style={{ background: "var(--surface)" }}>
        <div className="orb w-96 h-96 top-0 left-0 opacity-20" style={{ background: "var(--accent)" }} />
        <div className="orb w-64 h-64 bottom-20 right-10 opacity-10" style={{ background: "var(--gold)" }} />

        <div className="relative z-10 fade-up" style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--accent), #9b8cf9)" }}>
              <Film size={18} color="white" />
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 600 }}>CineMatch</span>
          </div>
        </div>

        <div className="relative z-10" style={{ textAlign: "center" }}>
          <p className="fade-up-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--accent2)", letterSpacing: "0.15em", marginBottom: "24px" }}>
            INTELIGÊNCIA ARTIFICIAL CINEMATOGRÁFICA
          </p>
          <h2 className="fade-up-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "52px", fontWeight: 300, lineHeight: 1.15, color: "var(--text)", marginBottom: "24px" }}>
            Descubra filmes<br />
            <em style={{ color: "var(--accent2)" }}>feitos para você</em>
          </h2>
          <p className="fade-up-3" style={{ fontSize: "15px", color: "var(--text2)", lineHeight: 1.7, maxWidth: "360px", margin: "0 auto" }}>
            Nossa IA analisa seu humor, preferências e momento para recomendar experiências cinematográficas únicas.
          </p>
        </div>

        <div className="relative z-10 fade-up-3 grid grid-cols-3 gap-4" style={{ marginBottom: "40px" }}>
          {[["25M+", "avaliações"], ["62K", "filmes"], ["LLaMA 3", "IA"]].map(([v, l]) => (
            <div key={l} className="glass rounded-2xl p-4 text-center">
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", fontWeight: 600, color: "var(--accent2)" }}>{v}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--text3)", letterSpacing: "0.1em", marginTop: "4px" }}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm fade-up">
          <div className="lg:hidden text-center mb-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, var(--accent), #9b8cf9)" }}>
              <Film size={22} color="white" />
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 600 }}>CineMatch</h1>
          </div>

          <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
            {authMode === "login" ? "Bem-vindo de volta" : authMode === "cadastro" ? "Criar sua conta" : "Redefinir senha"}
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text2)", marginBottom: "32px" }}>
            {authMode === "login" ? "Entre para ver suas recomendações" : authMode === "cadastro" ? "Comece a descobrir filmes incríveis" : "Digite seu email e uma nova senha"}
          </p>

          {/* Tabs */}
          {authMode !== "reset" && (
            <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: "var(--surface2)" }}>
              {(["login", "cadastro"] as const).map(m => (
                <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); }}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: authMode === m ? "var(--surface)" : "transparent",
                    color: authMode === m ? "var(--text)" : "var(--text3)",
                    boxShadow: authMode === m ? "0 1px 4px rgba(0,0,0,0.3)" : "none"
                  }}>
                  {m === "login" ? "Entrar" : "Cadastrar"}
                </button>
              ))}
            </div>
          )}

          {authMode === "reset" && (
            <div style={{ marginBottom: "24px" }}>
              <button onClick={() => { setAuthMode("login"); setAuthError(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "var(--accent2)", display: "flex", alignItems: "center", gap: "6px" }}>
                ← Voltar ao login
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {authMode === "reset" && (
              <div style={{ padding: "16px", borderRadius: "12px", background: "var(--accent-glow)", border: "1px solid rgba(124,106,247,0.2)" }}>
                <p style={{ fontSize: "13px", color: "var(--accent2)", lineHeight: 1.6 }}>
                  Digite seu email cadastrado e escolha uma nova senha. A alteração é imediata.
                </p>
              </div>
            )}

            {authMode === "cadastro" && (
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text2)", marginBottom: "8px", fontWeight: 500 }}>Nome</label>
                <input type="text" placeholder="Seu nome completo" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field" style={{ padding: "12px 16px", borderRadius: "12px" }} />
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text2)", marginBottom: "8px", fontWeight: 500 }}>Email</label>
              <input type="email" placeholder="seu@email.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onKeyDown={e => e.key === "Enter" && (authMode === "reset" ? handleReset() : handleAuth())}
                className="input-field" style={{ padding: "12px 16px", borderRadius: "12px" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text2)", marginBottom: "8px", fontWeight: 500 }}>
                {authMode === "reset" ? "Nova senha" : "Senha"}
              </label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === "Enter" && (authMode === "reset" ? handleReset() : handleAuth())}
                className="input-field" style={{ padding: "12px 16px", borderRadius: "12px" }} />
            </div>

            {authError && (
              <div style={{ background: "rgba(240,96,96,0.08)", border: "1px solid rgba(240,96,96,0.2)", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", color: "var(--red)", textAlign: "center" }}>
                {authError}
              </div>
            )}

            <button onClick={authMode === "reset" ? handleReset : handleAuth} disabled={authLoading}
              className="btn-primary" style={{ padding: "14px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {authLoading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
              {authLoading ? "Aguarde..." : authMode === "login" ? "Entrar" : authMode === "cadastro" ? "Criar conta" : "Redefinir senha"}
            </button>

            {authMode === "login" && (
              <button onClick={() => { setAuthMode("reset"); setAuthError(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "var(--text3)", textAlign: "center", width: "100%", marginTop: "4px", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--accent2)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text3)")}>
                Esqueceu sua senha?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════
  // HEADER
  // ═══════════════════════
  const Header = () => (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 24px", height: "64px",
      display: "flex", alignItems: "center", gap: "16px",
      background: "rgba(5,5,10,0.8)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)"
    }}>
      <button onClick={resetar} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", background: "none", border: "none" }}>
        <div style={{ width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, var(--accent), #9b8cf9)" }}>
          <Film size={15} color="white" />
        </div>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", fontWeight: 600, color: "var(--text)" }}>CineMatch</span>
      </button>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
        <button onClick={carregarHistorico} className="btn-secondary" style={{ padding: "8px 14px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <History size={13} /> Histórico
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "10px", background: "var(--surface2)", border: "1px solid var(--border)" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--gold))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "white" }}>{user?.name[0].toUpperCase()}</span>
          </div>
          <span style={{ fontSize: "13px", color: "var(--text2)" }}>{user?.name}</span>
        </div>
        <button onClick={logout} className="btn-secondary" style={{ padding: "8px", borderRadius: "10px" }}>
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );

  // ═══════════════════════
  // MODAL HISTÓRICO
  // ═══════════════════════
  const ModalHistorico = () => (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="glass fade-in" style={{ borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "520px", maxHeight: "70vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: 600 }}>Histórico</h3>
            <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "2px" }}>{historico.length} pesquisas salvas</p>
          </div>
          <button onClick={() => setShowHistorico(false)} className="btn-secondary" style={{ padding: "8px", borderRadius: "10px" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          {historico.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text3)" }}>
              <History size={32} style={{ margin: "0 auto 12px" }} />
              <p>Nenhuma pesquisa ainda</p>
            </div>
          ) : historico.map((h, i) => (
            <div key={i} className="glass" style={{ borderRadius: "14px", padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "var(--accent-glow)", color: "var(--accent2)", border: "1px solid rgba(124,106,247,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {h.tipo}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text3)", marginLeft: "auto" }}>
                  {new Date(h.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text2)", lineHeight: 1.5 }}>{h.prompt.slice(0, 120)}...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════
  // HOME
  // ═══════════════════════
  if (tela === "home") return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Header />
      {showHistorico && <ModalHistorico />}

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "100px 24px 60px" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: "72px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "20px", background: "var(--accent-glow)", border: "1px solid rgba(124,106,247,0.2)", marginBottom: "24px" }}>
            <Sparkles size={13} style={{ color: "var(--accent2)" }} />
            <span style={{ fontSize: "12px", color: "var(--accent2)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}>
              IA PERSONALIZADA
            </span>
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 300, lineHeight: 1.15, marginBottom: "20px" }}>
            Olá, <em style={{ fontStyle: "italic", color: "var(--accent2)" }}>{user?.name}</em><br />
            <span className="text-gradient" style={{ fontWeight: 600 }}>O que vamos assistir?</span>
          </h1>

          <p style={{ fontSize: "16px", color: "var(--text2)", maxWidth: "440px", margin: "0 auto", lineHeight: 1.7 }}>
            Escolha como prefere descobrir seu próximo filme favorito
          </p>
        </div>

        <div className="fade-up-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "60px" }}>
          <button onClick={() => { setTela("quiz"); setQuizStep(0); setRespostas({}); }}
            className="card-hover glass" style={{ borderRadius: "24px", padding: "36px", textAlign: "left", cursor: "pointer", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", borderRadius: "50%", background: "radial-gradient(circle, rgba(240,192,96,0.1), transparent)", pointerEvents: "none" }} />
            <div style={{ width: "52px", height: "52px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", background: "linear-gradient(135deg, rgba(240,192,96,0.15), rgba(245,208,128,0.05))", border: "1px solid rgba(240,192,96,0.2)" }}>
              <ClipboardList size={24} style={{ color: "var(--gold)" }} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "10px" }}>Questionário</h3>
            <p style={{ fontSize: "14px", color: "var(--text2)", lineHeight: 1.6, marginBottom: "24px" }}>
              Responda 5 perguntas sobre seu humor e preferências. A IA cria um perfil único e recomenda os filmes certos.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--gold)", fontWeight: 600 }}>
              Começar questionário <ChevronRight size={14} />
            </div>
            <div style={{ display: "flex", gap: "6px", marginTop: "20px" }}>
              {PERGUNTAS.map((_, i) => (
                <div key={i} style={{ height: "3px", flex: 1, borderRadius: "2px", background: "rgba(240,192,96,0.2)" }} />
              ))}
            </div>
          </button>

          <button onClick={() => { setTela("chat"); setMensagens([]); }}
            className="card-hover glass" style={{ borderRadius: "24px", padding: "36px", textAlign: "left", cursor: "pointer", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,106,247,0.1), transparent)", pointerEvents: "none" }} />
            <div style={{ width: "52px", height: "52px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", background: "linear-gradient(135deg, rgba(124,106,247,0.15), rgba(154,140,249,0.05))", border: "1px solid rgba(124,106,247,0.2)" }}>
              <MessageCircle size={24} style={{ color: "var(--accent2)" }} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "10px" }}>Chat com IA</h3>
            <p style={{ fontSize: "14px", color: "var(--text2)", lineHeight: 1.6, marginBottom: "24px" }}>
              Descreva em suas palavras o filme perfeito. A IA entende seu pedido e encontra as melhores opções para você.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--accent2)", fontWeight: 600 }}>
              Abrir chat <ChevronRight size={14} />
            </div>
            <div style={{ marginTop: "20px", padding: "12px 14px", borderRadius: "12px", background: "rgba(124,106,247,0.06)", border: "1px solid rgba(124,106,247,0.1)" }}>
              <p style={{ fontSize: "12px", color: "var(--text3)", fontFamily: "'JetBrains Mono', monospace" }}>
                "Quero um thriller psicológico tenso..."
              </p>
            </div>
          </button>
        </div>

        <div className="fade-up-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {[["25M+", "Avaliações analisadas", "var(--accent2)"], ["62K", "Filmes no banco", "var(--gold)"], ["LLaMA 3.1", "Modelo de IA", "var(--red)"]].map(([v, l, c]) => (
            <div key={l} className="glass" style={{ borderRadius: "16px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 700, color: c as string }}>{v}</div>
              <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "4px", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  // ═══════════════════════
  // QUIZ
  // ═══════════════════════
  if (tela === "quiz") return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Header />
      {showHistorico && <ModalHistorico />}

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px 40px" }}>
        {loading ? (
          <div className="fade-in" style={{ textAlign: "center" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent", margin: "0 auto 24px", animation: "spin-slow 1s linear infinite" }} />
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 400, marginBottom: "8px" }}>Analisando seu perfil...</h3>
            <p style={{ fontSize: "14px", color: "var(--text2)" }}>A IA está selecionando os filmes perfeitos para você</p>
          </div>
        ) : (
          <div className="fade-up" style={{ width: "100%", maxWidth: "560px" }}>
            <div style={{ display: "flex", gap: "6px", marginBottom: "48px" }}>
              {PERGUNTAS.map((_, i) => (
                <div key={i} style={{ height: "3px", flex: 1, borderRadius: "2px", transition: "all 0.4s ease", background: i <= quizStep ? "var(--accent)" : "rgba(255,255,255,0.08)" }} />
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span style={{ fontSize: "28px" }}>{PERGUNTAS[quizStep].emoji}</span>
              <span style={{ fontSize: "12px", color: "var(--text3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>
                {quizStep + 1} / {PERGUNTAS.length}
              </span>
            </div>

            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, marginBottom: "40px", lineHeight: 1.3 }}>
              {PERGUNTAS[quizStep].pergunta}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {PERGUNTAS[quizStep].opcoes.map((opcao) => (
                <button key={opcao} onClick={() => responderQuiz(opcao)}
                  className="glass card-hover" style={{ padding: "18px 22px", borderRadius: "16px", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "15px", fontWeight: 500 }}>{opcao}</span>
                  <ChevronRight size={16} style={{ color: "var(--text3)" }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );

  // ═══════════════════════
  // CHAT
  // ═══════════════════════
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Header />
      {showHistorico && <ModalHistorico />}

      <main style={{ flex: 1, paddingTop: "80px", paddingBottom: "100px", overflowY: "auto" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "24px" }}>
          {mensagens.length === 0 && (
            <div className="fade-up" style={{ textAlign: "center", padding: "60px 0 40px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "var(--accent-glow)", border: "1px solid rgba(124,106,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Sparkles size={28} style={{ color: "var(--accent2)" }} />
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 400, marginBottom: "10px" }}>
                Descreva o filme ideal
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text2)", marginBottom: "32px" }}>
                Quanto mais detalhes você der, melhores serão as recomendações
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                {SUGESTOES.map(s => (
                  <button key={s} onClick={() => setInput(s)}
                    className="btn-secondary" style={{ padding: "8px 16px", borderRadius: "20px", fontSize: "12px" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {mensagens.map((msg, i) => (
              <div key={i} className="fade-in">
                {msg.role === "user" ? (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ maxWidth: "480px", padding: "14px 18px", borderRadius: "18px 18px 4px 18px", background: "rgba(124,106,247,0.12)", border: "1px solid rgba(124,106,247,0.15)", fontSize: "15px", lineHeight: 1.6 }}>
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div>
                    {msg.content && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, var(--accent), #9b8cf9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Film size={13} color="white" />
                        </div>
                        <p style={{ fontSize: "14px", color: "var(--text2)", lineHeight: 1.6, paddingTop: "4px" }}>{msg.content}</p>
                      </div>
                    )}
                    {msg.filmes && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                        {msg.filmes.map((filme, j) => (
                          <div key={j} className="glass card-hover" style={{ borderRadius: "18px", padding: "20px" }}>
                            <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 600, lineHeight: 1.3, marginBottom: "10px" }}>
                              {filme.title}
                            </h4>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                              {filme.genres.split("|").slice(0, 3).map(g => (
                                <span key={g} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "20px", background: "var(--accent-glow)", color: "var(--accent2)", border: "1px solid rgba(124,106,247,0.15)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}>
                                  {g}
                                </span>
                              ))}
                            </div>
                            <p style={{ fontSize: "12px", color: "var(--text2)", lineHeight: 1.6 }}>{filme.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="fade-in" style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text3)" }}>
                <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent)" }} />
                <span style={{ fontSize: "13px" }}>Buscando recomendações...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </main>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 24px 24px", background: "linear-gradient(to top, var(--bg) 60%, transparent)" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "10px" }}>
          <input type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && enviarChat()}
            placeholder="Descreva o filme que você quer assistir..."
            className="input-field" style={{ flex: 1, padding: "14px 18px", borderRadius: "14px", fontSize: "14px" }} />
          <button onClick={enviarChat} disabled={!input.trim() || loading}
            className="btn-primary" style={{ padding: "14px 20px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}