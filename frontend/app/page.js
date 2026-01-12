"use client";

import { useEffect, useState } from "react";
import styles from "./home.module.css";

export default function Home() {
  const [stats, setStats] = useState({ products: 0, transactions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Fetch Dashboard Stats
    fetch("http://localhost:8000/dashboard/stats", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setStats({
          products: data.product_count,
          transactions: data.total_sales_count
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.icon}>💬</span> VyaparMind: Intelligent Retail
        </h1>
      </div>

      <div className={styles.welcome}>
        <h2>Welcome to your Retail Management System</h2>
        <p className={styles.subtitle}>Use the sidebar to navigate between modules.</p>
      </div>

      <div className={styles.statusSection}>
        <h3>Quick Status:</h3>
        <div className={styles.statusGrid}>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Total Products</div>
            <div className={styles.statValue}>{stats.products}</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Total Transactions</div>
            <div className={styles.statValue}>{stats.transactions}</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>System Status</div>
            <div className={styles.statValue} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Online <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.infoBox}>
        <span>👍</span> Select Inventory, POS, or Dashboard from the sidebar to begin.
      </div>
    </div>
  );
}
