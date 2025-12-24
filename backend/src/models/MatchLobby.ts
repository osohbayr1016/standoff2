import mongoose, { Document, Schema } from "mongoose";

export enum LobbyStatus {
  OPEN = "open",
  FULL = "full",
  PLAYING = "playing",
  ALL_READY = "all_ready",
  CANCELLED = "cancelled",
  // Backward compatibility
  MAP_BAN_PHASE = "map_ban_phase",
  READY_PHASE = "ready_phase",
  RESULT_SUBMITTED = "result_submitted",
}

export interface ILobbyPlayer {
  userId: mongoose.Types.ObjectId;
  isReady: boolean;
  standoff2Id?: string;
  inGameName: string;
  elo: number;
  avatar?: string;
  team: "alpha" | "bravo" | null;
}

export interface IBanHistory {
  team: "alpha" | "bravo";
  map: string;
  timestamp: Date;
}

export interface IMatchLobby extends Document {
  leader: mongoose.Types.ObjectId;
  lobbyLink: string;
  selectedMap: string;
  players: ILobbyPlayer[];
  teamAlpha: mongoose.Types.ObjectId[];
  teamBravo: mongoose.Types.ObjectId[];
  status: LobbyStatus;
  createdAt: Date;
  expiresAt: Date;
  allPlayersReady: boolean;
  // Chat preservation for reports/investigations
  hasReports?: boolean;
  chatPreservedAt?: Date;
  // Map ban fields (kept for compatibility or future use if needed, but not primary for new flow)
  mapBanPhase: boolean;
  availableMaps: string[];
  bannedMaps: string[];
  currentBanTeam?: "alpha" | "bravo";
  teamAlphaLeader?: mongoose.Types.ObjectId;
  teamBravoLeader?: mongoose.Types.ObjectId;
  banHistory: IBanHistory[];
}

const lobbyPlayerSchema = new Schema<ILobbyPlayer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
  },
  { _id: false }
);

const matchLobbySchema = new Schema<IMatchLobby>(
  {
    leader: {
      type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    teamBravo: [
      {
        type: Schema.Types.ObjectId,
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
    // Map ban fields
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
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    teamBravoLeader: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

// Index for efficient lobby queries
matchLobbySchema.index({ status: 1, expiresAt: 1 });

const MatchLobby = mongoose.model<IMatchLobby>("MatchLobby", matchLobbySchema);

export default MatchLobby;

