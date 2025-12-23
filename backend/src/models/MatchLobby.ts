import mongoose, { Document, Schema } from "mongoose";

export enum LobbyStatus {
  WAITING = "waiting",
  READY_PHASE = "ready_phase",
  ALL_READY = "all_ready",
  CANCELLED = "cancelled",
}

export interface ILobbyPlayer {
  userId: mongoose.Types.ObjectId;
  isReady: boolean;
  standoff2Id?: string;
  inGameName: string;
  elo: number;
  avatar?: string;
}

export interface IMatchLobby extends Document {
  players: ILobbyPlayer[];
  teamAlpha: mongoose.Types.ObjectId[];
  teamBravo: mongoose.Types.ObjectId[];
  status: LobbyStatus;
  createdAt: Date;
  expiresAt: Date;
  allPlayersReady: boolean;
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
  },
  { _id: false }
);

const matchLobbySchema = new Schema<IMatchLobby>(
  {
    players: {
      type: [lobbyPlayerSchema],
      required: true,
      validate: {
        validator: function (val: ILobbyPlayer[]) {
          return val.length === 10;
        },
        message: "Lobby must have exactly 10 players",
      },
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
      default: LobbyStatus.READY_PHASE,
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
  },
  {
    timestamps: true,
  }
);

// Index for efficient lobby queries
matchLobbySchema.index({ status: 1, expiresAt: 1 });

const MatchLobby = mongoose.model<IMatchLobby>("MatchLobby", matchLobbySchema);

export default MatchLobby;

