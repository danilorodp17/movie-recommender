import { NextRequest, NextResponse } from "next/server";

const API_URL = "http://localhost:8000";

export async function GET(req: NextRequest) {
    const token = req.headers.get("authorization");
    const res = await fetch(`${API_URL}/api/v1/historico`, {
        headers: { Authorization: token || "" },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
    const token = req.headers.get("authorization");
    const body = await req.json();
    const res = await fetch(`${API_URL}/api/v1/historico`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token || "" },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}