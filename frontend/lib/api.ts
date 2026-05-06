const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getRecomendacoes(userId: number, n: number = 10) {
    const res = await fetch(`${API_URL}/api/v1/recomendacoes/${userId}?n=${n}`);
    if (!res.ok) throw new Error("Usuário não encontrado");
    return res.json();
}

export async function getFilmesAvaliados(userId: number, n: number = 10) {
    const res = await fetch(`${API_URL}/api/v1/usuarios/${userId}/filmes-avaliados?n=${n}`);
    if (!res.ok) throw new Error("Usuário não encontrado");
    return res.json();
}

export async function buscarFilmes(query: string) {
    const res = await fetch(`${API_URL}/api/v1/filmes/buscar?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Erro na busca");
    return res.json();
}

export async function getFilmesPopulares() {
    const res = await fetch(`${API_URL}/api/v1/filmes/populares`);
    if (!res.ok) throw new Error("Erro ao buscar filmes populares");
    return res.json();
}