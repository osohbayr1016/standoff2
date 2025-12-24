"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Loader2, Copy } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { verificationService } from "../../../services/verificationService";

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentStandoff2Id?: string;
}

export default function VerificationModal({
    isOpen,
    onClose,
    onSuccess,
    currentStandoff2Id = "",
}: VerificationModalProps) {
    const { getToken } = useAuth();
    const [step, setStep] = useState<"input" | "ready" | "verifying" | "success">("input");
    const [standoff2Id, setStandoff2Id] = useState(currentStandoff2Id);
    const [scrapedNickname, setScrapedNickname] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!standoff2Id || cooldown > 0) return;

        setLoading(true);
        setError("");

        // Start Cooldown
        setCooldown(60);
        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        try {
            const token = getToken();
            const res = await verificationService.requestVerification(standoff2Id, token || "");
            if (res.success) {
                setStep("ready");
            } else {
                setError(res.message || "Failed to register ID");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        setError("");
        setStep("verifying");
        try {
            const token = getToken();
            const res = await verificationService.verifyCode(token || "");
            if (res.success) {
                setStep("success");
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            } else {
                setStep("ready");
                setError(res.message || "Nickname mismatch. Check your in-game name.");
            }
        } catch (err) {
            setStep("ready");
            setError("An error occurred during verification.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-md bg-[#1a1d29] border border-orange-500/30 rounded-2xl overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white">Verify Standoff 2 ID</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2 text-red-300 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        {step === "input" && (
                            <form onSubmit={handleRequestCode} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2"> Your Standoff 2 ID </label>
                                    <input
                                        type="text"
                                        value={standoff2Id}
                                        onChange={(e) => setStandoff2Id(e.target.value)}
                                        placeholder="e.g. 87654321"
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !standoff2Id || cooldown > 0}
                                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 text-white font-bold rounded-xl transition-all"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> :
                                        cooldown > 0 ? `Please wait ${cooldown}s` : "Generate Verification Request"}
                                </button>
                            </form>
                        )}

                        {step === "ready" && (
                            <div className="text-center space-y-6">
                                <div className="space-y-4">
                                    <p className="text-gray-300 text-sm">
                                        Your website nickname must **exactly match** your in-game name in Standoff 2.
                                    </p>
                                    <div className="p-4 bg-gray-900 border border-orange-500/20 rounded-xl">
                                        <p className="text-xs text-gray-400 mb-1">Registered ID</p>
                                        <p className="text-xl font-bold text-white">{standoff2Id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleVerify}
                                    disabled={loading}
                                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-600/20"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify Nickname Matching"}
                                </button>
                                <button onClick={() => setStep("input")} className="text-sm text-gray-500 hover:text-gray-300 underline"> Change ID </button>
                            </div>
                        )}

                        {step === "verifying" && (
                            <div className="py-10 text-center space-y-4">
                                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
                                <p className="text-white font-medium">Checking Standoff 2 Store...</p>
                                <p className="text-gray-400 text-sm">This may take up to 30 seconds</p>
                            </div>
                        )}

                        {step === "success" && (
                            <div className="py-10 text-center space-y-4">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                                <h3 className="text-2xl font-bold text-white">Verified!</h3>
                                <p className="text-gray-300">Your account is now linked and your avatar has been synchronized.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
