"use client";

import { API_BASE_URL } from "../../config/api";

export default function DebugAPI() {
  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>API Configuration Debug</h1>
      <p>
        <strong>API_BASE_URL:</strong> {API_BASE_URL}
      </p>
      <p>
        <strong>NEXT_PUBLIC_API_URL:</strong>{" "}
        {process.env.NEXT_PUBLIC_API_URL || "not set"}
      </p>
      <p>
        <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
      </p>

      <hr />
      <p>Expected in production: https://e-sport-connection.onrender.com</p>
      <p>
        If showing localhost, environment variables are not properly configured.
      </p>
    </div>
  );
}
