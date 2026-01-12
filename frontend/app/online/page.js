"use client";

import { useState, useEffect } from "react";
import styles from "./online.module.css";

export default function OnlineOrderingPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");

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
            const res = await fetch("http://localhost:8000/modules/online-orders", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = filter === "ALL"
        ? orders
        : orders.filter(o => o.status === filter);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>🛵 Online Orders</h1>
                    <p className={styles.subtitle}>Incoming Web & App Orders Dispatch</p>
                </div>

                <div className={styles.statusFilter}>
                    {['ALL', 'NEW', 'ACCEPTED', 'DISPATCHED'].map(f => (
                        <button
                            key={f}
                            className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            {orders.length === 0 && !loading && (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                    No active orders at the moment.
                </div>
            )}

            <div className={styles.ordersGrid}>
                {filteredOrders.map((order) => (
                    <div key={order.order_id} className={styles.orderCard}>
                        <div className={styles.cardHeader}>
                            <span className={styles.orderId}>{order.order_id}</span>
                            <span className={styles.timeBadge}>{order.time_elapsed_mins} min ago</span>
                        </div>

                        <div className={styles.cardBody}>
                            <div className={styles.customerName}>{order.customer_name}</div>
                            <div className={styles.address}>{order.address}</div>

                            <div className={styles.itemsBox}>
                                {order.items_summary}
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <div className={styles.amount}>₹{order.total_amount}</div>
                            <div className={styles.actions}>
                                {order.status === "NEW" && (
                                    <>
                                        <button className={`${styles.btnAction} ${styles.btnReject}`}>Reject</button>
                                        <button className={styles.btnAction}>Accept</button>
                                    </>
                                )}
                                {order.status === "ACCEPTED" && (
                                    <button className={styles.btnAction}>Dispatch 🛵</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
