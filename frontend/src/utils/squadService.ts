import {
  Squad,
  SquadInvitation,
  SquadApplication,
  SquadJoinType,
  SquadInviteRequest,
  SquadInviteResponse,
  SquadApplicationRequest,
  SquadApplicationResponse,
  SquadJoinSettingsUpdate,
} from "../types/squad";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Squad Management
export const createSquad = async (
  squadData: Partial<Squad>,
  token: string
): Promise<Squad> => {
  const response = await fetch(`${API_BASE_URL}/api/squads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(squadData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create squad");
  }

  const data = await response.json();
  return data.squad;
};

export const updateSquad = async (
  squadId: string,
  updateData: Partial<Squad>,
  token: string
): Promise<Squad> => {
  const response = await fetch(`${API_BASE_URL}/api/squads/${squadId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update squad");
  }

  const data = await response.json();
  return data.squad;
};

export const updateSquadJoinSettings = async (
  squadId: string,
  settings: SquadJoinSettingsUpdate,
  token: string
): Promise<{ id: string; joinType: SquadJoinType }> => {
  const response = await fetch(
    `${API_BASE_URL}/api/squads/${squadId}/join-settings`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update join settings");
  }

  const data = await response.json();
  return data.squad;
};

// Squad Invitations
export const invitePlayerToSquad = async (
  squadId: string,
  inviteData: SquadInviteRequest,
  token: string
): Promise<SquadInvitation> => {
  const response = await fetch(`${API_BASE_URL}/api/squads/${squadId}/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(inviteData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send invitation");
  }

  const data = await response.json();
  return data.invitation;
};

export const respondToInvitation = async (
  squadId: string,
  responseData: SquadInviteResponse,
  token: string
): Promise<any> => {
  const response = await fetch(
    `${API_BASE_URL}/api/squads/${squadId}/respond-invitation`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(responseData),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to respond to invitation");
  }

  const data = await response.json();
  return data;
};

export const getSquadInvitations = async (
  squadId: string,
  userId: string,
  token: string
): Promise<SquadInvitation[]> => {
  const response = await fetch(
    `${API_BASE_URL}/api/squads/${squadId}/invitations?userId=${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch invitations");
  }

  const data = await response.json();
  return data.invitations;
};

export const getUserInvitations = async (
  userId: string,
  token: string
): Promise<SquadInvitation[]> => {
  const response = await fetch(
    `${API_BASE_URL}/api/squads/user/${userId}/invitations`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch user invitations");
  }

  const data = await response.json();
  return data.invitations;
};

// Squad Applications
export const applyToSquad = async (
  squadId: string,
  applicationData: SquadApplicationRequest,
  token: string
): Promise<SquadApplication> => {
  const response = await fetch(`${API_BASE_URL}/api/squads/${squadId}/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(applicationData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to submit application");
  }

  const data = await response.json();
  return data.application;
};

export const respondToApplication = async (
  squadId: string,
  responseData: SquadApplicationResponse,
  token: string
): Promise<any> => {
  const response = await fetch(
    `${API_BASE_URL}/api/squads/${squadId}/respond-application`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(responseData),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to respond to application");
  }

  const data = await response.json();
  return data;
};

export const getSquadApplications = async (
  squadId: string,
  userId: string,
  token: string
): Promise<SquadApplication[]> => {
  const response = await fetch(
    `${API_BASE_URL}/api/squads/${squadId}/applications?userId=${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch applications");
  }

  const data = await response.json();
  return data.applications;
};

export const getUserApplications = async (
  userId: string,
  token: string
): Promise<SquadApplication[]> => {
  const response = await fetch(
    `${API_BASE_URL}/api/squads/user/${userId}/applications`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch user applications");
  }

  const data = await response.json();
  return data.applications;
};

// Squad Joining
export const joinSquad = async (
  squadId: string,
  userId: string,
  token: string
): Promise<Squad> => {
  const response = await fetch(`${API_BASE_URL}/api/squads/${squadId}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to join squad");
  }

  const data = await response.json();
  return data.squad;
};

export const leaveSquad = async (
  squadId: string,
  userId: string,
  token: string
): Promise<Squad> => {
  const response = await fetch(`${API_BASE_URL}/api/squads/${squadId}/leave`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to leave squad");
  }

  const data = await response.json();
  return data.squad;
};

// Utility functions
export const canJoinSquad = (squad: Squad): boolean => {
  return squad.isActive && squad.members.length < squad.maxMembers;
};

export const canApplyToSquad = (squad: Squad): boolean => {
  return (
    squad.isActive &&
    squad.members.length < squad.maxMembers &&
    squad.joinType !== SquadJoinType.INVITE_ONLY
  );
};

export const canInviteToSquad = (squad: Squad): boolean => {
  return squad.isActive && squad.members.length < squad.maxMembers;
};

export const getJoinTypeLabel = (joinType: SquadJoinType): string => {
  switch (joinType) {
    case SquadJoinType.INVITE_ONLY:
      return "Invite Only";
    case SquadJoinType.OPEN_FOR_APPLY:
      return "Open for Applications";
    case SquadJoinType.EVERYONE_CAN_JOIN:
      return "Open to Join";
    default:
      return "Unknown";
  }
};

export const getJoinTypeDescription = (joinType: SquadJoinType): string => {
  switch (joinType) {
    case SquadJoinType.INVITE_ONLY:
      return "Only squad leaders can invite players to join";
    case SquadJoinType.OPEN_FOR_APPLY:
      return "Players can apply to join, leaders approve applications";
    case SquadJoinType.EVERYONE_CAN_JOIN:
      return "Anyone can join the squad directly";
    default:
      return "Unknown join type";
  }
};
