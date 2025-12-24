"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var LobbyStatus;
(function (LobbyStatus) {
    LobbyStatus["OPEN"] = "open";
    LobbyStatus["FULL"] = "full";
    LobbyStatus["PLAYING"] = "playing";
    LobbyStatus["ALL_READY"] = "all_ready";
    LobbyStatus["CANCELLED"] = "cancelled";
    LobbyStatus["MAP_BAN_PHASE"] = "map_ban_phase";
    LobbyStatus["READY_PHASE"] = "ready_phase";
    LobbyStatus["RESULT_SUBMITTED"] = "result_submitted";
})(LobbyStatus || (exports.LobbyStatus = LobbyStatus = {}));
const lobbyPlayerSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isReady: {
        type: Boolean,
        default: false,
    },
    standoff2Id: {
        type: String,
    },
    inGameName: {
        type: String,
        required: true,
    },
    elo: {
        type: Number,
        default: 1000,
    },
    avatar: {
        type: String,
    },
    team: {
        type: String,
        enum: ["alpha", "bravo", null],
        default: null,
    },
}, { _id: false });
const matchLobbySchema = new mongoose_1.Schema({
    leader: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    lobbyLink: {
        type: String,
        required: true,
    },
    selectedMap: {
        type: String,
        required: true,
    },
    players: {
        type: [lobbyPlayerSchema],
        required: true,
    },
    teamAlpha: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    teamBravo: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    status: {
        type: String,
        enum: Object.values(LobbyStatus),
        default: LobbyStatus.OPEN,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
    allPlayersReady: {
        type: Boolean,
        default: false,
    },
    mapBanPhase: {
        type: Boolean,
        default: false,
    },
    availableMaps: {
        type: [String],
        default: [],
    },
    bannedMaps: {
        type: [String],
        default: [],
    },
    currentBanTeam: {
        type: String,
        enum: ["alpha", "bravo"],
    },
    teamAlphaLeader: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    teamBravoLeader: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    banHistory: {
        type: [
            {
                team: {
                    type: String,
                    enum: ["alpha", "bravo"],
                    required: true,
                },
                map: {
                    type: String,
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        default: [],
    },
}, {
    timestamps: true,
});
matchLobbySchema.index({ status: 1, expiresAt: 1 });
const MatchLobby = mongoose_1.default.model("MatchLobby", matchLobbySchema);
exports.default = MatchLobby;
