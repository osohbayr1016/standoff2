import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization && { Authorization: authorization }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send message" },
      { status: 500 }
    );
  }
}
