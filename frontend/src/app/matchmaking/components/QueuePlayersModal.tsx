"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface QueuePlayer {
  userId: string;
  inGameName: string;
  elo: number;
}

interface QueuePlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: QueuePlayer[];
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

export default function QueuePlayersModal({
  isOpen,
  onClose,
  players,
  buttonRef,
}: QueuePlayersModalProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [isOpen, buttonRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen || !mounted) {
    return null;
  }

  const dropdown = (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 99999,
        backgroundColor: "#1a1a1a",
        borderRadius: "4px",
        padding: "8px",
        minWidth: "180px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      {players.length === 0 ? (
        <div style={{ color: "#999", fontSize: "13px" }}>No players</div>
      ) : (
        players.map((player) => (
          <div
            key={player.userId}
            style={{
              color: "#fff",
              fontSize: "14px",
              padding: "6px 4px",
              borderBottom: "1px solid #333",
            }}
          >
            {player.inGameName}
          </div>
        ))
      )}
    </div>
  );

  return createPortal(dropdown, document.body);
}
