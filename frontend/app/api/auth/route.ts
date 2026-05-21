import { NextRequest, NextResponse } from "next/server";

const API_URL = "http://localhost:8000";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const url = req.nextUrl.searchParams.get("endpoint") || "login";

    const res = await fetch(`${API_URL}/api/v1/auth/${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}