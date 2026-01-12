"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";

export default function Home() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ products: 0, transactions: 0 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Basic health check/stats fetch
    fetch("/api/health")
      .then(res => res.json())
      .then(data => console.log("System Status:", data.status));

    // Fetch products count (demo)
    fetch("/api/products", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStats(prev => ({ ...prev, products: data.length }));
        }
      })
      .catch(err => console.error("Fetch error:", err));
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logo}>🧠 VyaparMind</div>
        <div className={styles.userProfile}>
          <button onClick={() => { localStorage.removeItem("token"); window.location.reload(); }}>
            Logout
          </button>
        </div>
      </header>

      <section className={styles.hero}>
        <h1>Welcome to Vyapar<span>Mind</span></h1>
        <p>Intelligent control for your retail ecosystem.</p>
      </section>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Total Products</h3>
          <p className={styles.metric}>{stats.products}</p>
          <span className={styles.description}>Items in inventory</span>
        </div>

        <div className={styles.card}>
          <h3>System Status</h3>
          <p className={styles.metric} style={{ color: '#10b981' }}>Healthy</p>
          <span className={styles.description}>All systems operational</span>
        </div>

        <div className={styles.card}>
          <h3>Quick Links</h3>
          <div className={styles.links}>
            <a href="/pos">Point of Sale (POS)</a>
            <a href="/inventory">Inventory Management</a>
            <a href="/dashboard">Analytics Dashboard</a>
          </div>
        </div>
      </div>
    </main>
  );
}
