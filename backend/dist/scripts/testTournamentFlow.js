"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_BASE = process.env.API_BASE || "http://localhost:8000";
async function request(method, path, body, token) {
    try {
        const headers = {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        if (body !== undefined) {
            headers["Content-Type"] = "application/json";
        }
        const res = await axios_1.default.request({
            method: method,
            url: `${API_BASE}${path}`,
            headers,
            data: body,
            validateStatus: () => true,
        });
        return {
            status: res.status,
            ok: res.status >= 200 && res.status < 300,
            json: res.data,
        };
    }
    catch (e) {
        return {
            status: e?.response?.status || 500,
            ok: false,
            json: e?.response?.data || { error: e?.message },
        };
    }
}
async function main() {
    console.log("\n=== E2E Tournament Flow Test ===\n");
    const userAEmail = `playerA_${Date.now()}@test.com`;
    const userBEmail = `playerB_${Date.now()}@test.com`;
    const regA = await request("POST", "/api/auth/register", {
        name: "Player A",
        email: userAEmail,
        password: "Password123!",
        role: "PLAYER",
    });
    if (!regA.ok)
        throw new Error(`Register A failed: ${JSON.stringify(regA.json)}`);
    const userAId = regA.json.user.id ||
        regA.json.user._id ||
        regA.json.userId ||
        regA.json.user?.id;
    const tokenA = regA.json.token;
    console.log("User A:", userAId);
    const regB = await request("POST", "/api/auth/register", {
        name: "Player B",
        email: userBEmail,
        password: "Password123!",
        role: "PLAYER",
    });
    if (!regB.ok)
        throw new Error(`Register B failed: ${JSON.stringify(regB.json)}`);
    const userBId = regB.json.user.id ||
        regB.json.user._id ||
        regB.json.userId ||
        regB.json.user?.id;
    const tokenB = regB.json.token;
    console.log("User B:", userBId);
    const squad1 = await request("POST", "/api/squads", {
        name: `Alpha ${Date.now()}`,
        tag: `ALP${Math.floor(Math.random() * 1000)}`,
        leader: userAId,
        game: "Mobile Legends: Bang Bang",
        maxMembers: 5,
    });
    if (!squad1.ok)
        throw new Error(`Create squad1 failed: ${JSON.stringify(squad1.json)}`);
    const squad1Id = squad1.json.squad?._id || squad1.json.squad?.id;
    console.log("Squad 1:", squad1Id);
    const squad2 = await request("POST", "/api/squads", {
        name: `Bravo ${Date.now()}`,
        tag: `BRV${Math.floor(Math.random() * 1000)}`,
        leader: userBId,
        game: "Mobile Legends: Bang Bang",
        maxMembers: 5,
    });
    if (!squad2.ok)
        throw new Error(`Create squad2 failed: ${JSON.stringify(squad2.json)}`);
    const squad2Id = squad2.json.squad?._id || squad2.json.squad?.id;
    console.log("Squad 2:", squad2Id);
    const start = new Date(Date.now() + 60 * 60 * 1000);
    const end = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const regDeadline = new Date(Date.now() + 30 * 60 * 1000);
    const tournament = await request("POST", "/api/tournaments", {
        name: `Test Cup ${Date.now()}`,
        description: "E2E test tournament",
        game: "Mobile Legends: Bang Bang",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        prizePool: 100000,
        prizeDistribution: {
            firstPlace: 60000,
            secondPlace: 30000,
            thirdPlace: 10000,
        },
        maxSquads: 16,
        maxParticipants: 16,
        location: "Online",
        organizer: "Test Org",
        organizerLogo: "",
        registrationDeadline: regDeadline.toISOString(),
        entryFee: 5000,
        format: "Single Elimination",
    });
    if (!tournament.ok)
        throw new Error(`Create tournament failed: ${JSON.stringify(tournament.json)}`);
    const tournamentId = tournament.json.tournament?._id || tournament.json.tournament?.id;
    console.log("Tournament:", tournamentId);
    const openRes = await request("PUT", `/api/tournaments/${tournamentId}`, {
        status: "registration_open",
    });
    if (!openRes.ok)
        throw new Error(`Open registration failed: ${JSON.stringify(openRes.json)}`);
    const reg1 = await request("POST", `/api/tournaments/${tournamentId}/register`, {
        squadId: squad1Id,
        entryFee: 5000,
        currency: "MNT",
    });
    if (!reg1.ok)
        throw new Error(`Register squad1 failed: ${JSON.stringify(reg1.json)}`);
    const reg2 = await request("POST", `/api/tournaments/${tournamentId}/register`, {
        squadId: squad2Id,
        entryFee: 5000,
        currency: "MNT",
    });
    if (!reg2.ok)
        throw new Error(`Register squad2 failed: ${JSON.stringify(reg2.json)}`);
    const closeRes = await request("PUT", `/api/tournaments/${tournamentId}`, {
        status: "registration_closed",
    });
    if (!closeRes.ok)
        throw new Error(`Close registration failed: ${JSON.stringify(closeRes.json)}`);
    const startRes = await request("POST", `/api/tournaments/${tournamentId}/start`, {});
    if (!startRes.ok)
        throw new Error(`Start tournament failed: ${JSON.stringify(startRes.json)}`);
    const matchesRes = await request("GET", `/api/tournament-matches/tournament/${tournamentId}`);
    if (!matchesRes.ok)
        throw new Error(`Get matches failed: ${JSON.stringify(matchesRes.json)}`);
    const matches = matchesRes.json.matches || [];
    if (!matches.length)
        throw new Error("No matches generated");
    const match = matches[0];
    console.log(`Generated ${matches.length} matches. Using match ${match._id}`);
    const winnerId = match.squad1?._id || match.squad1;
    const loserId = match.squad2?._id || match.squad2;
    const resultRes = await request("PUT", `/api/tournament-matches/${match._id}/result`, {
        winnerId,
        loserId,
        score: { squad1Score: 2, squad2Score: 0 },
        adminNotes: "E2E test result",
    });
    if (!resultRes.ok)
        throw new Error(`Submit result failed: ${JSON.stringify(resultRes.json)}`);
    console.log("Match result updated. Bounty coin logic should be processed.");
    const squad1Coins = await request("GET", `/api/bounty-coins/squad/${squad1Id}`);
    const squad2Coins = await request("GET", `/api/bounty-coins/squad/${squad2Id}`);
    console.log("Squad 1 bounty:", squad1Coins.json);
    console.log("Squad 2 bounty:", squad2Coins.json);
    const statsRes = await request("GET", `/api/tournament-matches/tournament/${tournamentId}/stats`);
    console.log("Stats:", statsRes.json);
    console.log("\n✅ E2E Tournament Flow Completed\n");
}
main().catch((err) => {
    console.error("❌ Flow failed:", err);
    process.exit(1);
});
