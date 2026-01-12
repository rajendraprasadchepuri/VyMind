"use client";

import { useState, useEffect } from "react";
import styles from "./shelf.module.css";

export default function ShelfSensePage() {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/modules/shelf-sense", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setInsights(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const expiryRisks = insights.filter(i => i.insight_type === "EXPIRY_RISK");
    const stagnantStock = insights.filter(i => i.insight_type === "STAGNANT_STOCK");

    const getSeverityClass = (sev) => {
        if (sev === "High") return styles.severityHigh;
        if (sev === "Medium") return styles.severityMedium;
        return styles.severityLow;
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>🧬 ShelfSense</h1>
                <p className={styles.subtitle}>AI-Driven Inventory Health & Expiry Management</p>
            </header>

            <div className={styles.grid}>
                {/* Left: Expiry Risks */}
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <span>⚠️ Expiry Alerts</span>
                    </div>
                    {expiryRisks.length === 0 && !loading && <div style={{ color: '#94a3b8' }}>No expiry risks detected.</div>}

                    <div className={styles.insightList}>
                        {expiryRisks.map((item, idx) => (
                            <div key={idx} className={`${styles.insightItem} ${getSeverityClass(item.severity)}`}>
                                <div className={styles.productName}>{item.product_name}</div>
                                <div className={styles.detail}>{item.details}</div>
                                <span className={styles.metricBadge}>{item.metric} Days Left</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Stagnant Stock */}
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <span>🧊 Stagnant Inventory</span>
                    </div>
                    {stagnantStock.length === 0 && !loading && <div style={{ color: '#94a3b8' }}>No stagnant stock detected.</div>}

                    <div className={styles.insightList}>
                        {stagnantStock.map((item, idx) => (
                            <div key={idx} className={`${styles.insightItem} ${getSeverityClass(item.severity)}`}>
                                <div className={styles.productName}>{item.product_name}</div>
                                <div className={styles.detail}>{item.details}</div>
                                <span className={styles.metricBadge}>{item.metric} Units in Stock</span>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>Create Bundle</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
