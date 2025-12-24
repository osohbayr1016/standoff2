import { API_ENDPOINTS } from "../config/api";

export const verificationService = {
    requestVerification: async (standoff2Id: string, token: string) => {
        const response = await fetch(API_ENDPOINTS.VERIFICATION.REQUEST, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ standoff2Id }),
        });
        return response.json();
    },

    verifyCode: async (token: string) => {
        const response = await fetch(API_ENDPOINTS.VERIFICATION.VERIFY, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        return response.json();
    },
};
