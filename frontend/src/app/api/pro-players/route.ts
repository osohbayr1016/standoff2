import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/pro-players${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    // Fallback to mock data if backend is not available
    const mockProPlayers = [
      {
        _id: "1",
        userId: {
          _id: "user1",
          name: "ProGamer123",
          email: "progamer123@example.com",
          avatar: null,
        },
        game: "Mobile Legends: Bang Bang",
        currentRank: "Epic",
        targetRank: "Mythic",
        price: 50000,
        estimatedTime: "3-5 days",
        description:
          "Professional MLBB booster with 3 years of experience. Fast and reliable service.",
        rating: 4.8,
        totalReviews: 156,
        totalBoosts: 89,
        successfulBoosts: 87,
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "2",
        userId: {
          _id: "user2",
          name: "MLBB_Champion",
          email: "mlbbchampion@example.com",
          avatar: null,
        },
        game: "Mobile Legends: Bang Bang",
        currentRank: "Legend",
        targetRank: "Mythic",
        price: 75000,
        estimatedTime: "5-7 days",
        description:
          "Top-rated MLBB booster with excellent win rate and customer satisfaction.",
        rating: 4.9,
        totalReviews: 234,
        totalBoosts: 156,
        successfulBoosts: 154,
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "3",
        userId: {
          _id: "user3",
          name: "GamingPro",
          email: "gamingpro@example.com",
          avatar: null,
        },
        game: "Mobile Legends: Bang Bang",
        currentRank: "Grandmaster",
        targetRank: "Legend",
        price: 35000,
        estimatedTime: "2-3 days",
        description:
          "Fast and efficient boosting service with 24/7 availability.",
        rating: 4.7,
        totalReviews: 89,
        totalBoosts: 67,
        successfulBoosts: 65,
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "4",
        userId: {
          _id: "user4",
          name: "EsportsElite",
          email: "esportselite@example.com",
          avatar: null,
        },
        game: "Mobile Legends: Bang Bang",
        currentRank: "Epic",
        targetRank: "Mythic",
        price: 60000,
        estimatedTime: "4-6 days",
        description:
          "Professional esports player offering premium boosting services.",
        rating: 4.9,
        totalReviews: 198,
        totalBoosts: 134,
        successfulBoosts: 132,
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "5",
        userId: {
          _id: "user5",
          name: "RisingStar",
          email: "risingstar@example.com",
          avatar: null,
        },
        game: "Mobile Legends: Bang Bang",
        currentRank: "Master",
        targetRank: "Epic",
        price: 25000,
        estimatedTime: "1-2 days",
        description:
          "New but promising booster with competitive rates and quick service.",
        rating: 4.6,
        totalReviews: 45,
        totalBoosts: 32,
        successfulBoosts: 30,
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      proPlayers: mockProPlayers,
      pagination: {
        page: 1,
        limit: 10,
        total: mockProPlayers.length,
        hasMore: false,
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authorization = request.headers.get("authorization");

    const response = await fetch(`${BACKEND_URL}/api/pro-players`, {
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
    console.error("Proxy error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const authorization = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/pro-players${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(authorization && { Authorization: authorization }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/pro-players${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authorization && { Authorization: authorization }),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
