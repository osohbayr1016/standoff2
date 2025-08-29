import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/squads${
      queryString ? `?${queryString}` : ""
    }`;

    const authorization = request.headers.get("authorization");
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authorization && { Authorization: authorization }),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching squads:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch squads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/squads`, {
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
    console.error("Error creating squad:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create squad" },
      { status: 500 }
    );
  }
}
