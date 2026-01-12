"use client";

import { useState, useEffect } from "react";
import styles from "./churn.module.css";

export default function ChurnGuardPage() {
    const [risks, setRisks] = useState([]);
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
            const res = await fetch("http://localhost:8000/modules/churn-risk", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) {
                console.error(`HTTP error! status: ${res.status}`);
                setLoading(false);
                return;
            }

            const data = await res.json();
            setRisks(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const atRiskCount = risks.length;
    const totalRevenue = risks.reduce((sum, r) => sum + r.total_spend, 0);

    return (
        <div className={styles.container}>
            {/* Title Section */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '600', color: '#262730', marginBottom: '0.5rem' }}>
                    🛡️ ChurnGuard: Retention Autopilot
                </h1>
                <p style={{ color: '#808495', fontSize: '1rem' }}>
                    Identify and win back customers who are slipping away.
                </p>
            </div>

            {/* Metrics Row - 3 Columns */}
            <div className={styles.metricsRow}>
                <div className={styles.metricBox}>
                    <div className={styles.metricLabel}>Revenue at Risk</div>
                    <div className={styles.metricValue}>₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>↓ -12%</div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricLabel}>Customers at Risk</div>
                    <div className={styles.metricValue}>{atRiskCount}</div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricLabel}>Win-Back Opportunity</div>
                    <div className={styles.metricValue} style={{ fontSize: '2rem' }}>High</div>
                </div>
            </div>

            {/* Divider */}
            <hr style={{ border: 'none', borderTop: '1px solid rgba(49, 51, 63, 0.1)', margin: '2rem 0' }} />

            {/* Section Title */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#262730', marginBottom: '1.5rem' }}>
                ⚠️ At-Risk VIPs (Last Seen &gt; 30 Days)
            </h2>

            {/* Customer Cards */}
            {loading ? (
                <div style={{ color: '#808495', textAlign: 'center', padding: '3rem' }}>Loading...</div>
            ) : risks.length === 0 ? (
                <div className={styles.successBox}>
                    ✅ No churn risks detected! Your customers are loyal.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {risks.map((row) => (
                        <div key={row.customer_id} className={styles.customerCard}>
                            <div className={styles.cardGrid}>
                                {/* Column 1: Name & Phone */}
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#262730', marginBottom: '0.25rem' }}>
                                        {row.customer_name}
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: '#808495', margin: 0 }}>
                                        Phone: {row.customer_id.substring(0, 10)}
                                    </p>
                                </div>

                                {/* Column 2: Days Absent */}
                                <div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#262730', marginBottom: '0.5rem' }}>
                                        Days Absent
                                    </div>
                                    <div className={styles.errorBox}>
                                        {row.days_since === 999 ? 'Never' : `${row.days_since} Days`}
                                    </div>
                                </div>

                                {/* Column 3: Total LTV */}
                                <div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#262730', marginBottom: '0.5rem' }}>
                                        Total LTV
                                    </div>
                                    <div style={{ fontSize: '1rem', color: '#262730' }}>
                                        ₹{row.total_spend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </div>
                                </div>

                                {/* Column 4: Action */}
                                <div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#262730', marginBottom: '0.5rem' }}>
                                        Auto-Action
                                    </div>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => alert(`Offer sent to ${row.customer_name}!`)}
                                    >
                                        🚀 Send 'Miss You' Offer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
