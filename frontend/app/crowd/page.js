"use client";

import { useEffect, useState } from "react";
import styles from "./crowd.module.css";

export default function CrowdPage() {
    const [activeTab, setActiveTab] = useState("campaigns");
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form
    const [campForm, setCampForm] = useState({ item_name: "", description: "", votes_needed: 20, price_est: 100 });

    const fetchCampaigns = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) { window.location.href = "/login"; return; }

        try {
            const res = await fetch("/api/modules/crowd-campaigns", { headers: { "Authorization": `Bearer ${token}` } });
            if (res.ok) setCampaigns(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const res = await fetch("/api/modules/crowd-campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(campForm)
        });

        if (res.ok) {
            alert("Campaign Launched!");
            setCampForm({ item_name: "", description: "", votes_needed: 20, price_est: 100 });
            fetchCampaigns();
            setActiveTab("campaigns");
        } else {
            alert("Failed to launch campaign");
        }
    };

    const handleVote = async (id) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/modules/crowd-campaigns/${id}/vote`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            alert("Vote Cast! ✋");
            fetchCampaigns();
        } else {
            alert("Failed to vote");
        }
    };

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1>🔮 CrowdStock: Zero-Risk Inventory</h1>
                <p>Launch 'Kickstarter' campaigns for new products. Order only if customers pay first.</p>
            </header>

            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === "campaigns" ? styles.active : ""}`} onClick={() => setActiveTab("campaigns")}>🗳️ Active Campaigns</button>
                <button className={`${styles.tab} ${activeTab === "launch" ? styles.active : ""}`} onClick={() => setActiveTab("launch")}>🚀 Launch New Idea</button>
            </div>

            {loading ? <p>Loading...</p> : (
                <>
                    {/* CAMPAIGNS */}
                    {activeTab === "campaigns" && (
                        <div className={styles.campaignGrid}>
                            <h3 className="section-title">Community Voting</h3>
                            {campaigns.length === 0 ? (
                                <div className="alert alert-info">No active campaigns. Launch one!</div>
                            ) : (
                                campaigns.map(c => {
                                    const progress = Math.min(100, (c.votes_current / c.votes_needed) * 100);
                                    return (
                                        <div key={c.id} className={styles.campaignCard}>
                                            <div>
                                                <h3 className="font-bold text-lg mb-1">{c.item_name}</h3>
                                                <p className="text-secondary mb-2">{c.description}</p>
                                                <div className="badge badge-secondary">Est. Price: ₹{c.price_est}</div>
                                            </div>

                                            <div>
                                                <div className={styles.progressContainer}>
                                                    <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
                                                    <div className={styles.progressText}>{c.votes_current} / {c.votes_needed} Votes</div>
                                                </div>
                                            </div>

                                            <div>
                                                <button
                                                    className="btn-primary w-full"
                                                    onClick={() => handleVote(c.id)}
                                                    disabled={c.votes_current >= c.votes_needed}
                                                >
                                                    {c.votes_current >= c.votes_needed ? "FULL ✅" : "✋ Vote"}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}

                    {/* LAUNCH */}
                    {activeTab === "launch" && (
                        <div className={styles.formCard}>
                            <h3 className="section-title mb-4">Test the Market</h3>

                            <form onSubmit={handleCreate}>
                                <div className="form-group mb-4">
                                    <label className="form-label">Item Name</label>
                                    <input
                                        className="input-field"
                                        placeholder="e.g. Avocado"
                                        value={campForm.item_name}
                                        onChange={(e) => setCampForm({ ...campForm, item_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-4">
                                    <label className="form-label">Pitch</label>
                                    <textarea
                                        className="input-field"
                                        placeholder="Why should people vote?"
                                        rows={3}
                                        value={campForm.description}
                                        onChange={(e) => setCampForm({ ...campForm, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="form-group">
                                        <label className="form-label">Votes Needed</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={campForm.votes_needed}
                                            onChange={(e) => setCampForm({ ...campForm, votes_needed: parseInt(e.target.value) })}
                                            required
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Est. Price (₹)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="input-field"
                                            value={campForm.price_est}
                                            onChange={(e) => setCampForm({ ...campForm, price_est: parseFloat(e.target.value) })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary w-full">🚀 Launch Campaign</button>
                            </form>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
