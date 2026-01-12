"use client";

import { useEffect, useState } from "react";
import styles from "./batches.module.css";

export default function BatchesPage() {
    const [activeTab, setActiveTab] = useState("command");
    const [batches, setBatches] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lookahead, setLookahead] = useState(10);

    // Ingestion Form
    const [batchForm, setBatchForm] = useState({ product_id: "", batch_code: "", expiry_date: "", quantity: 0, cost_price: 0.0 });

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) { window.location.href = "/login"; return; }

        try {
            const [batchRes, prodRes] = await Promise.all([
                fetch("/api/modules/batches", { headers: { "Authorization": `Bearer ${token}` } }),
                fetch("/api/products", { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            if (batchRes.ok) setBatches(await batchRes.json());
            if (prodRes.ok) setProducts(await prodRes.json());
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Logic: Identify Expiring Batches
    const getExpiringBatches = () => {
        const today = new Date();
        return batches.map(b => {
            const expDate = new Date(b.expiry_date);
            const diffTime = expDate - today;
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Matches legacy logic
            let discount = 0;
            if (daysLeft <= 2) discount = 50;
            else if (daysLeft <= 5) discount = 30;
            else if (daysLeft <= 10) discount = 10;

            // Find product for context (price)
            const product = products.find(p => p.id === b.product_id) || {};

            return {
                ...b,
                days_left: daysLeft,
                suggested_discount: discount,
                product_name: product.name || "Unknown",
                current_price: product.price || 0,
                new_price: (product.price || 0) * (1 - discount / 100),
                total_risk: (b.quantity * b.cost_price)
            };
        }).filter(b => b.days_left <= lookahead); // Only return those in storage window
    };

    const expiring = getExpiringBatches();
    const criticalCount = expiring.filter(b => b.days_left <= 2).length;
    const totalRisk = expiring.reduce((acc, curr) => acc + curr.total_risk, 0);

    // Handlers
    const handleIngest = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const res = await fetch("/api/modules/batches", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(batchForm)
        });
        if (res.ok) {
            alert("Batch Ingested!");
            setBatchForm({ product_id: "", batch_code: "", expiry_date: "", quantity: 0, cost_price: 0.0 });
            fetchData();
        } else {
            alert("Failed to ingest batch");
        }
    };

    const handleFlashSale = async (batch) => {
        if (!confirm(`Apply FLASH SALE price ₹${batch.new_price.toFixed(2)} to product ${batch.product_name}?`)) return;

        const token = localStorage.getItem("token");
        // Update product price
        const res = await fetch(`/api/products/${batch.product_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                price: batch.new_price
            })
        });

        if (res.ok) {
            alert(`Price updated! Clear that stock! 💸`);
            fetchData(); // Refresh to see updated current price (though logic recalculates from product list)
        } else {
            alert("Failed to update price");
        }
    };

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1>🍏 FreshFlow: Zero-Waste Engine</h1>
                <p>Automated Expiry Tracking & Dynamic Pricing to eliminate spoilage.</p>
            </header>

            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === "command" ? styles.active : ""}`} onClick={() => setActiveTab("command")}>🚀 Command Center</button>
                <button className={`${styles.tab} ${activeTab === "ingest" ? styles.active : ""}`} onClick={() => setActiveTab("ingest")}>📦 Batch Ingestion</button>
            </div>

            {loading ? <p>Loading...</p> : (
                <>
                    {/* TAB 1: COMMAND CENTER */}
                    {activeTab === "command" && (
                        <div>
                            <div className={styles.sliderContainer}>
                                <label className="font-bold">Lookahead Days: {lookahead}</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    value={lookahead}
                                    onChange={(e) => setLookahead(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <div className={styles.statsRow}>
                                <div className={styles.statCard}>
                                    <div className={styles.statValue}>₹{totalRisk.toFixed(2)}</div>
                                    <div className={styles.statLabel}>Total Stock Value at Risk</div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statValue} style={{ color: 'var(--error-red)' }}>{criticalCount}</div>
                                    <div className={styles.statLabel}>Critical Items (&lt; 48h)</div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statValue}>{expiring.length}</div>
                                    <div className={styles.statLabel}>Batches Flagged</div>
                                </div>
                            </div>

                            <h3 className="section-title mb-4">Actionable Grid</h3>
                            {expiring.length === 0 ? (
                                <div className="alert alert-success">✅ No expiring inventory found in this window. Great job!</div>
                            ) : (
                                <div className={styles.batchGrid}>
                                    {expiring.map(b => (
                                        <div key={b.id} className={styles.batchRow}>
                                            <div>
                                                <h4 className="font-bold">{b.product_name}</h4>
                                                <div className="text-secondary text-sm">Batch: {b.batch_code}</div>
                                            </div>
                                            <div>
                                                <div className={b.days_left <= 2 ? styles.expiryRed : styles.expiryOrange}>
                                                    {b.days_left} Days Left
                                                </div>
                                                <div className="text-secondary text-sm">Exp: {b.expiry_date}</div>
                                            </div>
                                            <div>
                                                <div>Qty: {b.quantity}</div>
                                                <div className="text-secondary text-sm">Cost: ₹{b.cost_price}</div>
                                            </div>
                                            <div className={styles.discountBox}>
                                                <div className="font-bold text-red-600">Recomm: {b.suggested_discount}% OFF</div>
                                                <div>₹{b.current_price} ➝ <strong>₹{b.new_price.toFixed(2)}</strong></div>
                                                {b.suggested_discount > 0 && (
                                                    <button className={styles.flashBtn} onClick={() => handleFlashSale(b)}>
                                                        ⚡ FLASH SALE ({b.suggested_discount}%)
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: INGESTION */}
                    {activeTab === "ingest" && (
                        <div className="flex justify-center">
                            <div className={styles.formCard}>
                                <h3 className="section-title mb-4">📥 Receive New Batch</h3>
                                <form onSubmit={handleIngest}>
                                    <div className="form-group mb-4">
                                        <label className="form-label">Product</label>
                                        <select
                                            className="input-field"
                                            value={batchForm.product_id}
                                            onChange={(e) => setBatchForm({ ...batchForm, product_id: e.target.value })}
                                            required
                                        >
                                            <option value="">-- Select Product --</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles.formGrid}>
                                        <div className="form-group">
                                            <label className="form-label">Batch Code</label>
                                            <input
                                                className="input-field"
                                                value={batchForm.batch_code}
                                                onChange={(e) => setBatchForm({ ...batchForm, batch_code: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Expiry Date</label>
                                            <input
                                                type="date"
                                                className="input-field"
                                                value={batchForm.expiry_date}
                                                onChange={(e) => setBatchForm({ ...batchForm, expiry_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Quantity</label>
                                            <input
                                                type="number"
                                                className="input-field"
                                                value={batchForm.quantity}
                                                onChange={(e) => setBatchForm({ ...batchForm, quantity: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Cost (₹)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="input-field"
                                                value={batchForm.cost_price}
                                                onChange={(e) => setBatchForm({ ...batchForm, cost_price: parseFloat(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-primary w-full mt-4">Ingest Batch</button>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
