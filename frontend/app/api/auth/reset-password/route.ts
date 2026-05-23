import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const res = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        return NextResponse.json({ detail: "Erro interno" }, { status: 500 });
    }
}