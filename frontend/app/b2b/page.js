"use client";

import { useEffect, useState } from "react";
import styles from "./b2b.module.css";

export default function B2BPage() {
    const [activeTab, setActiveTab] = useState("feed");
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Deal Form
    const [dealForm, setDealForm] = useState({ product_name: "", quantity: 1, price_per_unit: 0.0, acc_phone: "", store_name: "My Store (You)" });

    const fetchDeals = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) { window.location.href = "/login"; return; }

        try {
            const res = await fetch("/api/modules/b2b-deals", { headers: { "Authorization": `Bearer ${token}` } });
            if (res.ok) setDeals(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, []);

    const handlePostDeal = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const res = await fetch("/api/modules/b2b-deals", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(dealForm)
        });

        if (res.ok) {
            alert("Deal Broadcasted to 50 retailers!");
            setDealForm({ product_name: "", quantity: 1, price_per_unit: 0.0, acc_phone: "", store_name: "My Store (You)" });
            fetchDeals();
            setActiveTab("feed");
        } else {
            alert("Failed to post deal");
        }
    };

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1>🕸️ StockSwap: Retailer Mesh Network</h1>
                <p>Turn your Dead Stock into Cash. Turn your Competitors into Suppliers.</p>
            </header>

            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === "feed" ? styles.active : ""}`} onClick={() => setActiveTab("feed")}>🛒 Marketplace Feed</button>
                <button className={`${styles.tab} ${activeTab === "post" ? styles.active : ""}`} onClick={() => setActiveTab("post")}>📢 Broadcast Deal</button>
            </div>

            {loading ? <p>Loading...</p> : (
                <>
                    {/* FEED */}
                    {activeTab === "feed" && (
                        <div className={styles.dealsGrid}>
                            <h3 className="section-title">Live Deals from Nearby Stores</h3>
                            {deals.length === 0 ? (
                                <div className="alert alert-info">No active deals. Be the first to post!</div>
                            ) : (
                                deals.map(d => (
                                    <div key={d.id} className={styles.dealCard}>
                                        <div>
                                            <h4 className="font-bold text-lg">{d.product_name}</h4>
                                            <div className="text-secondary text-sm">Seller: {d.store_name}</div>
                                        </div>
                                        <div className="font-bold">{d.quantity} Units</div>
                                        <div className={styles.dealPrice}>₹{d.price_per_unit}/unit</div>
                                        <button
                                            className="btn-secondary"
                                            onClick={() => alert(`Connecting you to ${d.acc_phone}...`)}
                                        >
                                            📞 Contact Seller
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* POST */}
                    {activeTab === "post" && (
                        <div className={styles.formCard}>
                            <h3 className="section-title mb-2">Liquidity Engine</h3>
                            <p className="text-secondary text-sm mb-6">Got excess stock expiring soon? Sell it at cost to other retailers.</p>

                            <form onSubmit={handlePostDeal} className="grid grid-cols-2 gap-4">
                                <div className="form-group col-span-1">
                                    <label className="form-label">Product Name</label>
                                    <input
                                        className="input-field"
                                        value={dealForm.product_name}
                                        onChange={(e) => setDealForm({ ...dealForm, product_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group col-span-1">
                                    <label className="form-label">Quantity</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={dealForm.quantity}
                                        onChange={(e) => setDealForm({ ...dealForm, quantity: parseInt(e.target.value) })}
                                        required
                                        min="1"
                                    />
                                </div>
                                <div className="form-group col-span-1">
                                    <label className="form-label">Price / Unit</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="input-field"
                                        value={dealForm.price_per_unit}
                                        onChange={(e) => setDealForm({ ...dealForm, price_per_unit: parseFloat(e.target.value) })}
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="form-group col-span-1">
                                    <label className="form-label">Your Phone</label>
                                    <input
                                        className="input-field"
                                        value={dealForm.acc_phone}
                                        onChange={(e) => setDealForm({ ...dealForm, acc_phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-span-2 mt-4">
                                    <button type="submit" className="btn-primary w-full">📢 Broadcast Deal</button>
                                </div>
                            </form>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
