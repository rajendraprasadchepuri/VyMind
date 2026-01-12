"use client";

import { useState, useEffect } from "react";
import styles from "./voice.module.css";

export default function VoiceAuditPage() {
    const [recording, setRecording] = useState(false);
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState("Ready to audit...");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/modules/voice-logs", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (err) {
            console.error("Error fetching logs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMicClick = () => {
        if (recording) return; // Already recording

        setRecording(true);
        setStatus("Listening... Speak clearly...");

        // Simulate 3 seconds of recording
        setTimeout(() => {
            finishRecording();
        }, 3000);
    };

    const finishRecording = async () => {
        setRecording(false);
        setStatus("Processing audio...");

        // Simulate STT conversion
        const mockTranscripts = [
            "Counted 50 units of Basmati Rice in Aisle 3",
            "Detected low stock for Saffola Gold Oil",
            "Audit complete for Zone B, all items matching",
            "Found damaged overflow in Dairy section",
            "Verify expiry dates for batch #9928",
            "Added 20 units of Detergent to clearance"
        ];
        const randomText = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
        const randomConf = 0.85 + (Math.random() * 0.14);

        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:8000/modules/voice-logs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    transcript: randomText,
                    confidence_score: randomConf,
                    action_extracted: "INVENTORY_AUDIT"
                })
            });

            if (res.ok) {
                setStatus(`Logged: "${randomText}"`);
                fetchLogs(); // Refresh list
            } else {
                setStatus("Error saving log.");
            }
        } catch (err) {
            console.error(err);
            setStatus("Network error.");
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>🎙️ VoiceAudit</h1>
                <p className={styles.subtitle}>Hands-free inventory auditing and logging.</p>
            </header>

            <div className={styles.mainGrid}>
                {/* Left: Mic Interface */}
                <div className={styles.card}>
                    <div className={styles.cardTitle}>Live Input</div>
                    <div className={styles.micSection}>
                        <button
                            className={`${styles.micButton} ${recording ? styles.recording : ''}`}
                            onClick={handleMicClick}
                        >
                            {recording ? '🛑' : '🎙️'}
                        </button>
                        <div className={styles.statusText}>{status}</div>
                    </div>

                    <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>
                        Tip: Click the mic and speak your inventory count or observation.
                    </div>
                </div>

                {/* Right: Logs */}
                <div className={styles.card}>
                    <div className={styles.cardTitle}>Recent Voice Logs</div>
                    <div className={styles.logList}>
                        {logs.length === 0 && !loading && <div style={{ padding: '1rem', color: '#94a3b8' }}>No logs found.</div>}

                        {logs.map((log) => (
                            <div key={log.id} className={`${styles.logItem} ${getConfidenceClass(log.confidence_score, styles)}`}>
                                <div className={styles.logHeader}>
                                    <span>{new Date(log.created_at).toLocaleString()}</span>
                                    <span>{(log.confidence_score * 100).toFixed(0)}% Conf.</span>
                                </div>
                                <div className={styles.logText}>"{log.transcript}"</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function getConfidenceClass(score, styles) {
    if (score > 0.9) return styles.confidenceHigh;
    if (score > 0.7) return styles.confidenceMed;
    return styles.confidenceLow;
}
