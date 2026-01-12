"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";

export default function Home() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ products: 0, revenue: 0, sales: 0, lowStock: 0 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Basic health check
    fetch("/api/health")
      .then(res => res.json())
      .then(data => console.log("System Status:", data.status));

    // Fetch Dashboard Stats
    fetch("/api/dashboard/stats", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats({
          products: data.product_count,
          revenue: data.total_revenue,
          sales: data.total_sales_count,
          lowStock: data.low_stock_count
        });
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
          <h3>Total Revenue</h3>
          <p className={styles.metric}>${stats.revenue.toLocaleString()}</p>
          <span className={styles.description}>Lifetime sales</span>
        </div>

        <div className={styles.card}>
          <h3>Total Transactions</h3>
          <p className={styles.metric}>{stats.sales}</p>
          <span className={styles.description}>Completed orders</span>
        </div>

        <div className={styles.card}>
          <h3>Inventory Count</h3>
          <p className={styles.metric}>{stats.products}</p>
          <span className={styles.description}>Products in stock</span>
        </div>

        <div className={styles.card}>
          <h3>Low Stock Alerts</h3>
          <p className={styles.metric} style={{ color: stats.lowStock > 0 ? '#ef4444' : '#10b981' }}>{stats.lowStock}</p>
          <span className={styles.description}>Items needing attention</span>
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
