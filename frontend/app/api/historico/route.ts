import { NextRequest, NextResponse } from "next/server";

const API_URL = "http://localhost:8000";

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        const res = await fetch(`${API_URL}/api/v1/historico`, {
            method: "GET",
            headers: {
                "Authorization": authHeader || "",
                "Content-Type": "application/json"
            },
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : [];
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("Erro histórico GET:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        const body = await req.json();
        const res = await fetch(`${API_URL}/api/v1/historico`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader || ""
            },
            body: JSON.stringify(body),
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("Erro histórico POST:", error);
        return NextResponse.json({ detail: "Erro interno" }, { status: 500 });
    }
}