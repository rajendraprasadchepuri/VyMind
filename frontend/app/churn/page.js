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
            if (res.ok) {
                const data = await res.json();
                setRisks(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getRiskStyle = (level) => {
        switch (level) {
            case "Critical": return styles.riskCritical;
            case "High": return styles.riskHigh;
            case "Medium": return styles.riskMedium;
            case "Low": return styles.riskLow;
            default: return styles.riskNonActive;
        }
    };

    const criticalCount = risks.filter(r => r.risk_level === "Critical").length;
    const highCount = risks.filter(r => r.risk_level === "High").length;
    const activeCount = risks.filter(r => r.risk_level === "Low" || r.risk_level === "Medium").length;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>🛡️ ChurnGuard</h1>
                    <p className={styles.subtitle}>Customer Retention & Risk Analysis</p>
                </div>
                <div>
                    <button className="btn-primary" onClick={fetchData}>Refresh Analysis</button>
                </div>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statValue} style={{ color: '#dc2626' }}>{criticalCount}</div>
                    <div className={styles.statLabel}>Critical Risk</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue} style={{ color: '#ea580c' }}>{highCount}</div>
                    <div className={styles.statLabel}>High Risk</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue} style={{ color: '#16a34a' }}>{activeCount}</div>
                    <div className={styles.statLabel}>Active Customers</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{risks.length}</div>
                    <div className={styles.statLabel}>Total Database</div>
                </div>
            </div>

            <div className={styles.tableCard}>
                <table>
                    <thead>
                        <tr>
                            <th className={styles.th}>Customer</th>
                            <th className={styles.th}>Last Visit</th>
                            <th className={styles.th}>Days Absent</th>
                            <th className={styles.th}>Total Spend</th>
                            <th className={styles.th}>Risk Level</th>
                            <th className={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {risks.map((r) => (
                            <tr key={r.customer_id}>
                                <td className={styles.td}>
                                    <div style={{ fontWeight: 'bold' }}>{r.customer_name}</div>
                                    <div style={{ fontSize: '0.8em', color: '#64748b' }}>ID: {r.customer_id.substring(0, 8)}</div>
                                </td>
                                <td className={styles.td}>{r.last_visit ? new Date(r.last_visit).toLocaleDateString() : 'Never'}</td>
                                <td className={styles.td}>{r.days_since === 999 ? 'N/A' : r.days_since}</td>
                                <td className={styles.td}>₹{r.total_spend.toLocaleString()}</td>
                                <td className={styles.td}>
                                    <span className={`${styles.riskTag} ${getRiskStyle(r.risk_level)}`}>
                                        {r.risk_level}
                                    </span>
                                </td>
                                <td className={styles.td}>
                                    {r.risk_level === "Critical" || r.risk_level === "High" ? (
                                        <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>Send Promo</button>
                                    ) : <span>-</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
